const { createServer } = require('node:http');
const { randomBytes } = require('node:crypto');
const { mkdirSync } = require('node:fs');
const { join } = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });
const database = new DatabaseSync(join(dataDir, 'students.sqlite'));
database.exec(`
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS students (
    sid INTEGER PRIMARY KEY AUTOINCREMENT,
    _id TEXT NOT NULL UNIQUE,
    userName TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    grade TEXT NOT NULL,
    class TEXT NOT NULL,
    Email TEXT NOT NULL
  );
`);

const findAll = database.prepare(`
  SELECT _id, userName, CAST(sid AS TEXT) AS sid, name, department, grade, class, Email
  FROM students ORDER BY sid
`);
const insertOne = database.prepare(`
  INSERT INTO students (_id, userName, name, department, grade, class, Email)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  RETURNING _id, userName, CAST(sid AS TEXT) AS sid, name, department, grade, class, Email
`);
const fields = ['userName', 'name', 'department', 'grade', 'class', 'Email'];

function respond(response, code, message, body = null) {
  response.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ code, message, body }));
}

async function readJson(request) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    bytes += chunk.length;
    if (bytes > 16_384) {
      request.resume();
      throw Object.assign(new Error('JSON body exceeds 16 KB'), { status: 413 });
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = createServer(async (request, response) => {
  const path = request.url.split('?')[0];
  const method = {
    '/api/v1/user/findAll': 'GET',
    '/api/v1/user/insertOne': 'POST'
  }[path];

  if (!method) return respond(response, 404, 'Endpoint not found');
  if (request.method !== method) {
    response.setHeader('Allow', method);
    return respond(response, 405, 'Method not allowed');
  }

  try {
    if (method === 'GET') return respond(response, 200, 'find success', findAll.all());

    const type = request.headers['content-type']?.split(';')[0].trim().toLowerCase();
    if (type !== 'application/json') {
      return respond(response, 415, 'Content-Type must be application/json');
    }

    const input = await readJson(request);
    const values = fields.map(field => typeof input?.[field] === 'string' ? input[field].trim() : '');
    if (values.some(value => !value || value.length > 254)) {
      return respond(response, 400, 'Provide all six fields as strings of 1 to 254 characters');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[5])) {
      return respond(response, 400, 'Email is invalid');
    }

    const student = insertOne.get(randomBytes(12).toString('hex'), ...values);
    return respond(response, 200, '', student);
  } catch (error) {
    if (error.status === 413) return respond(response, 413, error.message);
    if (error instanceof SyntaxError) return respond(response, 400, 'Invalid JSON');
    if (error.errcode === 2067 && error.message.includes('students.userName')) {
      return respond(response, 409, 'userName already exists');
    }
    console.error(error);
    return respond(response, 500, 'Internal server error');
  }
});

const port = Number(process.env.PORT ?? 8877);
server.listen(port, '127.0.0.1', () => {
  console.log(`StudentHub API running at http://localhost:${server.address().port}`);
});

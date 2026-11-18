import express from 'express'
import {router} from "./Routers"
import { logger } from './middlewares/log';
const http = require('http');
import cors from 'cors';
import { resolve } from 'node:path';
import { connectStudentHub } from './utils/MongoDB';
import { studentsModel } from './orm/schemas/studentSchemas';
require('dotenv').config()
const app: express.Application = express()
const server = http.createServer(app);

app.use(cors({
  // "origin": "https://sec.ethci.app",
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 200,
  "exposedHeaders": ['Content-Disposition']
}))

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({ extended: false }))
app.use('/assets', express.static(resolve(process.env.assetsPath ?? '../FrontEndExample/dist/assets')));

for (const route of router) {
  app.use(route.getRouter())
}

async function start() {
  await connectStudentHub();
  await studentsModel.init();
  const port = Number(process.env.PORT ?? 8877);
  server.listen(port, '127.0.0.1', () => {
    logger.info(`StudentHub API listening at http://127.0.0.1:${port}`);
    console.log(`StudentHub API listening at http://127.0.0.1:${port}`);
  });
}

start().catch(() => {
  console.error('StudentHub startup failed. Check the MongoDB configuration and students collection.');
  process.exit(1);
});

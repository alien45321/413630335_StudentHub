import 'dotenv/config';
import { connect } from 'mongoose';

export function connectStudentHub() {
    const host = process.env.DBHOST ?? '127.0.0.1';
    const port = process.env.DBPORT ?? '27017';
    const dbName = process.env.DBNAME ?? 'studenthub';
    const username = process.env.DBUSER;
    const password = process.env.DBPASSWORD;

    if (Boolean(username) !== Boolean(password)) {
        throw new Error('Set both DBUSER and DBPASSWORD.');
    }

    return connect(`mongodb://${host}:${port}/`, {
        dbName,
        authSource: process.env.DBAUTHSource ?? dbName,
        user: username || undefined,
        pass: password || undefined,
        serverSelectionTimeoutMS: 5000,
    });
}

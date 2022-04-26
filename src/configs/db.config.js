const mongoose = require('mongoose');
const { mongoDB } = require('./env.config');

const URI = `mongodb://${mongoDB.username}:${mongoDB.password}@${mongoDB.host}:${mongoDB.port}/${mongoDB.databaseName}?authSource=${mongoDB.authSource}`;

const newConnection = (uri) => {
  const conn = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 3000,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  conn.on('connected', () => {
    console.log('MongoDB connected');
  });

  conn.on('error', (err) => {
    console.log('MongoDB error', err);
  });

  conn.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  process.on('SIGINT', async () => {
    await conn.close();
    process.exit(0);
  });

  return conn;
};

const connectToMongoLocal = newConnection(URI);

module.exports = { connectToMongoLocal };

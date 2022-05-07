const app = require('./src/api/v1/app');
const https = require('https');
const { port } = require('./src/configs/env.config');
const {
  normalizePort,
  onError,
  onListening,
} = require('./src/configs/port.config');
const fs = require('fs');
const path = require('path');
/**
 * Get port from environment and store in Express.
 */
const PORT = normalizePort(port || appPort);
app.set('port', PORT);

/**
 * Create HTTP server.
 */

const server = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, './src/configs/ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, './src/configs/ssl/cert.pem')),
  },
  app
);

/**
 * Listen on provided port, on all network interfaces.
 */

app.on('ready', () => {
  server.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
  });
});
server.on('error', (error) => onError(error, PORT));
server.on('listening', () => onListening(server));

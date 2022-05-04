const app = require('./src/api/v1/app');
const http = require('http');
const { port } = require('./src/configs/env.config');
const {
  normalizePort,
  onError,
  onListening,
} = require('./src/configs/port.config');

/**
 * Get port from environment and store in Express.
 */
const PORT = normalizePort(port || appPort);
app.set('port', PORT);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

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

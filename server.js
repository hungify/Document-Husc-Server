const app = require('./src/api/v1/app');
const https = require('https');
const { port } = require('./src/configs/env.config');
const {
  normalizePort,
  onError,
  onListening,
} = require('./src/configs/port.config');
const fs = require('fs');
const { Server } = require('socket.io');
const initSocket = require('./src/api/v1/services/chat.service');
const { whitelist } = require('./src/configs/cors.config');
/**
 * Get port from environment and store in Express.
 */
const PORT = normalizePort(port || 9999);
app.set('port', PORT);

/**
 * Create HTTP server.
 */

const httpsServer = https.createServer(
  {
    key: fs.readFileSync('./security/localhost.key'),
    cert: fs.readFileSync('./security/localhost.crt'),
  },
  app
);

const io = new Server(httpsServer, {
  cors: {
    origin: whitelist,
    methods: ['GET', 'POST', 'OPTIONS'],
  },
});

initSocket(io);

/**
 * Listen on provided port, on all network interfaces.
 */

app.on('ready', () => {
  httpsServer.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
  });
});
httpsServer.on('error', (error) => onError(error, PORT));
httpsServer.on('listening', () => onListening(httpsServer));

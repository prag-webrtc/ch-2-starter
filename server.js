'use strict';

// Load up necessary modules
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const io = require('socket.io')();
// Create an Express app
const app = express();
// Set up a few conveniences:
// Log activity to the console
app.use(logger('dev'));
// Serve static files from the `public/` directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch 404 errors and forward them to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// Handle errors with the error handler
app.use(function(err, req, res, next) {
  // Set the error code
  res.status(err.status || 500);
  // Respond with a static error page (404 or 500)
  res.sendFile(`error/${err.status}.html`, { root: path.join(__dirname, 'public')});
});

/*
  The main monkey business:
  Signaling with the socket server, Socket.io
*/

const namespaces = io.of(/^\/[0-9]{7}$/);

namespaces.on('connect', function(socket) {

  const namespace = socket.nsp;
  console.log(`Socket namespace: ${namespace.name}`);

  socket.broadcast.emit('new connected peer');

  socket.on('signal', function({ description, candidate }) {
    socket.broadcast.emit('signal', { description, candidate });
  });

  socket.on('disconnect', function() {
    namespace.emit('new disconnected peer');
  });

});

/*
  End of the main monkey business.
*/

// Export the Express app and Socket.io instances for use in /bin/www
module.exports = {app, io};

require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup with permissive CORS
const io = new Server(server, {
  cors: { origin: true, methods: ['GET', 'POST'] },
});
app.set('io', io);

// Socket.io real-time connection handler
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });

  socket.on('exercise_update', (data) => {
    socket.to(`user_${data.userId}`).emit('exercise_update', data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Start listener only when run directly (not when required by Vercel serverless functions)
const PORT = process.env.PORT || 5000;
if (require.main === module || !process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=========================================================`);
    console.log(`  DiaFit AI Server running on port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  API: http://localhost:${PORT}/api/v1`);
    console.log(`  LAN Web App: http://10.189.225.89:${PORT}`);
    console.log(`  APK Download: http://10.189.225.89:${PORT}/diafit-ai.apk`);
    console.log(`=========================================================\n`);
  });
}

module.exports = { app, server };

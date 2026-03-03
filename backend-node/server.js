require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
});

app.set('io', io);

io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) {
        socket.join(userId);
        console.log(`🔌 User ${userId} connected`);
    }
    socket.on('disconnect', () => console.log(`🔌 Socket ${socket.id} disconnected`));
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'lexguard-node-api' }));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` }));

app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ success: false, message: 'File too large.' });
    if (err.message?.includes('Only PDF')) return res.status(415).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 LexGuard Node API running on http://localhost:${PORT}`));
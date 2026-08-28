const express = require('express');
const cors = require('cors');
const env = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://docu-mind-ai-orpin.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DocuMind API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DocuMind AI' });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;
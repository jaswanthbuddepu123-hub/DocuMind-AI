const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DocuMind AI' });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./sequelize');
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');

const app = express();
const PORT = process.env.APP_PORT || 8050;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

app.get('/api/v1', (req, res) => res.json({ message: 'Hello from backend!' }));

app.use('/api/v1', authRoutes);
app.use('/api/v1/movies', movieRoutes);

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
});

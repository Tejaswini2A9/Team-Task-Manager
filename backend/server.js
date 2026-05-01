const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import central model registry (loads all models + associations once)
const { sequelize } = require('./models');

const authRoutes         = require('./routes/authRoutes');
const projectRoutes      = require('./routes/projectRoutes');
const taskRoutes         = require('./routes/taskRoutes');
const teamRoutes         = require('./routes/teamRoutes');
const ticketRoutes       = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth',          authRoutes);
app.use('/api/projects',      projectRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/teams',         teamRoutes);
app.use('/api/tickets',       ticketRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

// Start server immediately so Railway / local dev never gets 502 on a slow DB sync
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

sequelize.sync({ alter: true })
  .then(() => console.log('Database synced successfully'))
  .catch(err => console.error('Database sync error (server still running):', err.message));

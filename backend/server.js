const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route to serve the frontend index.html for SPA
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
});

const PORT = process.env.PORT || 5000;

console.log('Connecting to database...');
sequelize.sync().then(() => {
  console.log('Database connected and synced');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Database connection error:', err);
});

# Team Task Manager

A comprehensive full-stack project management application built with Node.js, Express, React, and MySQL.

## 🚀 Features

- **Authentication & Authorization**: Secure login and signup with JWT and role-based access control (Admin vs. Member).
- **Interactive Dashboard**: Visual breakdown of task statuses, user productivity charts, and upcoming deadline countdowns.
- **Task Management**: Create, update, delete, and track tasks with priority levels, due dates, and assignees.
- **Team Collaboration**: Manage teams, assign team leaders, and track progress across team members.
- **Project Tracking**: Organize tasks under specific projects for better organization.
- **Notification System**: Real-time alerts for task updates and system notifications.
- **Responsive Design**: Modern, premium UI built with Tailwind CSS that works on all devices.
- **Production Ready**: Optimized for deployment on platforms like Railway, with a unified server serving both API and Frontend.

## 🛠️ Tech Stack

### Backend
- **Node.js & Express 5**: Modern server-side logic and routing.
- **Sequelize ORM**: Database management and migrations for MySQL.
- **JWT & Bcryptjs**: Secure authentication and password hashing.
- **Dotenv**: Environment variable management.

### Frontend
- **React 19 & Vite**: High-performance frontend development.
- **Tailwind CSS**: Premium styling and responsive layouts.
- **Recharts**: Beautiful data visualizations and charts.
- **React Icons**: Comprehensive icon set for a modern feel.
- **Axios**: Efficient API communication with proxy support.

## 📁 Project Structure

```text
Team-Task-Manager/
├── backend/                # Express Server
│   ├── config/             # Database connection settings
│   ├── controllers/        # Business logic for routes
│   ├── middleware/         # Auth and validation middleware
│   ├── models/             # Sequelize database models
│   ├── routes/             # API endpoint definitions
│   ├── utils/              # Utility functions
│   └── server.js           # Entry point & production serving logic
├── frontend/               # Vite + React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state (Auth Context)
│   │   ├── pages/          # Page-level components
│   │   └── App.jsx         # Routing and main structure
│   └── vite.config.js      # Proxy and build configuration
├── .gitignore              # Ignored files (node_modules, .env, etc.)
├── Procfile                # Railway deployment instructions
└── package.json            # Root workspace configuration
```

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tejaswini2A9/Team-Task-Manager.git
   cd Team-Task-Manager
   ```

2. **Install Dependencies**:
   ```bash
   # From the root directory
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL=mysql://user:pass@host:port/db
   JWT_SECRET=your_jwt_secret
   ```

4. **Run Locally**:
   ```bash
   # Start Backend (on port 5000)
   cd backend
   npm start

   # Start Frontend (on port 5173)
   cd ../frontend
   npm run dev
   ```

## 🌐 Deployment

This project is configured for **Railway**. It uses a unified deployment strategy where the backend server builds and serves the frontend static files.

- **Build Command**: `npm run build` (Builds the React app)
- **Start Command**: `npm start` (Starts the Express server)

## 📄 License

This project is licensed under the ISC License.

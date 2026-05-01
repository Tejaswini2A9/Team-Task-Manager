# Team-Task-Manager

A comprehensive full-stack application designed to streamline team collaboration, project management, and task tracking. The Team-Task-Manager enables teams to organize their workflows efficiently, track tasks, and maintain strong security through an integrated OTP-based authentication system.

## 🚀 Features

- **Advanced Authentication:** 
  - Secure registration and login flows.
  - **Two-Factor Authentication (2FA)** via Nodemailer OTP. Verification codes are required during both registration and login phases to prevent unauthorized access.
  - Role-based access control with distinct privileges for **Admins** and **Members**.
- **Project & Task Management:**
  - Create and manage complex projects.
  - Assign tasks to team members with tracking for deadlines, estimated times, and completion statuses.
- **Team Collaboration:**
  - Build dynamic teams, view member profiles, and monitor task progression.
- **Ticketing System:** 
  - Integrated support ticketing to track issues or blockers across projects.
- **Reporting & Notifications:** 
  - Comprehensive dashboards to track overdue tasks, completion ratios, and recent updates.
  - Real-time notifications for task assignments and deadline alerts.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Bootstrapped with Vite)
- **Tailwind CSS** (For modern, responsive, and highly customizable UI)
- **Context API** (State management for Authentication and global states)
- **React Router** (Client-side routing)

### Backend
- **Node.js & Express.js** (Robust and scalable RESTful API)
- **Sequelize ORM** (For object-relational mapping)
- **MySQL** (Relational Database)
- **Authentication & Security:** 
  - JSON Web Tokens (JWT) for session management.
  - Bcrypt.js for password hashing.
  - `express-rate-limit` for API endpoint abuse prevention.
  - Nodemailer for handling outbound OTP emails.

---

## 📂 Project Structure

```text
Team-Task-Manager/
├── backend/                  # Server-side code (Express & Node.js)
│   ├── config/               # Database and server configurations
│   ├── controllers/          # Business logic for all routes
│   ├── middleware/           # Auth and Role protection layers
│   ├── models/               # Sequelize Data Models (User, Task, Project, etc.)
│   ├── routes/               # Express API endpoints
│   ├── utils/                # Helper utilities (e.g., Nodemailer sendEmail)
│   └── server.js             # Backend entry point
│
└── frontend/                 # Client-side code (React & Vite)
    ├── src/
    │   ├── assets/           # Static assets (images, icons)
    │   ├── components/       # Reusable React components (UI elements)
    │   ├── context/          # Global State providers (AuthContext)
    │   ├── pages/            # View Pages (Dashboard, Login, Signup, Tasks, etc.)
    │   ├── App.jsx           # Main App Component
    │   └── main.jsx          # React DOM entry point
    ├── tailwind.config.js    # Tailwind configuration
    └── vite.config.js        # Vite bundler configuration
```

---

## 💻 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v16+ recommended)
- [MySQL Server](https://www.mysql.com/)

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` folder and add the following configuration variables:
   ```env
   PORT=5000
   DATABASE_URL=mysql://<username>:<password>@<host>:<port>/<database_name>
   JWT_SECRET=your_super_secret_jwt_key

   # SMTP Configuration (Nodemailer for OTPs)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```
4. Start the backend server:
   ```bash
   npm start
   # The database will automatically sync, and the server will start on port 5000.
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser (typically `http://localhost:5173/`).

---

## 🔒 Security Practices

- **Password Protection**: Passwords are never stored in plain text.
- **OTP Verification**: Crucial actions (Login, Registration) are verified asynchronously via short-lived, single-use email OTPs.
- **Rate Limiting**: OTP generation and verification endpoints are safeguarded against brute-force attacks via sliding window IP rate limiters.
- **Role Isolation**: Strictly defined admin and member middleware limits data mutations to authorized personnel only.

---

## 📝 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

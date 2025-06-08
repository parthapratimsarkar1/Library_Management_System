**✅ Project Setup & Run Instructions**

This guide explains how to run the project locally using **npm run dev:all** which launches both the frontend (React + Vite) and backend (Node.js + Express) concurrently.

🔧 Prerequisites
Make sure you have the following installed:

Node.js (v18+ recommended)

npm (comes with Node.js)

PostgreSQL (Ensure it's installed and running)

**📁 Project Structure Overview**

pgsql
Copy
Edit
NetEnrich/
│
├── backend/              ← Node.js + Express + PostgreSQL backend
│   ├── backend/          ← Contains server.js, routes, controllers, models
│   └── package.json
│
├── frontend/             ← React + Vite frontend (optional if separate)
│
├── .env                  ← Environment variables (DB config, ports, etc.)
├── tsconfig.json         ← TypeScript config (if using TS)
├── package.json          ← Contains root-level scripts

**🚀 Step-by-Step to Run Locally**

**1️⃣ Clone the Project (if needed)**

bash
Copy
Edit
git clone https://github.com/your-username/Library_Management_System.git
cd Library_Management_System

**2️⃣ Install Dependencies**

From root project directory:

bash
Copy
Edit
npm install
cd backend
npm install
This installs all required packages for both frontend and backend.


**3️⃣ Setup PostgreSQL Database**

Create a database manually using a tool like pgAdmin or psql CLI (e.g., library_db)

Update your .env file in the root or /backend with the following:

env
Copy
Edit
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_pg_user
DB_PASSWORD=your_pg_password
DB_NAME=library_db
PORT=5000
Ensure that your database is running before starting the server.


**4️⃣ Start the Project**

From the root folder, simply run:

bash
Copy
Edit
npm run dev:all
This script uses concurrently to run:

Frontend (Vite): http://localhost:5173

Backend (Express API): http://localhost:5000


**✅ Console Output Should Show:**


arduino
Copy
Edit
[1] Database connected successfully
[1] Server running on port 5000
[0] VITE ready at http://localhost:5173
🧪 Sample API Endpoints
Here are some sample endpoints you can test using Postman:


**📘 Books**

GET /api/books – List all books with optional filters

POST /api/books – Add new book

PUT /api/books/:id – Update book

DELETE /api/books/:id – Delete book


**👤 Students**

GET /api/students – List/filter/search students

POST /api/students – Add new student


**🔄 Book Issue/Return**

POST /api/issues – Issue book

PUT /api/issues/:id/return – Return book

GET /api/issues/student/:studentId – List books issued by student

**📌 Notes**

Make sure ports 5173 (frontend) and 5000 (backend) are free.

Use .env to configure ports and DB settings as needed.

Database tables are auto-initialized on server startup.

# G6077 - Lovejoy's Secure Antique Evaluation Application

## 🛡️ Project Overview

This is a project I made to refine my security skills and practices. The application is a secure Minimum Viable Product (MVP) for an antique dealer, focused entirely on robust security features.

The project is built on a **decoupled architecture** consisting of:

* **Frontend (Client):** React, Vite, TypeScript, and Tailwind CSS.
* **Backend (API):** Python, Flask, and SQLite (for local development).

### Key Security Features Implemented:

* **Secure Authentication:** User registration and login using industry-standard **JSON Web Tokens (JWTs)**.
* **Password Security:** Passwords stored using the **bcrypt** hashing algorithm with salting.
* **Password Policy:** Implemented on **both the frontend (recommendation)** and **backend (strict enforcement)**.
* **Role-Based Access Control (RBAC):** An administrative role is required to access the central list of evaluation requests.
* **Vulnerability Mitigation:** Protection against **SQL Injection** (using SQLAlchemy ORM) and **Insecure Direct Object Reference (IDOR)** (by checking user ownership).
* **Secure File Handling:** Photo uploads are secured by sanitizing filenames, assigning **UUIDs**, and validating file extensions.
* **Secure Environment:** Use of **environment variables** (`.env`) for storing the JWT secret key.

---

## 🚀 How to Run the Project Locally

The application runs using two separate local servers. Follow these steps to set up and run both the API and the Frontend.

### Prerequisites

You must have **Node.js/npm** and **Python 3.x** installed.

### 1. Backend Setup (Python API)

Navigate to the `backend/` directory in your terminal.

1.  **Activate Virtual Environment:**
    ```bash
    # Windows
    py -m venv venv
    .\venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    # If you didn't create requirements.txt yet, run:
    # pip install flask flask-sqlalchemy flask-bcrypt flask-cors flask-jwt-extended python-dotenv
    ```

3.  **Prepare Environment:**
    * Ensure the `.env` file is present and configured with `JWT_SECRET_KEY="<your-secret>"`.
    * Create the `uploads` directory: `mkdir uploads`

4.  **Initialize Database:**
    ```bash
    # Set the Flask application file
    set FLASK_APP=app  # or export FLASK_APP=app on Mac/Linux
    
    # Run the database creation command
    flask shell
    # >>> from app import db
    # >>> db.create_all()
    # >>> exit()
    ```

5.  **Start the Backend Server:**
    ```bash
    flask run
    # API server will run at [http://127.0.0.1:5000/](http://127.0.0.1:5000/)
    ```

### 2. Frontend Setup (React App)

Open a **SECOND terminal** and navigate to the `frontend/` directory.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Frontend Server:**
    ```bash
    npm run dev
    # Frontend will run at http://localhost:5173/ (or similar)
    ```

The frontend will automatically communicate with the running backend API.

---

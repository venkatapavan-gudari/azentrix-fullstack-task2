# Mini Trello - Multi-User Task Management System

A production-ready, lightweight Kanban board task management system ("Mini Trello") built for remote teams to collaborate on projects. The application features secure role-based controls, MySQL persistence, and real-time STOMP WebSockets for instant, zero-refresh task synchronizations.

---

## 🛠️ Tech Stack

- **Backend**: Spring Boot 3.2.5, Spring Security (JWT), Spring Data JPA, MySQL, Spring STOMP WebSockets, Lombok.
- **Frontend**: React (Vite), React Router, Axios, Lucide React, HTML5 Drag-and-Drop, CSS Custom Properties.

---

## 🔑 Default Login Credentials
The system automatically seeds initial demo data on database boot if no users are present:

*   **Administrator Account**:
    *   **Email**: `admin@trello.com`
    *   **Password**: `password`
*   **Member Account**:
    *   **Email**: `member@trello.com`
    *   **Password**: `password`

---

## 🚀 How to Run Manually

Follow these step-by-step instructions to get both servers up and running on your local machine.

### 1. 🗄️ Database Setup
Before starting the backend, make sure you have **MySQL** running locally.
1. The backend automatically creates the `trello_db` database if it does not exist using the JDBC connection query parameter: `createDatabaseIfNotExist=true`.
2. By default, it expects a MySQL server at `localhost:3306` with credentials:
   - **Username**: `root`
   - **Password**: `klu123`

> [!NOTE]
> If you have a different MySQL username or password, you can set the environment variables `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` before starting, or edit them in:
> [backend/src/main/resources/application.properties](file:///c:/Users/PAVAN/Desktop/Azentrix/Multi-User-Task-Management-System/backend/src/main/resources/application.properties)

---

### 2. ☕ Run Backend (Spring Boot)
Open a terminal in the project root folder and execute:

```powershell
# Navigate into backend directory
cd backend

# Option A: Run directly from source code
mvn spring-boot:run

# Option B: Package and run compiled jar
mvn clean package -DskipTests
java -jar target/mini-trello-0.0.1-SNAPSHOT.jar
```

The backend server will launch and listen on **`http://localhost:8080`**.

---

### 3. ⚛️ Run Frontend (React + Vite)
Open a second terminal window in the project root folder and execute:

```powershell
# Navigate into frontend directory
cd frontend

# Install package dependencies
npm install

# Start local development server
npm run dev
```

The development server will boot in milliseconds and serve the UI at **`http://localhost:5173`**.

---

## 🎯 Features & Roles

### 🧑‍💼 Admin (e.g. `admin@trello.com`)
*   Create new Project Boards.
*   Manage user accounts (view and delete users).
*   Assign members to boards.
*   Create, edit, move, or delete *any* task on any board.

### 🧑‍💻 Member (e.g. `member@trello.com`)
*   View boards they are explicitly assigned to by an Admin.
*   Create new tasks.
*   Edit, move (drag-and-drop), or delete **their own tasks** (tasks created by them or assigned to them).
*   *Cannot* view or modify other members' tasks.
*   *Cannot* view the Admin panel or create boards.

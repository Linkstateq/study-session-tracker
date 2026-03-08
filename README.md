# Study Session Tracker

## Project Overview

The Study Session Tracker is a web application that helps students log
and analyse their study sessions. Users can record the subject studied,
duration, date, and productivity level of each session.

The goal of the application is to help students reflect on their study
habits and understand how their study time is distributed across
subjects.

This project was developed as part of the course:

Project Java and Web Development (DLBCSPJWD01)  
IU International University of Applied Sciences

---

## Features

The application includes the following features:

- Add a new study session
- Edit an existing session
- Delete a study session
- Track study duration per subject
- Assign productivity rating
- View total study hours
- View total number of sessions
- View average productivity
- Display study analytics using charts
- Responsive interface for desktop and mobile devices

---

## Technology Stack

### Frontend
- React (Vite)
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- SQLite

The frontend communicates with the backend through REST API requests.

---

## Application Architecture

The application follows a client–server architecture:

Frontend (React)  
↓  
Backend API (Node.js + Express)  
↓  
Database (SQLite)

The frontend sends HTTP requests to the backend.  
The backend processes the requests and stores or retrieves data from the database.

---

# Quick Start

Clone the repository and run both the backend and frontend.

```bash
git clone https://github.com/Linkstateq/study-session-tracker.git
cd study-session-tracker


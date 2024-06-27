# Conference Room Booking

## Table of Contents
- [Project Description](#project-description)
- [Technologies](#technologies)
- [Features](#features)
- [Running the Project](#running-the-project)
- [Configuration](#configuration)

## Project Description
The Conference Room Booking application allows users to browse available rooms, check their availability, and make reservations. The project is built using the MERN stack, which includes MongoDB for the database, Express.js and Node.js for the server, and React.js for the frontend.

## Technologies
- **MongoDB**: NoSQL database.
- **Express.js**: Framework for Node.js to create the server and API.
- **React.js**: Library for building the user interface.
- **Node.js**: JavaScript runtime environment for the server side.

## Features
- User registration and login
- Browsing available conference rooms
- Checking room availability for specific dates
- Making reservations
- Admin management of reservations

## Running the Project
1. **Backend**
    - Navigate to the backend directory:
      ```bash
      cd server
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Create a `.env` file in the backend directory and add the following environment variables:
      ```
      MONGO_URI=your_mongodb_uri
      JWT_SECRET=your_jwt_secret
      PORT=5000
      ```
    - Start the server:
      ```bash
      npm start
      ```

2. **Frontend**
    - Navigate to the frontend directory:
      ```bash
      cd client
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Create a `.env` file in the frontend directory and add the following environment variables:
      ```
      REACT_APP_API_URL=http://localhost:5000
      ```
    - Start the application:
      ```bash
      npm start
      ```

## Configuration
1. **MongoDB**: Ensure you have MongoDB installed. You can use MongoDB Atlas to host your database in the cloud.
2. **Environment Variables**: Configure the appropriate environment variables in the `.env` files.

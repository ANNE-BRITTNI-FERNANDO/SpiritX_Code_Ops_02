# Spirit11 - Fantasy Cricket Platform

A modern fantasy cricket platform built with MERN stack that allows users to create teams, participate in matches, and track player statistics.

## Tech Stack

- **Frontend:**
  - React.js (v19.0.0)
  - Material-UI (v6.4.7)
  - Socket.io Client (v4.8.1)

- **Backend:**
  - Node.js with Express.js (v4.21.2)
  - MongoDB with Mongoose (v8.12.1)
  - Socket.io (v4.8.1)
  - JSON Web Token for authentication
  - Google's Generative AI integration

## Prerequisites

- Node.js (LTS version recommended)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spirit11
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named 'Spirit11'
   - The application will automatically create required collections

4. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/Spirit11
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key
   PORT=5001
   CLIENT_URL=http://localhost:3000
   ```

5. **Seed the Database**
   ```bash
   npm run seed
   node scripts/updatePlayerStats.js
   ```
   This will populate the database with initial player data.

## Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```
   This will start both the frontend (port 3000) and backend (port 5001) servers concurrently.

2. **Frontend Only**
   ```bash
   npm start
   ```
   Access the application at http://localhost:3000

3. **Backend Only**
   ```bash
   npm run server
   ```
   The API server will run on http://localhost:5001

## Features

- User authentication and authorization
- Real-time match updates using Socket.io
- Player statistics tracking and analysis
- Team creation and management
- Admin dashboard for player stats management
- AI-powered insights using Google's Generative AI

## Assumptions and Design Decisions

1. **Database:**
   - MongoDB is used for flexible schema design and scalability
   - Local MongoDB instance is preferred for development

2. **Authentication:**
   - JWT-based authentication with token expiration
   - Secure password hashing using bcryptjs

3. **Real-time Updates:**
   - Socket.io for live match updates and notifications
   - Client-server synchronization for real-time data

4. **Team Selection Constraint**
    - Upto 5 Batsman, 4 Bowlers, 2 All-Roundersand a Wicket Keeper (Optional) can be selected.

## Additional Features

1. **AI Integration:**
   - Integrated Google's Generative AI for match insights
   - Smart player recommendations

2. **Admin Controls:**
   - Comprehensive admin dashboard
   - Player statistics management
   - Real-time data updates


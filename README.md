# Public Opinion App

This is a full-stack application that allows users to answer multiple-choice questions, save their answers along with their location, and view other users' answers based on proximity.

## Technologies Used

*   **Frontend:** React, Vite, TypeScript, Tailwind CSS
*   **Backend:** Vercel Edge Functions (Node.js, TypeScript)
*   **Database:** PostgreSQL (Vercel Postgres)

## Setup and Installation

Follow these steps to set up and run the application locally.

### 1. Database Setup (Vercel Postgres)

1.  **Create a Vercel Account:** If you don't have one, sign up at [vercel.com](https://vercel.com/).
2.  **Create a New Project:** In your Vercel dashboard, create a new project.
3.  **Add a Postgres Database:** Go to the "Storage" tab in your project settings and add a new Postgres database. Vercel will provide you with a `DATABASE_URL`.
4.  **Apply Schema:** Once your database is created, you need to apply the schema. You can use a tool like `psql` or any PostgreSQL client to connect to your database using the `DATABASE_URL` and run the SQL commands from `database.sql` (located in the root of the `public-opinion-app` directory).

    ```bash
    psql YOUR_VERCEL_DATABASE_URL -f database.sql
    ```
    Replace `YOUR_VERCEL_DATABASE_URL` with the `DATABASE_URL` provided by Vercel.

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd public-opinion-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend application will typically run on `http://localhost:5173` (or another available port).

### 3. Vercel Edge Functions (Backend)

Since the backend is now composed of Vercel Edge Functions, there's no separate server to run locally. When you deploy to Vercel, these functions will be automatically deployed.

For local development, Vercel CLI can simulate the environment:

1.  **Install Vercel CLI:**
    ```bash
    npm i -g vercel
    ```
2.  **Login to Vercel:**
    ```bash
    vercel login
    ```
3.  **Run Vercel Dev:** From the `public-opinion-app` directory:
    ```bash
    vercel dev
    ```
    This will start a local development server that serves both your frontend and your API routes.

## Usage

1.  Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173` or the URL provided by `vercel dev`).
2.  Click "Start Questionnaire" to answer the questions.
3.  Allow location access when prompted.
4.  After submitting your answers, you will be redirected to the results page where you can see answers from other users near your location.

## Deployment

This application is designed to be deployed on Vercel.

1.  **Connect your Git Repository:** Connect your project's Git repository to Vercel.
2.  **Configure Project Settings:**
    *   **Root Directory:** Set the root directory to `public-opinion-app`.
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
    *   **Environment Variables:** Add your `DATABASE_URL` as an environment variable in Vercel.
3.  **Deploy:** Vercel will automatically detect the frontend (Vite) and the API routes (in the `api` directory) and deploy them.

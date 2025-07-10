# DLQ Simulator

This project demonstrates a Dead Letter Queue (DLQ) mechanism with incremental retries using Kafka, Node.js, and React.

## Features

- Simulate message processing with success and failure scenarios.
- Incremental retry mechanism (2s, 4s, 6s delays).
- Messages move to a Dead Letter Queue (DLQ) after exhausting retries.
- Real-time visualization of messages moving through different queues.
- Toggle to control message failure simulation.

## Prerequisites

- Docker (for running Kafka)
- Node.js and npm (for backend and frontend)

## Setup and Run

1.  **Start Kafka:**
    Navigate to the project root directory in your terminal and run:
    ```bash
    docker-compose up -d
    ```
    This will start Kafka and Zookeeper in the background.

2.  **Start the Backend:**
    Open a new terminal, navigate to the `backend` directory, and install dependencies:
    ```bash
    cd backend
    npm install
    npm start
    ```
    The backend server will start on `http://localhost:3001`.

3.  **Start the Frontend:**
    Open another new terminal, navigate to the `frontend` directory, and install dependencies:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    The frontend development server will start on `http://localhost:5173` (or another available port).

4.  **Access the Application:**
    Open your web browser and go to `http://localhost:5173`.

## Usage

-   Enter a message in the input field and click "Send Message" to send it to the main queue.
-   Observe the message moving through the different queues (main, retry-2s, retry-4s, retry-6s, dlq, success).
-   Use the "Simulate Failure" toggle:
    -   **ON (default):** Messages will fail at each processing step and eventually land in the DLQ.
    -   **OFF:** Messages will succeed at the first processing step and move to the success queue.

## Environment Variables

This project does not currently use `.env` files for configuration, but if you were to add sensitive information or environment-specific settings, you would typically place them in `.env` files. These files are ignored by Git to prevent sensitive data from being committed to version control.

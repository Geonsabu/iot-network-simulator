# IoT Network Communication Simulator

A software-based IoT network simulation platform that models communication between virtual sensors, a gateway, and a server while simulating network delay and packet loss.

The system provides real-time packet monitoring, network topology visualization, performance metrics, and simulation history through a web-based dashboard.

---

## Features

* Virtual IoT sensors for temperature, humidity, light, and pressure
* Automatic packet generation with unique packet IDs
* Configurable network delay
* Configurable packet loss
* Two-stage network communication:

  * Sensor → Gateway
  * Gateway → Server
* Packet loss location tracking
* Real-time packet updates using Socket.IO
* Interactive network topology visualization
* Delivery rate calculation
* Average latency calculation
* Simulation history
* MongoDB persistence
* Multiple predefined network scenarios
* REST API for simulation control and data access

---

## System Architecture

```text
Virtual Sensors
       │
       ▼
┌─────────────────┐
│    Network 1    │
│ Delay + Loss    │
└────────┬────────┘
         │
         ▼
     Gateway
         │
         ▼
┌─────────────────┐
│    Network 2    │
│ Delay + Loss    │
└────────┬────────┘
         │
         ▼
      Server
         │
         ▼
     MongoDB
         │
         ▼
   React Dashboard
```

---

## Technology Stack

### Frontend

* React
* Vite
* CSS
* Recharts
* React Flow
* Socket.IO Client

### Backend

* Node.js
* Express.js
* Socket.IO
* Mongoose

### Database

* MongoDB Atlas

### Communication

* REST API
* WebSocket communication through Socket.IO

---

## Project Structure

```text
iot-network-simulator/
│
├── README.md
├── .gitignore
│
├── backend/
│   ├── models/
│   │   ├── PacketModel.js
│   │   └── SimulationModel.js
│   │
│   ├── sensor.js
│   ├── packet.js
│   ├── network.js
│   ├── gateway.js
│   ├── serverNode.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── NetworkTopology.jsx
    │   └── ...
    │
    ├── package.json
    └── ...
```

---

# Installation & Setup

Follow the steps below to run the project locally.

## 1. Prerequisites

Make sure the following are installed before starting.

### Node.js and npm

The frontend and backend are both built using JavaScript/Node.js.

Install Node.js from the official Node.js website.

After installation, open a terminal and verify:

```bash
node --version
```

and:

```bash
npm --version
```

You should see version numbers for both commands.

> npm is installed automatically with Node.js.

### Git

Git is required to clone the project repository.

Verify Git installation:

```bash
git --version
```

If Git is not installed, install it before continuing.

### MongoDB Atlas

The project uses MongoDB Atlas to store packet and simulation history.

You need:

* A MongoDB Atlas account
* A MongoDB cluster
* A database user
* A MongoDB connection string
* Your current IP address added to the Atlas network access list

---

## 2. Clone the Repository

Open a terminal and navigate to the location where you want to store the project.

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Then enter the project directory:

```bash
cd iot-network-simulator
```

You should now see:

```text
backend/
frontend/
README.md
.gitignore
```

---

## 3. Backend Setup

The backend contains the IoT simulation logic, REST APIs, Socket.IO communication, and MongoDB integration.

Open a terminal in the project root and run:

```bash
cd backend
```

Install the backend dependencies:

```bash
npm install
```

This reads the `package.json` file and installs all required Node.js packages into the `node_modules` directory.

### Configure Environment Variables

Inside the `backend` folder, create a file named:

```text
.env
```

Add:

```env
MONGO_URI=your_mongodb_connection_string
```

Replace `your_mongodb_connection_string` with your actual MongoDB Atlas connection string.

For example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>
```

Do **not** commit this file to GitHub.

The `.gitignore` file is configured to prevent `.env` from being uploaded.

### MongoDB Atlas Network Access

If MongoDB refuses the connection, open MongoDB Atlas and check:

**Security → Network Access**

Add the public IP address of the computer running the backend.

For local development, your current public IP must be allowed to connect to the cluster.

---

## 4. Start the Backend

From the `backend` directory:

```bash
npm start
```

The backend should start on:

```text
http://localhost:5000
```

You should see a message similar to:

```text
Server running on http://localhost:5000
```

The backend terminal should remain open while using the application.

---

## 5. Frontend Setup

Open a **new terminal**.

Do not stop the backend.

From the project root, navigate to the frontend:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

This installs React, Vite, React Flow, Recharts, Socket.IO Client, and the other packages listed in `package.json`.

---

## 6. Start the Frontend

From the `frontend` directory, run:

```bash
npm run dev
```

Vite will start the React development server.

You should see an address similar to:

```text
Local: http://localhost:5173/
```

Open the displayed URL in your browser.

---

## 7. Running the Complete Application

The backend and frontend must run simultaneously.

### Terminal 1 — Backend

```bash
cd iot-network-simulator/backend
npm start
```

Backend:

```text
http://localhost:5000
```

### Terminal 2 — Frontend

```bash
cd iot-network-simulator/frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

The overall communication is:

```text
Browser
   │
   ▼
React Frontend
   │
   │ REST API / Socket.IO
   ▼
Node.js Backend
   │
   ├── IoT Simulation
   ├── Gateway
   ├── Network Simulation
   └── Server
   │
   ▼
MongoDB Atlas
```

---

## 8. Running a Simulation

Once the dashboard is open:

1. Select a simulation scenario.
2. Apply the scenario configuration.
3. Run the simulation.
4. Virtual sensors generate readings.
5. Packets are created and transmitted.
6. Network delay and packet loss are applied.
7. Successfully delivered packets reach the server.
8. Packet information is sent to the dashboard in real time.
9. Simulation results are stored in the database.

Each simulation run generates one packet from each configured sensor.

---

## 9. Available Simulation Scenarios

### Normal

```text
Sensor → Gateway
Delay: 500 ms
Packet Loss: 20%

Gateway → Server
Delay: 300 ms
Packet Loss: 10%
```

### High Delay

```text
Sensor → Gateway
Delay: 1500 ms
Packet Loss: 10%

Gateway → Server
Delay: 1000 ms
Packet Loss: 5%
```

### High Loss

```text
Sensor → Gateway
Delay: 500 ms
Packet Loss: 50%

Gateway → Server
Delay: 300 ms
Packet Loss: 40%
```

---

## 10. Dashboard Metrics

The dashboard provides several metrics for analyzing the simulated network:

* Total packets
* Delivered packets
* Lost packets
* Delivery rate
* Average latency
* Packet status
* Packet loss location
* Simulation history

---

## API Endpoints

| Method | Endpoint                  | Description                            |
| ------ | ------------------------- | -------------------------------------- |
| GET    | `/api/simulate`           | Runs the IoT packet simulation         |
| GET    | `/api/packets`            | Returns packets received by the server |
| POST   | `/api/simulation/config`  | Updates simulation configuration       |
| POST   | `/api/simulation/history` | Saves simulation results               |
| GET    | `/api/simulation/history` | Retrieves simulation history           |

---

## Real-Time Communication

Socket.IO is used to transmit packet updates from the backend to the React dashboard.

The flow is:

```text
Backend
   │
   │ Socket.IO
   ▼
React Dashboard
```

This allows packet information to appear on the dashboard while the simulation is running.

---

## Database

MongoDB Atlas is used for persistent storage.

The project uses Mongoose models for:

* Packet data
* Simulation history

The MongoDB connection is configured through the `MONGO_URI` environment variable.

---

## Packet Flow

A typical successfully delivered packet follows:

```text
Sensor
   ↓
Network 1
   ↓
Gateway
   ↓
Network 2
   ↓
Server
   ↓
MongoDB
   ↓
Dashboard
```

If a packet is lost, the system records where the loss occurred:

```text
Sensor → Gateway
```

or:

```text
Gateway → Server
```

---

## Common Setup Issues

### MongoDB connection error

Check:

* MongoDB Atlas cluster is running
* `MONGO_URI` is correct
* Database username and password are correct
* Your IP address is allowed in MongoDB Atlas
* Internet connection is available

### Frontend cannot connect to backend

Make sure the backend is running:

```bash
npm start
```

and that it is available at:

```text
http://localhost:5000
```

Then restart the frontend:

```bash
npm run dev
```

### `npm` or `node` is not recognized

Verify Node.js installation:

```bash
node --version
npm --version
```

If these commands do not work, reinstall Node.js and make sure it is added to the system PATH.

### Port already in use

If port `5000` is already being used, stop the previous backend process before starting the server again.

---

## Environment Variables

The backend requires:

```env
MONGO_URI=your_mongodb_connection_string
```

For security:

* Never commit `.env`
* Never publish database credentials
* Never share your MongoDB password publicly

A safe example file can be created as:

```text
backend/.env.example
```

with:

```env
MONGO_URI=your_mongodb_connection_string
```

---

## Future Enhancements

* MQTT protocol integration
* Additional IoT device types
* Multiple gateways
* Advanced network topologies
* Packet retransmission
* More detailed analytics
* Authentication and authorization
* Cloud deployment
* Integration with physical IoT devices

---

## Academic Project

This project was developed as an academic IoT and computer-network simulation project to demonstrate the behavior of IoT communication under different network conditions.

It combines concepts from:

* Internet of Things
* Computer Networks
* Backend Development
* Frontend Development
* Real-Time Communication
* Database Systems
* Data Visualization

---

## License

This project is intended for academic and educational purposes.

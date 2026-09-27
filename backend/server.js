
const express = require("express");
const cors = require("cors");

const VirtualSensor = require("./sensor");
const Packet = require("./packet");
const NetworkSimulator = require("./network");
const Gateway = require("./gateway");
const ServerNode = require("./serverNode");
const SimulationModel = require("./models/SimulationModel");

require("dotenv").config();

const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const PacketModel = require("./models/packetModel");

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

app.use(cors());
app.use(express.json());


// -----------------------------
// Socket.IO Connection
// -----------------------------

io.on("connection", (socket) => {

    console.log(
        "Dashboard connected:",
        socket.id
    );

    socket.on("disconnect", () => {

        console.log(
            "Dashboard disconnected:",
            socket.id
        );

    });

});


// -----------------------------
// Virtual Sensors
// -----------------------------

const sensors = [

    new VirtualSensor(
        "S001",
        "192.168.1.10",
        "temperature"
    ),

    new VirtualSensor(
        "S002",
        "192.168.1.11",
        "humidity"
    ),

    new VirtualSensor(
        "S003",
        "192.168.1.12",
        "light"
    ),

    new VirtualSensor(
        "S004",
        "192.168.1.13",
        "pressure"
    )

];


// -----------------------------
// Gateway
// -----------------------------

const gateway = new Gateway(
    "GW001",
    "192.168.1.1"
);


// -----------------------------
// Network Simulator
// -----------------------------

// Sensor → Gateway
const network = new NetworkSimulator(
    "Sensor → Gateway",
    500,
    0.80
);


// Gateway → Server
const gatewayNetwork = new NetworkSimulator(
    "Gateway → Server",
    300,
    0.20
);


// -----------------------------
// Server Node
// -----------------------------

const serverNode = new ServerNode(
    "SRV001",
    "192.168.1.100"
);


// -----------------------------
// Simulation Endpoint
// -----------------------------
app.post("/api/simulation/history", async (req, res) => {
    try {
        const simulation = await SimulationModel.create(req.body);

        res.json({
            message: "Simulation history saved",
            simulation: simulation
        });

    } catch (error) {
        console.error(
            "Failed to save simulation history:",
            error
        );

        res.status(500).json({
            message: "Failed to save simulation history"
        });
    }
});
app.get("/api/simulation/history", async (req, res) => {
    try {
        const history = await SimulationModel
            .find()
            .sort({ _id: -1 });

        res.json(history);

    } catch (error) {
        console.error(
            "Failed to fetch simulation history:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch simulation history"
        });
    }
});
app.post("/api/simulation/config", (req, res) => {
    const {
        sensorGatewayDelay,
        sensorGatewayLoss,
        gatewayServerDelay,
        gatewayServerLoss
    } = req.body;

    network.delay = Number(sensorGatewayDelay);
    network.packetLossRate =
        Number(sensorGatewayLoss) / 100;

    gatewayNetwork.delay =
        Number(gatewayServerDelay);

    gatewayNetwork.packetLossRate =
        Number(gatewayServerLoss) / 100;

    console.log("Simulation configuration updated");

    console.log(
        "Sensor → Gateway:",
        network.delay,
        "ms,",
        network.packetLossRate * 100,
        "% loss"
    );

    console.log(
        "Gateway → Server:",
        gatewayNetwork.delay,
        "ms,",
        gatewayNetwork.packetLossRate * 100,
        "% loss"
    );

    res.json({
        message: "Simulation configuration updated",

        sensorGateway: {
            delay: network.delay,
            packetLoss:
                network.packetLossRate * 100
        },

        gatewayServer: {
            delay: gatewayNetwork.delay,
            packetLoss:
                gatewayNetwork.packetLossRate * 100
        }
    });
});
app.get("/api/simulate", async (req, res) => {

    const results = [];
    const startTime = Date.now();
    for (const sensor of sensors) {

        // -----------------------------
        // Generate sensor reading
        // -----------------------------

        const reading =
            sensor.generateReading();


        // -----------------------------
        // Create packet
        // -----------------------------

        const packet =
            new Packet(reading);

        console.log(
            `${packet.packetId} created by ${packet.deviceId}`
        );


        // -----------------------------
        // Network 1
        // Sensor → Gateway
        // -----------------------------

        const transmittedPacket =
            await network.transmit(packet);


        // -----------------------------
        // Packet lost before Gateway
        // -----------------------------

        if (
            transmittedPacket.status === "LOST"
        ) {

            console.log(
                `Packet ${transmittedPacket.packetId} lost between Sensor and Gateway`
            );

            // Send final status to React
            io.emit(
                "packet",
                transmittedPacket
            );

            results.push(
                transmittedPacket
            );

            continue;
        }


        // -----------------------------
        // Gateway receives packet
        // -----------------------------

        const gatewayReceived =
            gateway.receivePacket(
                transmittedPacket
            );


        if (!gatewayReceived) {

            transmittedPacket.status =
                "LOST";

            io.emit(
                "packet",
                transmittedPacket
            );

            results.push(
                transmittedPacket
            );

            continue;
        }


        // -----------------------------
        // Network 2
        // Gateway → Server
        // -----------------------------

        const serverPacket =
            await gatewayNetwork.transmit(
                transmittedPacket
            );


        // -----------------------------
        // Packet lost between Gateway
        // and Server
        // -----------------------------

        if (
            serverPacket.status === "LOST"
        ) {

            console.log(
                `Packet ${serverPacket.packetId} lost between Gateway and Server`
            );

            // Send final status to React
            io.emit(
                "packet",
                serverPacket
            );

            results.push(
                serverPacket
            );

            continue;
        }


        // -----------------------------
        // Gateway forwards to Server
        // -----------------------------

        gateway.forwardPacket(
            serverPacket,
            serverNode
        );


        // -----------------------------
        // Server processes packet
        // -----------------------------

        serverNode.processPacket(
            serverPacket
        );


     serverPacket.latency =
       Date.now() - serverPacket.createdAt;


        // -----------------------------
        // Save packet to MongoDB
        // -----------------------------

        await PacketModel.create(
            serverPacket
        );

        console.log(
            `${serverPacket.packetId} saved to MongoDB`
        );


        // -----------------------------
        // Send final packet to React
        // -----------------------------

        io.emit(
            "packet",
            serverPacket
        );


        // -----------------------------
        // Store result
        // -----------------------------

        results.push(
            serverPacket
        );

    }


    // -----------------------------
    // Response
    // -----------------------------

    res.json({

        gateway: {
            id: gateway.gatewayId,
            ip: gateway.ipAddress
        },

        packets: results

    });
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

});


// -----------------------------
// Get Packets
// -----------------------------

app.get("/api/packets", (req, res) => {

    res.json({

        count:
            serverNode.receivedPackets.length,

        packets:
            serverNode.receivedPackets

    });

});


// -----------------------------
// MongoDB Connection
// -----------------------------

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log(
            "MongoDB connected"
        );

    })
    .catch((error) => {

        console.log(
            "MongoDB connection failed:",
            error.message
        );

    });


// -----------------------------
// Start Server
// -----------------------------

const PORT = 5000;

httpServer.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);


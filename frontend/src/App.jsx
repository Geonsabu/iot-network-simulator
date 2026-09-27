import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import NetworkTopology from "./NetworkTopology";
import "./App.css";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";
const socket = io("http://localhost:5000");

function App() {
    const [packets, setPackets] = useState([]);
    const [scenario, setScenario] = useState("normal");
    const [simulationHistory, setSimulationHistory] = useState([]);
   

    // -----------------------------
    // Packet Statistics
    // -----------------------------
const scenarios = {
    normal: {
        delay: 500,
        packetLoss: 20,
        gatewayDelay: 300,
        gatewayPacketLoss: 10
    },

    highDelay: {
        delay: 1500,
        packetLoss: 10,
        gatewayDelay: 1000,
        gatewayPacketLoss: 5
    },

    highLoss: {
        delay: 500,
        packetLoss: 50,
        gatewayDelay: 300,
        gatewayPacketLoss: 40
    }
};
    const totalPackets = packets.length;

    const deliveredPackets = packets.filter(
        (packet) => packet.status === "DELIVERED"
    ).length;

    const lostPackets = packets.filter(
        (packet) => packet.status === "LOST"
    ).length;

    const deliveryRate =
        totalPackets === 0
            ? 0
            : ((deliveredPackets / totalPackets) * 100).toFixed(1);
    const deliveredPacketsWithLatency = packets.filter(
    (packet) =>
        packet.status === "DELIVERED" &&
        packet.latency !== undefined
);

    const averageLatency =
    deliveredPacketsWithLatency.length === 0
        ? 0
        : (
            deliveredPacketsWithLatency.reduce(
                (total, packet) => total + packet.latency,
                0
            ) / deliveredPacketsWithLatency.length
        ).toFixed(1);

    const packetStatusData = [
    {
        name: "Delivered",
        value: deliveredPackets
    },
    {
        name: "Lost",
        value: lostPackets
    }
];
   
    // -----------------------------
    // Socket.IO + Existing Packets
    // -----------------------------
const applyScenario = async () => {
    const config = scenarios[scenario];

    try {
        const response = await fetch(
            "http://localhost:5000/api/simulation/config",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sensorGatewayDelay: config.delay,
                    sensorGatewayLoss: config.packetLoss,
                    gatewayServerDelay: config.gatewayDelay,
                    gatewayServerLoss: config.gatewayPacketLoss
                })
            }
        );

        const data = await response.json();

        console.log("Scenario applied:", data);
    } catch (error) {
        console.error(
            "Failed to apply scenario:",
            error
        );
    }
};

const runSimulation = async () => {
    console.log("RUN BUTTON CLICKED");

    try {
        const response = await fetch(
            "http://localhost:5000/api/simulate"
        );

        if (!response.ok) {
            throw new Error(
                `Simulation failed with status ${response.status}`
            );
        }

        const data = await response.json();

        console.log("Simulation result:", data);

        const historyEntry = {
            scenario: scenario,
            totalPackets: data.packets.length,

            delivered: data.packets.filter(
                (packet) => packet.status === "DELIVERED"
            ).length,

            lost: data.packets.filter(
                (packet) => packet.status === "LOST"
            ).length,

            latency: averageLatency,
            deliveryRate: deliveryRate,
            time: new Date().toLocaleTimeString()
            
        };

        setSimulationHistory((previousHistory) => [
            ...previousHistory,
            historyEntry
        ]);
   const historyResponse = await fetch(
    "http://localhost:5000/api/simulation/history",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(historyEntry)
    }
);

const historyData = await historyResponse.json();

console.log(
    "History save response:",
    historyResponse.status,
    historyData
);
        console.log("History updated:", historyEntry);

    } catch (error) {
        console.error(
            "Simulation failed:",
            error
        );
    }
};
    useEffect(() => {
        // Socket.IO connection
        socket.on("connect", () => {
            console.log(
                "Connected to backend:",
                socket.id
            );
        });

        // Receive new packets in real time
        socket.on("packet", (packet) => {
            console.log(
                "Received live packet:",
                packet
            );

            setPackets((previousPackets) => [
                ...previousPackets,
                packet
            ]);
        });

        // Socket connection error
        socket.on("connect_error", (error) => {
            console.error(
                "Socket connection error:",
                error.message
            );
        });

        // Load packets already stored in backend
        fetch("http://localhost:5000/api/packets")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `HTTP error: ${response.status}`
                    );
                }

                return response.json();
            })
            .then((data) => {
                console.log(
                    "Existing packets:",
                    data.packets
                );

                setPackets(data.packets);
            })
            .catch((error) => {
                console.error(
                    "Error fetching packets:",
                    error
                );
            });
            
      fetch("http://localhost:5000/api/simulation/history")
    .then((response) => response.json())
    .then((data) => {
        console.log("Saved simulation history:", data);

        setSimulationHistory(data);
    })
    .catch((error) => {
        console.error(
            "Error fetching simulation history:",
            error
        );
    });
        // Cleanup
        return () => {
            socket.off("connect");
            socket.off("packet");
            socket.off("connect_error");
        };
    }, []);

    // -----------------------------
    // UI
    // -----------------------------

    return (
        <div>
            <h2>Network Topology</h2>

            <NetworkTopology config={scenarios[scenario]} packets={packets} />
        <h2>Simulation Scenario</h2>

    <select
    value={scenario}
    onChange={(event) =>
        setScenario(event.target.value)
    }
    >
    <option value="normal">
        Normal Network
    </option>

    <option value="highDelay">
        High Delay
    </option>

    <option value="highLoss">
        High Packet Loss
    </option>
    </select>
<button onClick={applyScenario}>
    Apply Scenario
</button>
<br />
<button onClick={runSimulation}>
    Run Simulation
</button>
<h2>Simulation Controls</h2>
            <h1>IoT Network Simulator</h1>

            {/* Summary Cards */}
           < div className="summary-cards">

            <div className="summary-card">
                <h3>Total Packets</h3>
                <p>{totalPackets}</p>
            </div>

            <div className="summary-card">
                <h3>Delivered</h3>
                <p>{deliveredPackets}</p>
            </div>
            <br />

            <div className="summary-card">
                <h3>Lost</h3>
                <p>{lostPackets}</p>
            </div>

            <div className="summary-card">
                <h3>Delivery Rate</h3>
                <p>{deliveryRate}%</p>
            </div>

            {/* Live Packets */}
            
             <div className="summary-card">
              <h3>Average Latency</h3>
              <p>{averageLatency} ms</p>
   
            </div>
            </div>

<table>
    <thead>
        <tr>
            <th>Packet ID</th>
            <th>Device</th>
            <th>Sensor</th>
            <th>Value</th>
            <th>Status</th>
            <th>Loss Location</th>
            <th>Latency</th>
            <th>Timestamp</th>
            
        </tr>
    </thead>

    <tbody>
        {packets.map((packet) => (
            <tr key={packet.packetId}>
                <td>{packet.packetId}</td>
                <td>{packet.deviceId}</td>
                <td>{packet.sensorType}</td>
                <td>{packet.value}</td>
                <td>{packet.status}</td>
                <td>{packet.status === "LOST"? packet.lostAt: "-"}</td>
                <td>
                  {packet.latency
                    ? `${packet.latency} ms`
                    : "-"}
                </td>
                <td>
                    {new Date(packet.timestamp).toLocaleTimeString()}
                </td>
            </tr>
        ))}
    </tbody>
</table>
    
     <h2>Packet Delivery Status</h2>

<PieChart width={400} height={300}>
    <Pie
        data={packetStatusData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
    >
        {packetStatusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? "#22c55e" : "#ef4444"} />
            
             
        ))}
    </Pie>

    <Tooltip />
    <Legend />
</PieChart>
<h2>Simulation History</h2>

<table>
    <thead>
        <tr>
            <th>Scenario</th>
            <th>Total Packets</th>
            <th>Delivered</th>
            <th>Lost</th>
            <th>Average Latency</th>
            <th>Delivery Rate</th>
            <th>Time</th>
        </tr>
    </thead>

    <tbody>
        {simulationHistory.map((history, index) => (
            <tr key={index}>
                <td>{history.scenario}</td>
                <td>{history.totalPackets}</td>
                <td>{history.delivered}</td>
                <td>{history.lost}</td>
                <td>{history.latency} ms</td>
                <td>{history.deliveryRate}%</td>
                <td>{history.time}</td>
            
            </tr>
        ))}
    </tbody>
</table>
        </div>
    );
}

export default App;


import { useEffect, useState } from "react";
import {
    ReactFlow,
    Background,
    Controls
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

function NetworkTopology({config, packets}) {
    const latestPacket = packets?.[packets.length - 1];
    const [packetPosition, setPacketPosition] = useState({
    x: 0,
    y: 50
});
    const packetLabel = latestPacket
    ? `${latestPacket.packetId} - ${latestPacket.status}`
    : "No packet";
  

    const nodes = [
    {
        id: "s1",
        position: { x: 0, y: 0 },
        data: { label: "S001\nTemperature" }
    },
    {
        id: "s2",
        position: { x: 0, y: 100 },
        data: { label: "S002\nHumidity" }
    },
    {
        id: "s3",
        position: { x: 0, y: 200 },
        data: { label: "S003\nLight" }
    },
    {
        id: "s4",
        position: { x: 0, y: 300 },
        data: { label: "S004\nPressure" }
    },
    {
        id: "gateway",
        position: { x: 350, y: 150 },
        data: { label: "Gateway" }
    },
    {
        id: "server",
        position: { x: 700, y: 150 },
        data: { label: "Server" }
    },
   {
    id: "network1",
    position: { x: 180, y: 150 },
    data: {
        label: `Network 1\n${config.delay} ms | ${config.packetLoss}% Loss`
    }
},
{
    id: "network2",
    position: { x: 520, y: 150 },
    data: {
        label: `Network 2\n${config.gatewayDelay} ms | ${config.gatewayPacketLoss}% Loss`
    }
},
{
    id: "packet",
    position: packetPosition,
   data: {
    label: latestPacket?.status === "LOST"
        ? `${packetLabel}\nLost at: ${latestPacket.lostAt}`
        : packetLabel
}
},
];
   const edges = [
    {
        id: "s1-network",
        source: "s1",
        target: "network1"
    },
    {
        id: "s2-network",
        source: "s2",
        target: "network1"
    },
    {
        id: "s3-network",
        source: "s3",
        target: "network1"
    },
    {
        id: "s4-network",
        source: "s4",
        target: "network1"
    },
    {
        id: "network1-gateway",
        source: "network1",
        target: "gateway"
    },
    {
        id: "gateway-network2",
        source: "gateway",
        target: "network2"
    },
    {
        id: "network2-server",
        source: "network2",
        target: "server"
    }
];
useEffect(() => {
    if (!latestPacket) return;

 let positions = [
    { x: 0, y: 50 },
    { x: 180, y: 50 },
    { x: 350, y: 50 },
    { x: 520, y: 50 },
    { x: 700, y: 50 }
];

if (latestPacket.status === "LOST") {

    if (latestPacket.lostAt === "Sensor → Gateway") {
        positions = positions.slice(0, 2);
    }

    if (latestPacket.lostAt === "Gateway → Server") {
        positions = positions.slice(0, 4);
    }
}

    let step = 0;

    const interval = setInterval(() => {
        setPacketPosition(positions[step]);

        step++;

        if (step >= positions.length) {
            clearInterval(interval);
        }
    }, 500);

    return () => clearInterval(interval);

}, [latestPacket]);
    return (
        <div style={{ width: "100%", height: "400px" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}

export default NetworkTopology;
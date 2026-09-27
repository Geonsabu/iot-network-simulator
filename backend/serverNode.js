class ServerNode {
    constructor(serverId, ipAddress) {
        this.serverId = serverId;
        this.ipAddress = ipAddress;
        this.receivedPackets = [];
    }

    receivePacket(packet) {
        if (packet.status === "DELIVERED") {
            this.receivedPackets.push(packet);

            console.log(
                `Server received ${packet.packetId} from ${packet.deviceId}`
            );

            return true;
        }

        console.log(
            `Server did not receive ${packet.packetId}`
        );

        return false;
    }
    processPacket(packet) {
        console.log(
            `Processing ${packet.packetId}: ${packet.sensorType} = ${packet.value}`
        );

        return {
            packetId: packet.packetId,
            deviceId: packet.deviceId,
            sensorType: packet.sensorType,
            value: packet.value,
            timestamp: packet.timestamp
        };
    }
}

module.exports = ServerNode;
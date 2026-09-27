class Gateway {
    constructor(gatewayId, ipAddress) {
        this.gatewayId = gatewayId;
        this.ipAddress = ipAddress;
        this.receivedPackets = [];
    }

    receivePacket(packet) {
        if (packet.status === "DELIVERED") {
            this.receivedPackets.push(packet);

            console.log(
                `Gateway received ${packet.packetId} from ${packet.deviceId}`
            );

            return true;
        }

        console.log(
            `Gateway did not receive ${packet.packetId}`
        );

        return false;
    }

    forwardPacket(packet, server) {
        console.log(
            `Gateway forwarding ${packet.packetId} to Server`
        );

        return server.receivePacket(packet);
    }
}

module.exports = Gateway;
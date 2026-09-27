let packetCounter = 0;

class Packet {
    constructor(sensorReading) {
        packetCounter++;

        this.packetId = `P${String(packetCounter).padStart(4, "0")}`;

        this.deviceId = sensorReading.deviceId;
        this.sourceIp = sensorReading.ipAddress;
        this.sensorType = sensorReading.sensorType;
        this.value = sensorReading.value;
        this.timestamp = sensorReading.timestamp;
        this.createdAt = Date.now();

        this.status = "CREATED";
    }
}

module.exports = Packet;
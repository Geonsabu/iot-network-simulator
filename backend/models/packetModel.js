const mongoose = require("mongoose");

const packetSchema = new mongoose.Schema({
    packetId: String,
    deviceId: String,
    sourceIp: String,
    sensorType: String,
    value: Number,
    timestamp: Date,
    status: String
});

module.exports = mongoose.model("Packet", packetSchema);
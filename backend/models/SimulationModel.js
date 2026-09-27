const mongoose = require("mongoose");

const simulationSchema = new mongoose.Schema({
    scenario: String,
    totalPackets: Number,
    delivered: Number,
    lost: Number,
    deliveryRate: Number,
    averageLatency: Number,
    time: String
});

module.exports = mongoose.model(
    "Simulation",
    simulationSchema
); 
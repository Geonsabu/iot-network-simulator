class VirtualSensor {
    constructor(deviceId, ipAddress, sensorType) {
        this.deviceId = deviceId;
        this.ipAddress = ipAddress;
        this.sensorType = sensorType;
    }

    generateReading() {
        let value;

        switch (this.sensorType) {
            case "temperature":
                value = (20 + Math.random() * 15).toFixed(2);
                break;

            case "humidity":
                value = (40 + Math.random() * 40).toFixed(2);
                break;

            case "light":
                value = Math.floor(100 + Math.random() * 900);
                break;

            case "pressure":
                value = (990 + Math.random() * 40).toFixed(2);
                break;

            default:
                value = 0;
        }

        return {
            deviceId: this.deviceId,
            ipAddress: this.ipAddress,
            sensorType: this.sensorType,
            value: Number(value),
            timestamp: new Date()
        };
    }
}

module.exports = VirtualSensor;
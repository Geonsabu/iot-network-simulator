class NetworkSimulator {
    constructor(name,delay = 100, packetLossRate = 0.1) {
        this.delay = delay;
         this.name = name;
        this.packetLossRate = packetLossRate;
    }

    transmit(packet) {
        return new Promise((resolve) => {
            setTimeout(() => {

                const random = Math.random();

                if (random < this.packetLossRate) {
                    packet.status = "LOST";
                    packet.lostAt = this.name;

                    resolve(packet);
                    return;
                }

                packet.status = "DELIVERED";
                resolve(packet);

            }, this.delay);
        });
    }
}

module.exports = NetworkSimulator;
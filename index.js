const { Accessory } = require('homebridge-plugin-helpers');
const { NetworkObserver } = require('./network');

module.exports = function (homebridge) {
	networkPresenceAccessory.register(homebridge);
};

class networkPresenceAccessory extends Accessory {

	static get pluginName() {
		return "homebridge-network-presence";
	}
	
	static get accessoryName() {
		return "networkPresence";
	}

	constructor(homebridge, log, config, api) {
		super();
		// Save args
		this.log = log;
		this.config = config;
		this.api = api;
		// Setup Homebridge
		this.Service = homebridge.hap.Service;
		this.Characteristic = homebridge.hap.Characteristic;
		// Setup Service
		this.isDetected = 0;
		this.service = new this.Service.OccupancySensor(this.name);
		this.setupCharacteristics();
		this.setupDeviceObserver();
	}

	get name() {
		return this.config.name;
	}

	get manufacturer() {
		return "network-presence";
	}

	get model() {
		return "arp-network-presence";
	}

	get serialNumber() {
		return this.config.mac || this.config.ip;
	}

	setupCharacteristics() {
		const { Characteristic } = this;
		this.service
			.getCharacteristic(Characteristic.OccupancyDetected)
			.on('get', (callback) => callback(null, this.isDetected));
	}

    setupDeviceObserver() {
        const { net } = this;
				const { mac, ip } = this.config;
				if (mac) {
					net.on(`connected:mac:${mac.toLowerCase()}`, (device) =>
							this.setDetected(1)
					);
					net.on(`disconnected:mac:${mac}`, (device) =>
							this.setDetected(0)
					);
				} if (ip) {
					net.on(`connected:ip:${ip}`, (device) =>
							this.setDetected(1)
					);
					net.on(`disconnected:ip:${ip}`, (device) =>
							this.setDetected(0)
					);
				}
    }

    static get net() {
        if (!this._net) {
            this._net = new NetworkObserver();
        }
        return this._net;
    }

    get net() {
        return this.constructor.net;
    }

    setDetected(isDetected, device) {
				this.log(`${this.name} ${isDetected ? 'connected to' : 'disconnected from'} the network! (mac: ${device.mac} | ip:${device.ip})`)
        this.isDetected = isDetected;
        this.service.updateValue(isDetected);
    }

}

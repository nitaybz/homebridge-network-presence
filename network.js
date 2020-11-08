const { EventEmitter } = require('events');
const ping = require("ping");
const Promise = require('bluebird');
const arpScanner = require('arpscan/promise');

class NetworkObserver extends EventEmitter {
    constructor() {
        super();
        this.pingOptions = {
            timeout: 2000
        };
        this.cachedDevices = [];
        this.tick();
    }
    
    get pollInterval() {
        return 1000;
    }

    get table() {
        return new Promise((resolve, reject) => {
            arpScanner()
                .then(entries => resolve(entries))
                .catch(error => reject(error));
        });
    }

    get devices() {
        return this.table
            .then(entries => this._parseMacAddress(entries))
            .then(entries =>
                Promise.all(entries.map(entry =>
                    this.ping(entry.ip)
                        .then(isActive =>
                            Object.assign({}, entry, {
                                active: isActive
                            })
                        )
                        .catch(() =>
                            Object.assign({}, entry, {
                                active: false
                            })
                        )
                ))
            );
    }

    get activeDevices() {
        return this.devices
            .then(devices => devices.filter(device => device.active))
            ;
    }

    _parseMacAddress(devices) {
        return devices.map(device => {
            device.mac = device.mac.toLowerCase().split(':').map(block => ('0' + block).slice(-2)).join(':')
            return device
        })
    }

    ping(ip) {
        return new Promise(resolve =>
            ping.sys.probe(ip, isAlive =>
                resolve(isAlive),
                this.pingOptions
            )
        )
        .timeout(this.pollInterval * 2)
        .then(() => Promise.resolve(true))
        .catch(() => Promise.resolve(false));
    }

	tick() {
		return this.update()
			.then(() => setTimeout(() => this.tick(), this.pollInterval))
			.catch(() => setTimeout(() => this.tick(), this.pollInterval))
			;
	}

    async update() {
        const { cachedDevices } = this;
        return this.activeDevices
            .then(devices => {
                try {
                    const cacheMap = cachedDevices.reduce((hash, device) => {
                        hash[device.mac] = device;
                        return hash;
                    }, {});
                    const previousDeviceKeys = Object.keys(cacheMap);
                    const newDevices = [];
                    // Check if new device
                    devices.forEach(device => {
                        const { mac } = device;
                        const index = previousDeviceKeys.indexOf(mac);
                        const isNewDevice = index === -1;
                        if (isNewDevice) {
                            newDevices.push(device);
                        } else {
                            previousDeviceKeys.splice(index, 1);
                        }
                        this.emit(`device:mac:${device.mac}`, device);
                        this.emit(`device:ip:${device.ip}`, device);
                    });
                    // Check if device disconnected
                    const removedDevices = previousDeviceKeys.map(key => cacheMap[key]);
                    // Emit events
                    newDevices.forEach(device => {
                        this.emit(`connected:mac:${device.mac}`, device);
                        this.emit(`connected:ip:${device.ip}`, device);
                    });
                    removedDevices.forEach(device => {
                        this.emit(`disconnected:mac:${device.mac}`, device);
                        this.emit(`disconnected:ip:${device.ip}`, device);
                    });
                    // Save cache
                    this.cachedDevices = devices;
                } catch (err){
                    this.emit('err', err)
                }
            });
    }

}

module.exports = {
    NetworkObserver
};
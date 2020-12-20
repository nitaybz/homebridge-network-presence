const { EventEmitter } = require('events');
const ping = require("ping");
const Promise = require('bluebird');
const find = require('local-devices');
const Accessory = require('./accessory')

const init = function() {
    removeCachedDevices.bind(this)()

    this.log(`Initiating Network Scanner...`)
    const net = new NetworkObserver(this.interval)

    net.on('err', (err) => {
        this.log('ERROR OCCURRED !!')
        this.log(err)
    })

    this.devicesConfig.forEach(device => this.devices.push(new Accessory(net, device, this)))
    if (this.anyoneSensor)
        new Accessory(net, {anyone: true, mac: '12:34:56:78:9a:bc', name: 'Anyone'}, this)

}

class NetworkObserver extends EventEmitter {
    constructor(interval) {
        super();
        this.pingOptions = {
            timeout: 2000
        };
        this.interval = interval
        this.cachedDevices = [];
        this.tick();
    }
    
    get pollInterval() {
        return this.interval;
    }

    get devices() {
        return find()
            // .then(entries => this._parseMacAddress(entries))
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
    NetworkObserver,
    init
};


const removeCachedDevices = function() {
	this.accessories.forEach(accessory => {
        // if anyone sensor
        if (accessory.context.serial === '12:34:56:78:9a:bc' && this.anyoneSensor)
         return

        const deviceInConfig = this.devicesConfig.find(device => (device.mac && device.mac.toLowerCase() === accessory.context.serial) || device.ip === accessory.context.serial)
		if (deviceInConfig)
			return
		else {
			// unregistering accessory
			this.log(`Unregistering disconnected device: "${accessory.displayName}" (${accessory.context.serial})`)
			this.api.unregisterPlatformAccessories(this.PLUGIN_NAME, this.PLATFORM_NAME, [accessory])
		}

	});
}

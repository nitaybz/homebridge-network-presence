let Characteristic, Service

class OccupancySensor {
	constructor(network, config, platform) {

		Service = platform.api.hap.Service
		Characteristic = platform.api.hap.Characteristic
		this.network = network
		this.log = platform.log
		this.api = platform.api
		this.platformAccessories = platform.accessories
		this.interval = platform.interval
		this.threshold = !config.threshold && config.threshold !== 0 ? platform.threshold : config.threshold
		this.mac = config.mac ? config.mac.toLowerCase() : null
		this.ip = config.ip
		this.name = config.name
		this.model = 'ARP-network-scanner'
		this.serial = this.mac || this.ip
		this.manufacturer = '@nitaybz'
		this.displayName = this.name

		this.thresholdTimer = null

		if (!this.serial) {
			this.log(`Can't initiate ${this.name} device without mac address or ip address`)
			this.log(`Please change your config`)
			return
		}

		if (typeof this.serial !== 'string') {
			this.log(`Wrong mac/ip address format`)
			this.log(`Please adjust your config to include proper ip address (10.0.0.x) or mac address (3e:34:ae:87:f1:cc)`)
			return
		}

		this.UUID = this.api.hap.uuid.generate(this.serial)
		this.accessory = this.platformAccessories.find(accessory => accessory.UUID === this.UUID)

		if (!this.accessory) {
			this.log(`Creating New ${platform.PLATFORM_NAME} Accessory for ${this.name}`)
			this.accessory = new this.api.platformAccessory(this.name, this.UUID)
			this.accessory.context.serial = this.serial

			platform.accessories.push(this.accessory)
			// register the accessory
			this.api.registerPlatformAccessories(platform.PLUGIN_NAME, platform.PLATFORM_NAME, [this.accessory])
		}


		this.isDetected = 0

		let informationService = this.accessory.getService(Service.AccessoryInformation)

		if (!informationService)
			informationService = this.accessory.addService(Service.AccessoryInformation)

		informationService
			.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
			.setCharacteristic(Characteristic.Model, this.model)
			.setCharacteristic(Characteristic.SerialNumber, this.serial)

		if (config.anyone)
			this.addAnyoneSensor
		else
			this.addOccupancySensor()

	}

	addOccupancySensor() {
		this.log.easyDebug(`Adding "${this.name}" Occupancy Sensor Service`)
		this.OccupancySensorService = this.accessory.getService(Service.OccupancySensor)
		if (!this.OccupancySensorService)
			this.OccupancySensorService = this.accessory.addService(Service.OccupancySensor, this.name, 'netSensor')

		this.OccupancySensorService.getCharacteristic(Characteristic.OccupancyDetected)
			.on('get', (callback) => callback(null, this.isDetected))
			.updateValue(this.isDetected)

		const listenTo = this.mac ? `mac:${this.mac}` : `ip:${this.ip}`
		this.log.easyDebug(`[${this.name}] - Listening to ${listenTo}`)

		this.network.on(`connected:${listenTo}`, (device) =>
				this.setDetected(1, device)
		);
		this.network.on(`disconnected:${listenTo}`, (device) =>
				this.setDetected(0, device)
		);
		
	}

	setDetected(isDetected, device) {
		clearTimeout(this.thresholdTimer)
		if (isDetected && !this.isDetected) {
			this.log(`[${this.name}] - connected to the network (mac: ${device.mac} | ip:${device.ip})`)
			this.isDetected = 1
			this.OccupancySensorService
				.getCharacteristic(Characteristic.OccupancyDetected)
				.updateValue(1)
			return
		}

		this.thresholdTimer = setTimeout(() => {
			this.log(`[${this.name}] - disconnected from the network (mac: ${device.mac} | ip:${device.ip})`)
			this.isDetected = 0
			this.OccupancySensorService
				.getCharacteristic(Characteristic.OccupancyDetected)
				.updateValue(0)

		}, this.threshold * 60 * 1000)
	}


	addAnyoneSensor() {
		this.log.easyDebug(`Adding "${this.name}" Occupancy Sensor Service`)
		this.OccupancySensorService = this.accessory.getService(Service.OccupancySensor)
		if (!this.OccupancySensorService)
			this.OccupancySensorService = this.accessory.addService(Service.OccupancySensor, this.name, 'anyoneSensor')

		this.updateAnyone()

		this.OccupancySensorService.getCharacteristic(Characteristic.OccupancyDetected)
			.on('get', (callback) => callback(null, this.isDetected))
			.updateValue(this.isDetected)

			setInterval(() => {
				this.updateAnyone()
			}, this.interval)
	}
	
	updateAnyone() {

		// check if any accessory isDetected ( === 1 )
		const isDetected = this.platformAccessories.find(pAccessory => pAccessory.isDetected)
		if (isDetected && !this.isDetected) {
			this.log(`[${this.name}] - Someone connected to the network`)
			this.isDetected = 1
			this.OccupancySensorService
				.getCharacteristic(Characteristic.OccupancyDetected)
				.updateValue(1)
		} else if (!isDetected && this.isDetected) {
			this.log(`[${this.name}] - No one is connected to the network`)
			this.isDetected = 0
			this.OccupancySensorService
				.getCharacteristic(Characteristic.OccupancyDetected)
				.updateValue(0)
		}
	}
}

module.exports = OccupancySensor
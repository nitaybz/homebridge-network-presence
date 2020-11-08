let Characteristic, Service

class OccupancySensor {
	constructor(network, config, platform) {

		Service = platform.api.hap.Service
		Characteristic = platform.api.hap.Characteristic
		this.network = network
		this.log = platform.log
		this.api = platform.api
		this.mac = config.mac.toLowerCase()
		this.ip = config.ip
		this.name = config.name
		this.model = 'ARP-network-scanner'
		this.serial = this.mac.toLowerCase() || this.ip
		this.manufacturer = '@nitaybz'
		this.displayName = this.name

		
		this.UUID = this.api.hap.uuid.generate(this.serial)
		this.accessory = platform.accessories.find(accessory => accessory.UUID === this.UUID)

		if (!this.accessory) {
			this.log(`Creating New ${platform.PLATFORM_NAME} Accessory for ${this.name}`)
			this.accessory = new this.api.platformAccessory(this.name, this.UUID)
			this.accessory.context.serial = this.serial

			platform.accessories.push(this.accessory)
			// register the accessory
			this.api.registerPlatformAccessories(platform.PLUGIN_NAME, platform.PLATFORM_NAME, [this.accessory])
		}


		this.isDetected = this.accessory.context.isDetected || 0

		let informationService = this.accessory.getService(Service.AccessoryInformation)

		if (!informationService)
			informationService = this.accessory.addService(Service.AccessoryInformation)

		informationService
			.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
			.setCharacteristic(Characteristic.Model, this.model)
			.setCharacteristic(Characteristic.SerialNumber, this.serial)

		this.addOccupancySensor()

	}

	addOccupancySensor() {
		this.log.easyDebug(`Adding "${this.name}" Occupancy Sensor Service`)
		this.OccupancySensorService = this.accessory.getService(Service.OccupancySensor)
		if (!this.OccupancySensorService)
			this.OccupancySensorService = this.accessory.addService(Service.OccupancySensor, this.name, 'netSensor')

		this.OccupancySensorService.getCharacteristic(Characteristic.OccupancyDetected)
			.on('get', (callback) => callback(null, isDetected))
			.updateValue(isDetected)

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
		this.log(`[${this.name}] - ${isDetected ? 'connected to' : 'disconnected from'} the network! (mac: ${device.mac} | ip:${device.ip})`)
		this.isDetected = isDetected
		this.accessory.context.isDetected = isDetected
		this.OccupancySensorService.updateValue(isDetected)
	}
}


module.exports = OccupancySensor
const Network = require('./lib/network')
const PLUGIN_NAME = 'homebridge-network-presence'
const PLATFORM_NAME = 'NetworkPresence'
module.exports = (api) => {
	api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, NetworkPresence)
}

class NetworkPresence {

	constructor(log, config, api) {
		this.api = api
		this.log = log

		this.accessories = []
		this.devices = []
		this.PLUGIN_NAME = PLUGIN_NAME
		this.PLATFORM_NAME = PLATFORM_NAME
		this.name = config.name || PLATFORM_NAME
		this.interval = config.interval ? config.interval * 1000 : 10000
		this.threshold = !config.threshold && config.threshold !== 0 ? 15 : config.threshold
		this.anyoneSensor = config.anyoneSensor
		this.devicesConfig = config.devices || []
		this.debug = config.debug || false
		this.range = config.addressRange || ''

		
		// define debug method to output debug logs when enabled in the config
		this.log.easyDebug = (...content) => {
			if (this.debug) {
				this.log(content.reduce((previous, current) => {
					return previous + ' ' + current
				}))
			} else
				this.log.debug(content.reduce((previous, current) => {
					return previous + ' ' + current
				}))
		}

		this.api.on('didFinishLaunching', Network.init.bind(this))

	}

	configureAccessory(accessory) {
		this.log.easyDebug(`Found Cached Accessory: ${accessory.displayName} (${accessory.context.serial}) `)
		this.accessories.push(accessory)
	}
}
<img src="branding/network_homebridge.png" width="500px">

# homebridge-network-presence

[![Downloads](https://img.shields.io/npm/dt/homebridge-network-presence.svg?color=critical)](https://www.npmjs.com/package/homebridge-network-presence)
[![Version](https://img.shields.io/npm/v/homebridge-network-presence)](https://www.npmjs.com/package/homebridge-network-presence)<br>
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins) [![Homebridge Discord](https://img.shields.io/discord/432663330281226270?color=728ED5&logo=discord&label=discord)](https://discord.gg/7DyabQ6)<br>
[![certified-hoobs-plugin](https://badgen.net/badge/HOOBS/Certified/yellow)](https://plugins.hoobs.org?ref=10876) [![hoobs-support](https://badgen.net/badge/HOOBS/Support/yellow)](https://support.hoobs.org?ref=10876)

[Homebridge](https://github.com/nfarina/homebridge) plugin that provides occupancy sensors for devices presence on your network based on mac address or IP.

### Requirements

<img src="https://img.shields.io/badge/node-%3E%3D10.17-brightgreen"> &nbsp;
<img src="https://img.shields.io/badge/homebridge-%3E%3D0.4.4-brightgreen">

check with: `node -v` & `homebridge -V` and update if needed

## Description

This plugin was inspired by the old [homebridge-people](https://github.com/PeteLawrence/homebridge-people) plugin by @PeteLawrence and it's fork, [homebridge-people plus](https://github.com/Glavin001/homebridge-people-plus) by @Glavin001.

I created this plugin due to the lack of updated, supported and maintained plugin to check devices on your current network.

With this plugin you can easily configure devices to monitor based on their mac or ip address.

# Installation

This plugin is HomeBridge verified and [HOOBS](https://hoobs.org/?ref=10876) certified and can be easily installed and configured through their UI.

If you don't use Homebridge UI or HOOBS, keep reading:

1. Install homebridge using: `sudo npm install -g homebridge --unsafe-perm`
2. Install this plugin using: `sudo npm install -g homebridge-network-presence`
3. Update your configuration file. See `config-sample.json` in this repository for a sample.

## Config File Example

``` json
"platforms": [
    {
        "platform": "NetworkPresence",
        "interval": 10,
        "threshold": 15,
        "anyoneSensor": true,
        "devices": [ 
            {
                "name": "my iPhone",
                "mac": "cc:29:f5:3b:a2:f2",
                "threshold": 5
            },
            {
                "name": "my iPad",
                "ip": "10.0.0.142"
            }

        ],
        "debug": false
    }
]
```

### Configurations Table

\* advanced details below

|             Parameter            |                       Description                       |  Default |   type   |
| -------------------------------- | ------------------------------------------------------- |:--------:|:--------:|
| `platform`  | always `"NetworkPresence"` |     -    |  String  |
| `interval`  |  Time in seconds between status polling for connected devices   |  `10` |  Integer |
| `threshold`  |  Time in minutes to wait before updating 'disconnected' status. important for not spamming your notifications or wrongly activating automation because the device has gone from the network for short time   |  `15` |  Integer |
| `anyoneSensor`       |  When set to `true`, the plugin will create extra accessory named "Anyone" to represent if ANY of the devices is detected        |  `false` |  Boolean  |
| `debug`       |  When set to `true`, the plugin will produce extra logs for debugging purposes        |  `false` |  Boolean  |
| **Devices** | List of devices to monitor (with the below information)| | Array|
| `name`        | Name of the accessory in HomeKit  |         |  String  |
| `mac`        | Mac Address of the device e.g. `cc:29:f5:3b:a2:f2` (can use `ip` instead) |         |  String  |
| `ip`        | ip Address of the device (can use `mac` instead) |         |  String  |
| `threshold`  | device disconnect threshold (overrides platform threshold)   |  `15` |  Integer |

## Issues & Debug

If you experience any issues with the plugins please refer to the [Issues](https://github.com/nitaybz/homebridge-network-presence/issues) tab <!-- or [network-presence Discord Channel](https://discord.gg/7DyabQ6) --> and check if your issue is already described there, if it doesn't, please report a new issue with as much detailed information as you can give (logs are crucial).<br>
if you want to even speed up the process, you can add `"debug": true` to your config, which will give me more details on the logs and speed up fixing the issue.


-----------------------

## Support homebridge-network-presence

**homebridge-network-presence** is a free plugin under the MIT license. it was developed as a contribution to the homebridge/hoobs community with lots of love and thoughts.
Creating and maintaining Homebridge plugins consume a lot of time and effort and if you would like to share your appreciation, feel free to "Star" or donate.

<a target="blank" href="https://www.paypal.me/nitaybz"><img src="https://img.shields.io/badge/PayPal-Donate-blue.svg?logo=paypal"/></a><br>
<a target="blank" href="https://www.patreon.com/nitaybz"><img src="https://img.shields.io/badge/PATREON-Become a patron-red.svg?logo=patreon"/></a><br>
<a target="blank" href="https://ko-fi.com/nitaybz"><img src="https://img.shields.io/badge/Ko--Fi-Buy%20me%20a%20coffee-29abe0.svg?logo=ko-fi"/></a>
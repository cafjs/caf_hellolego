'use strict';

const myUtils = require('caf_iot').caf_components.myUtils;


const cleanupDeviceInfo = function(devices) {
    const result = {};
    Object.keys(devices).forEach((x) => {
        result[x] = {
            uuid: devices[x].uuid,
            advertisement: myUtils.deepClone(devices[x].advertisement)
        };
    });
    return result;
};

exports.methods = {
    async __iot_setup__() {
        // Example of how to store device state in the cloud, i.e.,
        // the value of `index` from last run downloaded from the cloud.
        const lastIndex = this.toCloud.get('index');
        this.state.index = (lastIndex ? lastIndex : 0);

        this.state.index = 0;
        this.scratch.devices = {};
        this.state.selectedDevice = null;
        this.state.devicesInfo = {};
        this.state.sensorValue = null;

        return [];
    },

    async __iot_loop__() {
        this.$.log && this.$.log.debug(
            'Time offset ' +
                (this.$.cloud.cli && this.$.cloud.cli.getEstimatedTimeOffset())
        );

        this.toCloud.set('index', this.state.index);
        this.state.index = this.state.index + 1;

        const now = (new Date()).getTime();
        this.$.log && this.$.log.debug(now + ' loop: ' + this.state.index);

        if (!myUtils.deepEqual(this.toCloud.get('devices'),
                               this.state.devicesInfo)) {
            this.toCloud.set('devices', this.state.devicesInfo);
        }
        if (this.toCloud.get('sensorValue') !== this.state.sensorValue) {
            this.toCloud.set('sensorValue', this.state.sensorValue);
        }

        return [];
    },

    async findDevices(config) {
        const now = (new Date()).getTime();
        this.$.log && this.$.log.debug(now + ' findDevices() config:' +
                                       JSON.stringify(config));
        this.state.config = config;

        // forget old devices
        this.scratch.devices = {};
        this.state.devicesInfo = {};

       if (typeof window !== 'undefined') {
            // Wait for user click
            await this.$.gatt.findServicesWeb(
                config.service, '__iot_foundDevice__', 'confirmScan',
                'afterConfirmScan'
            );
        } else {
            this.$.gatt.findServices(config.service, '__iot_foundDevice__');
        }
        return [];
    },

    async __iot_foundDevice__(serviceId, device) {
        if (serviceId.toLowerCase() ===
            this.state.config.service.toLowerCase()) {
            this.scratch.devices[device.uuid] = device;
            this.state.devicesInfo = cleanupDeviceInfo(this.scratch.devices);
        } else {
            this.$.log && this.$.log.debug('Ignoring device with serviceID: ' +
                                           serviceId + ' as opposed to ' +
                                           this.state.config.service);
        }
        return [];
    },

    async connect(deviceId) {
        this.$.log && this.$.log.debug('Selected device ' + deviceId);
        if (this.state.selectedDevice) {
            // Only one connected device
            await this.disconnect();
        }
        this.state.selectedDevice = deviceId;

        if (this.scratch.devices[deviceId]) {
            try {
                const {characteristics} =
                          await this.$.gatt.findCharacteristics(
                              this.state.config.service,
                              this.scratch.devices[deviceId],
                              [this.state.config.blink,
                               this.state.config.notification]
                          );
                [this.scratch.blinkCharact, this.scratch.notificationCharact] =
                    characteristics;
                await this.$.gatt.subscribe(this.scratch.notificationCharact,
                                            '__iot_subscribe__');
                return [];
            } catch (err) {
                return [err];
            }
        } else {
            this.$.log && this.$.log.debug('select: Ignoring unknown device ' +
                                           deviceId);
            return [];
        }
    },

    async __iot_subscribe__(charact, value) {
        value = parseInt(value.toString('hex'), 16);
        this.$.log && this.$.log.debug('Notification: got ' + value);
        this.state.sensorValue = value;
        return [];
    },

    async blink() {
        if (this.scratch.blinkCharact) {
            const buf = Buffer.from('on');
            this.$.log && this.$.log.debug('Blinking');
            await this.$.gatt.write(this.scratch.blinkCharact, buf);
        }
        return [];
    },

    async stop() {
        if (this.scratch.blinkCharact) {
            const buf = Buffer.from('off');
            this.$.log && this.$.log.debug('Blinking Off');
            await this.$.gatt.write(this.scratch.blinkCharact, buf);
        }
        return [];
    },

    async disconnect() {
        this.$.log && this.$.log.debug('Calling disconnect()');
        if (this.scratch.notificationCharact) {
            await this.$.gatt.unsubscribe(this.scratch.notificationCharact);
        }
        const device = this.state.selectedDevice &&
                this.scratch.devices[this.state.selectedDevice];
        if (device) {
            this.$.log && this.$.log.debug('Disconnect device ' +
                                           this.state.selectedDevice);
            await this.$.gatt.disconnect(device);
        }
        this.state.selectedDevice = null;
        return [];
    },

    async reset() {
        this.$.log && this.$.log.debug('Calling reset()');
        await this.disconnect();
        await this.$.gatt.reset();
        this.scratch.devices = {};
        this.state.devicesInfo = {};
        this.state.sensorValue = null;
        return [];
    }
};

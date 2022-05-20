'use strict';
const caf = require('caf_core');
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const app = require('../public/js/app.js');

const APP_SESSION = 'default'; //main app
const STANDALONE_SESSION = 'standalone'; //main app in standalone mode
const IOT_SESSION = 'iot'; // device
const USER_SESSION = /^user/; // third-party app

const notifyIoT = function(self, msg) {
    self.$.session.notify([msg], IOT_SESSION);
};

const notifyWebApps = function(self, msg) {
    self.$.session.notify([msg], APP_SESSION);
    self.$.session.notify([msg], STANDALONE_SESSION);
    self.$.session.notify([msg], USER_SESSION);
};

const doBundle = function(self, command, arg) {
    const bundle = self.$.iot.newBundle();
    if (arg === undefined) {
        bundle[command](0);
    } else {
        bundle[command](0, [arg]);
    }
    self.$.iot.sendBundle(bundle, self.$.iot.NOW_SAFE);
    notifyIoT(self, command);
};

exports.methods = {
    // Methods called by framework
    async __ca_init__() {
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.$.session.limitQueue(1, STANDALONE_SESSION); // ditto
        this.$.session.limitQueue(1, IOT_SESSION); // ditto

        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();

        // methods called by the iot device
        this.state.trace__iot_sync__ = '__ca_traceSync__';
        this.state.trace__iot_resume__ = '__ca_traceResume__';

        // example config
        this.state.config = {
            service: this.$.props.serviceID, // GATT Service ID
            blink: this.$.props.blinkID, // Characteristic ID for blinking
            notification: this.$.props.notificationID // Ditto for sensor data
        };

        // example initial state
        this.state.sensorValue = null;
        this.state.devices = {};
        this.state.selectedDevice = null;
        this.state.daemon = 0;

        return [];
    },

    async __ca_pulse__() {
        this.$.log && this.$.log.debug('Calling PULSE!');
        this.$.react.render(app.main, [this.state]);
        return [];
    },

    //External methods

    async hello(key, tokenStr) {
        tokenStr && this.$.iot.registerToken(tokenStr);
        key && this.$.react.setCacheKey(key);
        return this.getState();
    },

    // Example external methods

    /* Typical lifecycle:
     *
     * 1 Find devices exporting a service.
     * 2 Connect to one of them and start listening to device notifications,
     *  e.g., heart beat rates....
     * 3 Do some device operation, e.g., start blinking or stop blinking.
     * 4 Disconnect from device stopping notifications
     */

    async findDevices() {
        this.state.selectedDevice && this.disconnect(); // #devices <= 1
        doBundle(this, 'findDevices', this.state.config);
        notifyWebApps(this, 'Finding device');
        return this.getState();
    },

    async connect(deviceId, deviceAd) {
        if (this.state.devices[deviceId]) {
            this.state.selectedDevice = {id: deviceId, ad: deviceAd};
            doBundle(this, 'connect', deviceId);
            notifyWebApps(this, 'Connecting device');
            return this.getState();
        } else {
            const err = new Error('Cannot connect, device missing');
            err.deviceId = deviceId;
            return [err];
        }
    },

    async disconnect() {
        doBundle(this, 'disconnect');
        this.state.selectedDevice = null;
        notifyWebApps(this, 'Disconnecting device');
        return this.getState();
    },

    async reset() {
        doBundle(this, 'reset');
        this.state.selectedDevice = null;
        notifyWebApps(this, 'Resetting');
        return this.getState();
    },

    async blink() {
        doBundle(this, 'blink');
        return this.getState();
    },

    async stop() {
        doBundle(this, 'stop');
        return this.getState();
    },

    async setBrowserDaemon(daemon) {
        const old = this.state.daemon;
        this.state.daemon = daemon;
        return old !== daemon ?
            this.reset() :
            this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, this.state];
    },

    // Methods called by the IoT device (Optional)

    // called when the device starts and connects to the CA
    async __ca_traceResume__() {
        notifyWebApps(this, 'New device');
        return [];
    },

    // called when the device syncs state with the cloud
    async __ca_traceSync__() {
        const $$ = this.$.sharing.$;
        const now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Syncing!!:' + now);
        this.state.sensorValue = $$.toCloud.get('sensorValue');
        this.state.devices = $$.toCloud.get('devices');
        if (this.state.selectedDevice &&
            !this.state.devices[this.state.selectedDevice.id]) {
            // Invariant: `selectedDevice` is always visible to the device
            this.state.selectedDevice = null;
        }
        notifyWebApps(this, 'New inputs');
        return [];
    }

};

caf.init(module);

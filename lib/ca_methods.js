'use strict';
const assert = require('assert');
const caf = require('caf_core');
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const app = require('../public/js/app.js');

const APP_SESSION = 'default'; //main app
const STANDALONE_SESSION = 'standalone'; //main app in standalone mode
const IOT_SESSION = 'iot'; // device
const USER_SESSION = /^user/; // third-party app

const COLOR_NONE = 255; // LED off

const notifyIoT = function(self, msg) {
    self.$.session.notify([msg], IOT_SESSION);
};

const notifyWebApps = function(self, msg) {
    self.$.session.notify([msg], APP_SESSION);
    self.$.session.notify([msg], STANDALONE_SESSION);
    self.$.session.notify([msg], USER_SESSION);
};

const doBundle = function(self, command, ...args) {
    const bundle = self.$.iot.newBundle();
    bundle[command](0, args);
    self.$.iot.sendBundle(bundle, self.$.iot.NOW_SAFE);
    notifyIoT(self, command);
};

exports.methods = {
    // Methods called by framework
    async __ca_init__() {
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();

        // methods called by the iot device
        this.state.trace__iot_sync__ = '__ca_traceSync__';

        this.state.isConnected = false;
        this.state.ledOn = COLOR_NONE;
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
        const $$ = this.$.sharing.$;

        // delay `colors` initialization until `fromCloud` is ready
        if (!$$.fromCloud.get('colors')) {
            $$.fromCloud.set('colors', Array.from({length: 9},
                                                  () => COLOR_NONE));
        }

        return this.getState();
    },

    async connect() {
        doBundle(this, 'connect', this.$.props.legoDeviceTypes);
        return this.getState();
    },

    async setLED(led) {
        assert((led === COLOR_NONE) || ((led >= 0) && (led < 9)));

        const colors = Array.from({length: 9}, () => COLOR_NONE);
        this.state.ledOn = led;
        if ((led >= 0) && (led < 9)) {
            colors[led] = this.$.props.legoColors[led];
        }
        const $$ = this.$.sharing.$;
        $$.fromCloud.set('colors', colors);
        notifyIoT(this, 'New colors');
        notifyWebApps(this, 'New colors');

        return this.getState();
    },

    async disconnect(force) {
        doBundle(this, 'disconnect');
        if (force) {
            this.state.isConnected = false;
            notifyWebApps(this, 'Force disconnect');
        }
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, this.state];
    },

    // Methods called by the IoT device

    // called when the device syncs state with the cloud
    async __ca_traceSync__() {
        const $$ = this.$.sharing.$;
        this.$.log.debug(`${this.state.fullName} :Syncing!!: ${Date.now()}`);
        const temp = this.state.isConnected;
        this.state.isConnected = $$.toCloud.get('isConnected');

        if (temp !== this.state.isConnected) {
            notifyWebApps(this, 'New inputs');
        }
        return [];
    }

};

caf.init(module);

'use strict';

const myUtils = require('caf_iot').caf_components.myUtils;

const COLOR_NONE = 255; // LED off

exports.methods = {
    async __iot_setup__() {
        this.state.isConnected = false;
        this.state.colors = Array.from({length: 9}, () => COLOR_NONE);

        return [];
    },

    async __iot_loop__() {
        this.state.isConnected = this.$.lego.isConnected();
        if (this.toCloud.get('isConnected') !== this.state.isConnected) {
            this.toCloud.set('isConnected', this.state.isConnected);
        }

        if (this.state.isConnected) {
            const cloudColors = this.fromCloud.get('colors');
            if (cloudColors &&
                !myUtils.deepEqual(cloudColors,this.state.colors)) {
                this.state.colors = cloudColors;
                await this.setMatrix(this.state.colors);
            }
        }

        return [];
    },

    async connect(deviceTypes) {
        deviceTypes = deviceTypes || ['TECHNIC_3X3_COLOR_LIGHT_MATRIX'];
        if (!this.state.isConnected) {
            await this.$.lego.connect(deviceTypes);
            this.state.isConnected = true;
        }
        return [];
    },

    async disconnect() {
        await this.$.lego.disconnect();
        this.state.isConnected = false;
        return [];
    },

    async setMatrix(colors) {
        await this.$.lego.callMethod(
            'TECHNIC_3X3_COLOR_LIGHT_MATRIX', 'setMatrix', [colors]
        );
        return [];
    }
};

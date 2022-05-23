'use strict';

const staticArtifacts = require('../staticArtifacts');

const caf_iot = exports.framework = require('caf_iot');

const myUtils = caf_iot.caf_components.myUtils;

caf_iot.setStaticArtifacts(staticArtifacts);

caf_iot.init(module, null, null, function(err, $) {
    if (err) {
        // eslint-disable-next-line
        console.log('Got error ' + myUtils.errToPrettyStr(err));
    } else {
        const button = document.getElementById('connect');
        button.addEventListener('click', function handler() {
            $._.$.iot.$.queue.process(
                'connect',
                [['TECHNIC_3X3_COLOR_LIGHT_MATRIX']],
                null,
                (err) => {
                    button.style = 'display:none;';
                    if (err) {
                        const errMsg = document.getElementById('errMsg');
                        errMsg.style = 'display:inline;';
                    }
                }
            );
        });
        $._.$.log && $._.$.log.debug('READY Q5JsdqWGXOzqOFg ');
    }
});

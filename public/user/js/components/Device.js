const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class Device extends React.Component {

    constructor(props) {
        super(props);
        this.doStart = this.doStart.bind(this);
        this.doStop = this.doStop.bind(this);
    }

    doStart() {
        AppActions.blink(this.props.ctx);
    }

    doStop() {
        AppActions.stop(this.props.ctx);
    }

    render() {
        const sensorValue = typeof this.props.sensorValue === 'number' ?
              this.props.sensorValue :
              '?';
        return cE(rB.Form, {horizontal: true},
                  cE(rB.FormGroup, {controlId: 'deviceId'},
                     cE(rB.Col, {componentClass:rB.ControlLabel, sm: 3, xs: 12},
                        'Device ID'),
                     cE(rB.Col, {sm: 3, xs: 12},
                        cE(rB.FormControl.Static, null,
                           this.props.selectedDevice.id)
                       ),
                     cE(rB.Col, {componentClass:rB.ControlLabel, sm: 3, xs: 12},
                        'Advertisement'),
                     cE(rB.Col, {sm: 3, xs: 12},
                        cE(rB.FormControl.Static,
                           {style: {wordWrap: "break-word"}},
                           JSON.stringify(this.props.selectedDevice.ad))
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'sensorId'},
                     cE(rB.Col, {componentClass:rB.ControlLabel,
                                 sm: 3, xs: 12},
                        'Sensor Value'),
                     cE(rB.Col, {sm: 3, xs: 12},
                        cE(rB.FormControl.Static, null, sensorValue)
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'buttonId'},
                     cE(rB.Col, {smOffset:3, sm: 3, xs: 12},
                        cE(rB.ButtonGroup, null,
                           cE(rB.Button, {
                               bsStyle: 'primary',
                               onClick: this.doStart
                           }, 'Start'),
                           cE(rB.Button, {
                               bsStyle: 'danger',
                               onClick: this.doStop
                           }, 'Stop')
                          )
                       )
                    )
                 );
    }
};

module.exports = Device;

'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class DisplayUser extends React.Component {

    constructor(props) {
        super(props);
        this.doDismissUser = this.doDismissUser.bind(this);
        this.doStart = this.doStart.bind(this);
        this.doStop = this.doStop.bind(this);
    }

    doDismissUser(ev) {
        AppActions.setLocalState(this.props.ctx, {displayUser: false});
    }

    doStart() {
        AppActions.blink(this.props.ctx);
    }

    doStop() {
        AppActions.stop(this.props.ctx);
    }

    render() {
        const id = (this.props.selectedDevice &&
                    this.props.selectedDevice.id) || 'None';
        const title = `Device: ${id}`;
        const sensorValue = typeof this.props.sensorValue === 'number' ?
              this.props.sensorValue :
              '?';
        return cE(rB.Modal, {show: !!this.props.displayUser,
                             onHide: this.doDismissUser,
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true},
                     cE(rB.Modal.Title, null, title)
                    ),
                  cE(rB.ModalBody, null,
                     cE(rB.Form, {horizontal: true},
                        cE(rB.FormGroup, {controlId: 'sensorId'},
                           cE(rB.Col, {componentClass:rB.ControlLabel,
                                       sm: 4, xs: 6},
                              'Sensor Value'),
                           cE(rB.Col, {sm: 2, xs: 4},
                              cE(rB.FormControl.Static, null, sensorValue)
                             ),
                           cE(rB.Col, {sm: 6, xs: 10},
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
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doDismissUser}, 'Continue')
                    )
                 );
    }
};

module.exports = DisplayUser;

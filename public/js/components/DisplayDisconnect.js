'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class DisplayDisconnect extends React.Component {

    constructor(props) {
        super(props);
        this.doDismiss = this.doDismiss.bind(this);
        this.doReload = this.doReload.bind(this);
    }

    doDismiss(ev) {
        AppActions.setLocalState(this.props.ctx, {displayDisconnect: false});
    }

    doReload(ev) {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    }

    render() {
        return cE(rB.Modal, {show: !!this.props.displayDisconnect,
                             onHide: this.doDismiss,
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true},
                     cE(rB.Modal.Title, null, 'Warning')
                    ),
                  cE(rB.ModalBody, null,
                     cE('p', null, 'Reload this page to reconnect')
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.ButtonGroup, null,
                        cE(rB.Button, {onClick: this.doDismiss}, 'Continue'),
                        cE(rB.Button, {onClick: this.doReload,
                                       bsStyle: 'danger'}, 'Reload')
                       )
                    )
                 );
    }
};

module.exports = DisplayDisconnect;

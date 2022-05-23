'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const url = require('url');

class Manage extends React.Component {
    constructor(props) {
        super(props);

        this.share = this.share.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.spawnTab = this.spawnTab.bind(this);
    }

    share() {
        AppActions.setLocalState(this.props.ctx, {displayURL: true});
    }

    disconnect() {
        if (!this.props.inIFrame) {
            AppActions.setLocalState(this.props.ctx, {displayDisconnect: true});
        }
        AppActions.disconnect(this.props.ctx);
    }

    spawnTab() {
        if (typeof window !== 'undefined') {
            const parsedURL = url.parse(window.location.href);
            delete parsedURL.search; // no cache
            parsedURL.hash = parsedURL.hash.replace('session=default',
                                                    'session=standalone');
            if (parsedURL.host.endsWith('vcap.me')) {
                /* Web Bluetooth can only be used with https or localhost.
                 *  Chrome allows subdomains in localhost, i.e.,
                 *  root-helloiot.localhost, and wih local debugging the app
                 *  is also exposed on host port 3003 by default.
                 *
                 * Local debugging with Web Bluetooth requires Chrome!
                 */
                parsedURL.host = parsedURL.host.replace('vcap.me',
                                                        'localhost:3003');
            }
            window.open(url.format(parsedURL));
        }
    }


    render() {
        if (this.props.isConnected) {
            return cE(rB.ButtonGroup, {bsClass: 'btn-group mybuttongroup'},
                      cE(rB.Button, {bsStyle: 'primary',
                                     bsSize: 'large',
                                     onClick: this.share}, 'Share'),
                      cE(rB.Button, {bsSize: 'large',
                                     bsStyle: 'danger',
                                     onClick: this.disconnect}, 'Disconnect')
                     );
        } else {
            if (this.props.inIFrame) {
                return cE(rB.Button, {bsSize: 'large',
                                      bsStyle: 'danger',
                                      onClick: this.spawnTab},
                          'Press to Start');
            } else {
                return cE('div', null); // Connect button in Daemon.js
            }
        }
    }
}

module.exports = Manage;

'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const url = require('url');


class Daemon extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const getURL = () => {
            if ((typeof window !== 'undefined') && window.location) {
                const parsedURL = url.parse(window.location.href);
                delete parsedURL.search; // no cache
                parsedURL.pathname = 'index-iot.html';
                return url.format(parsedURL);
            } else {
                // server-side rendering
                return null;
            }
        };

        return (typeof window !== 'undefined') && !this.props.inIFrame ?
            cE('iframe', {
                // disable top-navigation
                sandbox: 'allow-same-origin allow-popups ' +
                    'allow-scripts allow-forms allow-pointer-lock',
                frameBorder: 0,
                style: {maxHeight: '85px', maxWidth: '152px'},
                src: getURL()
            }, null) :
        cE('div', null);
    }

}

module.exports = Daemon;

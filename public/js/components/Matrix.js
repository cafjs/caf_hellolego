'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class Matrix extends React.Component {

    constructor(props) {
        super(props);
        this.handlers = [];
        for (let i=0;i<9; i++) {
            this.handlers[i] = this.newHandler(i).bind(this);
        }
    }

    newHandler(i) {
        return function() {
            AppActions.setLED(this.props.ctx, i);
        };
    }

    render() {
        const led = (i) => {
            const style = (i === this.props.ledOn ?
                           `led-${i}` :
                           `led-255`);
            return cE(rB.Button, {bsClass: style,
                                  disabled: !this.props.isConnected,
                                  onClick: this.handlers[i]});
        };

        return cE(rB.Grid, {fluid: true},
                  cE(rB.Row, null,
                     cE(rB.Col, {lg: 4, sm:6, xs:12},
                        led(0), led(1), led(2)
                       )
                    ),
                  cE(rB.Row, null,
                     cE(rB.Col, {lg: 4, sm:6, xs:12},
                        led(3), led(4), led(5)
                       )
                    ),
                  cE(rB.Row, null,
                     cE(rB.Col, {lg:4, sm:6, xs:12},
                        led(6), led(7), led(8)
                       )
                    )
                 );
    }

}

module.exports = Matrix;

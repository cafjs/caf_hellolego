'use strict';

const React = require('react');
const cE = React.createElement;
const aframeR = require('aframe-react');
const Entity = aframeR.Entity;

const AppActions = require('../actions/AppActions');

class Matrix3D extends React.Component {

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
            const col = i%3;
            const row = (i - col)/3;

            const style = (i === this.props.ledOn ?
                           `led-${i}` :
                           `led-255`);
            return cE(Entity, {
                geometry : {primitive: 'box', width: 3.8, height: 0.8,
                            depth:0.1},
                material: {color: 'yellow'},
                position: {x: 0, y: 2, z: -2.75},
                onClick: this.handlers[i]
            });

        };

        return cE(Entity, {},
                  led(0), led(1), led(2),
                  led(3), led(4), led(5),
                  led(6), led(7), led(8)
                 );
    }

}

module.exports = Matrix3D;

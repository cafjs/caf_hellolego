'use strict';

const React = require('react');
const cE = React.createElement;
const aframeR = require('aframe-react');
const Entity = aframeR.Entity;

const AppActions = require('../actions/AppActions');

// similar to `css/app.css`
const COLORS = ['#FF1493', '#0000FF', '#00FF00', '#FFFF00', '#FF0000',
                '#800080', '#87CEEB', '#FFA500', '#00FFFF' ];

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

            const color = (i === this.props.ledOn ? COLORS[i] : '#FFFFFF');

            return this.props.isAR ?
                cE(Entity, {
                    events: {
                        click: this.handlers[i]
                    },
                    geometry : {primitive: 'box', width: 0.25, height: 0.25,
                                depth: 0.1},
                    material: {color},
                    position: {x: col *0.3 -0.3, y: (3-row)*0.3, z: -2.0},
                    onClick: this.handlers[i]
                }) :
                cE(Entity, {
                    events: {
                        click: this.handlers[i]
                    },
                    geometry : {primitive: 'box', width: 1.0, height: 1.0,
                                depth: 0.4},
                    material: {color},
                    position: {x: col *1.2 -1.2, y: (3-row)*1.2, z: -5.0},
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

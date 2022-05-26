/*!
Copyright 2022 Caf.js Labs and contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';
const React = require('react');
const aframe = require('aframe');

const {Entity, Scene} = require('aframe-react');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const AppStatus = require('./AppStatus');
const Matrix3D = require('./Matrix3D');

const DEFAULT_COLOR = 'black';


class MyApp extends React.Component {

    constructor(props) {
        super(props);
        this.sceneRef = React.createRef();
        this.state = this.props.ctx.store.getState();
        this.onSelect = this.onSelect.bind(this);
    }

    componentDidMount() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.props.ctx.store
                .subscribe(this._onChange.bind(this));
            this._onChange();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    _onChange() {
        if (this.unsubscribe) {
            this.setState(this.props.ctx.store.getState());
        }
    }

    enterVR(ev) {
        console.log('enter VR');
        const isAR = ev.currentTarget.sceneEl.is('ar-mode');
        AppActions.setLocalState(this.props.ctx, {isAR});
        if (isAR) {
            ev.currentTarget.sceneEl.xrSession.addEventListener(
                'select', this.onSelect
            );
        }
        //ev.currentTarget.removeAttribute('cursor');
    }

    exitVR(ev) {
        console.log('exit VR');

        AppActions.setLocalState(this.props.ctx, {isAR: false});
        //ev.currentTarget.setAttribute('cursor', 'rayOrigin' , 'mouse');
    }

    onSelect(e) {
        // Following Ada Rose Cannon ar-cursor.js
        // see https://github.com/AdaRoseCannon/aframe-xr-boilerplate
        const sceneEl = this.sceneRef.current && this.sceneRef.current.el;
        if (!sceneEl) {
            console.log('No scene, skipping onSelect()');
            return;
        }

        const frame = e.frame;
        const inputSource = e.inputSource;
        const referenceSpace = sceneEl.renderer.xr.getReferenceSpace();
        const pose = frame.getPose(inputSource.targetRaySpace, referenceSpace);
        if (!pose) {
            console.log('No pose, skipping onSelect()');
            return;
        }
        const direction = new window.THREE.Vector3();
        const transform = pose.transform;
        direction.set(0, 0, -1);
        direction.applyQuaternion(transform.orientation);
        sceneEl.setAttribute('raycaster', {
            origin: transform.position,
            direction
        });

        sceneEl.components.raycaster.checkIntersections();
        const els = sceneEl.components.raycaster.intersectedEls;
        for (const el of els) {
            const obj = el.object3D;
            let elVisible = obj.visible;
            obj.traverseAncestors(parent => {
                if (parent.visible === false ) {
                    elVisible = false;
                }
            });
            if (elVisible) {
                const details = sceneEl.components.raycaster
                      .getIntersection(el);
                el.emit('click', details);
                break;
            }
        }
    }

    render() {
        const sceneProps = {
            cursor: 'rayOrigin: mouse',
            renderer: 'antialias: true',
            ref: this.sceneRef,
            events : {
                'enter-vr': this.enterVR.bind(this),
                'exit-vr': this.exitVR.bind(this)
            }};
        if (this.state.isAR) {
            sceneProps['raycaster'] = 'objects: .clickable';
        }

        return cE(Scene, sceneProps,
                  cE('a-assets', null,
                     cE('img', {
                         id: 'backgroundImg',
                         src: '{{__CDN__}}/assets/chess-world.jpg'
                     })
                    ),
                  cE(AppStatus, {
                          isClosed: this.state.isClosed
                      }),
                  cE(Entity, {
                      primitive: 'a-sky',
                      'phi-start': 90,
                      src: '#backgroundImg',
                      visible: !this.state.isAR
                  }),
                  cE(Matrix3D, {
                      ctx: this.props.ctx,
                      isConnected: this.state.isConnected,
                      ledOn: this.state.ledOn,
                      isAR: this.state.isAR
                  }),
                  cE(Entity, {
                      light: 'type: ambient; intensity: 0.1'
                  }),
                  cE(Entity, {
                      light: 'type: directional; intensity: 0.7',
                      position: {x: 0, y: 0, z: 1}
                  }),
                  cE(Entity, {
                      'laser-controls' : 'hand: right',
                      raycaster: 'far: 10; showLine: true',
                      line:'color: ' + DEFAULT_COLOR + '; opacity: 0.75',
                      visible: !this.state.isAR
                  })
                 );
    }
};

module.exports = MyApp;

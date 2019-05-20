import * as Expo from 'expo';
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, PanResponder } from 'react-native';
import ExpoTHREE, { THREE } from 'expo-three'

global.document = global.document || {};
console.ignoredYellowBox = ['THREE.WebGLRenderer', 'THREE.WebGLProgram'];

export default class SpriteView extends React.Component {
  static propTypes = {
    touchDown: PropTypes.func.isRequired,
    touchMoved: PropTypes.func.isRequired,
    touchUp: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    onSetup: PropTypes.func.isRequired,
  };

  static defaultProps = {
    touchDown: () => {},
    touchMoved: () => {},
    touchUp: () => {},
    update: () => {},
    onSetup: () => {},
  };

  scene;
  camera;

  ///@Evan NOTE: This is lifted from SpriteKit.
  worldSpaceWidth = 750 * 0.333333333;
  worldSpaceHeight = null; //1334

  constructor() {
    super();
    this.setupGestures();
  }

  setupGestures = () => {
    const touchesBegan = ({ nativeEvent }) => {
      const { touches } = nativeEvent;
      touches.map(
        ({ target, locationX, locationY, force, identifier, timestamp }) => {
          this.props.touchDown({ x: locationX, y: locationY });
        }
      );
    };

    const touchesMoved = ({ nativeEvent }) => {
      const { touches } = nativeEvent;
      touches.map(
        ({ target, locationX, locationY, force, identifier, timestamp }) => {
          this.props.touchMoved({ x: locationX, y: locationY });
        }
      );
    };

    const touchesEnded = (evt, gestureState) => {
      this.props.touchUp({ moveX: gestureState.moveX, moveY: gestureState.moveY, x: gestureState.x0, y: gestureState.y0});
    };

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: touchesBegan,
      onPanResponderMove: touchesMoved,
      onPanResponderEnd: touchesEnded,
      onPanResponderRelease: touchesEnded,
      onPanResponderTerminate: touchesEnded, //cancel
      onShouldBlockNativeResponder: () => false,
    });
  };

  _onGLContextCreate = async gl => {
    this.scene = new THREE.Scene();

    /// Camera
    const { drawingBufferWidth: glWidth, drawingBufferHeight: glHeight } = gl;
    this.worldSpaceHeight = glHeight / glWidth * this.worldSpaceWidth;
    this.camera = new THREE.OrthographicCamera(
      this.worldSpaceWidth / -2,
      this.worldSpaceWidth / 2,
      this.worldSpaceHeight / 2,
      this.worldSpaceHeight / -2,
      0,
      1,
    );

    this.scene.size = {
      width: this.worldSpaceWidth,
      height: this.worldSpaceHeight,
    };
    this.scene.bounds = {
      top: this.camera.top,
      left: this.camera.left,
      bottom: this.camera.bottom,
      right: this.camera.right,
    };

    this.camera.position.z = 1;

    const renderer = ExpoTHREE.createRenderer({ gl });
    renderer.setSize(glWidth, glHeight);
    /// Color, Alpha
    renderer.setClearColor(0x000000, 0);
    await this.props.onSetup({ scene: this.scene, camera: this.camera });

    let lastFrameTime;
    const render = () => {
      const now = 0.001 * global.nativePerformanceNow();
      const dt = typeof lastFrameTime !== 'undefined'
        ? now - lastFrameTime
        : 0.16666;
      requestAnimationFrame(render);

      this.props.update(dt);
      renderer.render(this.scene, this.camera);

      // NOTE: At the end of each frame, notify `Expo.GLView` with the below
      gl.endFrameEXP();

      lastFrameTime = now;
    };

    render();
  };

  render() {
    const { style, ...props } = this.props;
    return (
      Expo.Constants.isDevice && <Expo.GLView
        {...this.panResponder.panHandlers}
        style={StyleSheet.flatten([StyleSheet.absoluteFill, style])}
        onContextCreate={this._onGLContextCreate}
      />
    );
  }

}
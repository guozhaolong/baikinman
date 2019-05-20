import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import * as Expo from 'expo';
import { THREE } from 'expo-three';
import _ from 'lodash'
import { Bottle, Node, Aqua, SpriteView } from './GameKit';
import {MOVE_SPEED} from './Constants';
const {width,height} = Dimensions.get('window')

export default class Game extends React.Component {

  state = {
    score: 0,
  };

  selected = null;
  moving = false;
  backing = true;
  falling = false;
  sourceAqua = null;
  targetAqua = null;

  componentWillMount() {
    THREE.suppressExpoWarnings(true);
  }

  componentWillUnmount() {
    THREE.suppressExpoWarnings(false);
  }

  onSetup = async ({ scene,camera }) => {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.touch = new THREE.Vector2();
    await this.initBottle();
  }

  initBottle = async () => {
    const { scene } = this;
    const { size } = scene;
    this.bottle = new Bottle({ size });
    this.setState({test:this.bottle.width})
    await this.bottle.reset();
    scene.add(this.bottle);
  }

  touchDown({x,y}) {
    if(!this.moving) {
      this.touch.x = (x / width) * 2 - 1;
      this.touch.y = -(y / height) * 2 + 1;
      this.raycaster.setFromCamera(this.touch, this.camera);
      let intersects = this.raycaster.intersectObjects(this.bottle.children);
      if (intersects.length > 0) {
        this.selected = intersects[0].object;
      }
    }
  }

  touchUp({moveX,moveY,x,y}) {
    if(!this.moving && this.selected){
      this.touch.x = ( moveX / width ) * 2 - 1;
      this.touch.y = - ( moveY / height ) * 2 + 1;
      this.raycaster.setFromCamera(this.touch,this.camera);
      let intersects = this.raycaster.intersectObjects(this.bottle.neighbors(this.selected));
      if(intersects.length > 0){
        this.sourceAqua = this.selected.clone();
        this.targetAqua = intersects[0].object.clone();
        this.moving = true;
      }
    }
  }

  updateGame = async (delta) => {
    if(this.moving) {
      const source = this.bottle.getObjectByName(this.sourceAqua.name);
      const target = this.bottle.getObjectByName(this.targetAqua.name);
      const sourceRow = parseInt(this.sourceAqua.name.split(":")[0]);
      const sourceCol = parseInt(this.sourceAqua.name.split(":")[1]);
      const targetRow = parseInt(this.targetAqua.name.split(":")[0]);
      const targetCol = parseInt(this.targetAqua.name.split(":")[1]);
      if (sourceRow === targetRow) {
        if (sourceCol < targetCol) { //right
          source.position.x += MOVE_SPEED * delta;
          target.position.x -= MOVE_SPEED * delta;
          if (source.position.x >= this.targetAqua.position.x) {
            this.moving = false;
          }
        } else {                     //left
          source.position.x -= MOVE_SPEED * delta;
          target.position.x += MOVE_SPEED * delta;
          if (source.position.x <= this.targetAqua.position.x) {
            this.moving = false;
          }
        }
      } else {
        if (sourceRow < targetRow) { //bottom
          source.position.y -= MOVE_SPEED * delta;
          target.position.y += MOVE_SPEED * delta;
          if (source.position.y <= this.targetAqua.position.y) {
            this.moving = false;
          }
        } else {                     //top
          source.position.y += MOVE_SPEED * delta;
          target.position.y -= MOVE_SPEED * delta;
          if (source.position.y >= this.targetAqua.position.y) {
            this.moving = false;
          }
        }
      }
      if (!this.moving) {
        source.position.x = this.targetAqua.position.x;
        target.position.x = this.sourceAqua.position.x;
        source.position.y = this.targetAqua.position.y;
        target.position.y = this.sourceAqua.position.y;
        source.name = this.targetAqua.name;
        target.name = this.sourceAqua.name;
        if (this.bottle.removable() || this.falling) {
          if(!this.falling) {
            this.bottle.removing();
            this.backing = false;
            this.falling = true;
          }
          if(this.falling) {
            const comp = this.bottle.falling(delta);
            if(comp){
              this.falling = false;
            }
          }
          // await this.bottle.filling(delta);
          // this.setState({score: this.state.score + c})

        }
      }
    }
    if(!this.moving && this.backing){
      const target = this.bottle.getObjectByName(this.sourceAqua.name);
      const source = this.bottle.getObjectByName(this.targetAqua.name);
      const sourceRow = parseInt(this.sourceAqua.name.split(":")[0]);
      const sourceCol = parseInt(this.sourceAqua.name.split(":")[1]);
      const targetRow = parseInt(this.targetAqua.name.split(":")[0]);
      const targetCol = parseInt(this.targetAqua.name.split(":")[1]);
      if (sourceRow === targetRow) {
        if (sourceCol < targetCol) { //right
          source.position.x -= MOVE_SPEED * delta;
          target.position.x += MOVE_SPEED * delta;
          if (source.position.x <= this.sourceAqua.position.x) {
            this.backing = false;
          }
        } else {                     //left
          source.position.x += MOVE_SPEED * delta;
          target.position.x -= MOVE_SPEED * delta;
          if (source.position.x >= this.sourceAqua.position.x) {
            this.backing = false;
          }
        }
      } else {
        if (sourceRow < targetRow) { //bottom
          source.position.y += MOVE_SPEED * delta;
          target.position.y -= MOVE_SPEED * delta;
          if (source.position.y >= this.sourceAqua.position.y) {
            this.backing = false;
          }
        } else {                     //top
          source.position.y -= MOVE_SPEED * delta;
          target.position.y += MOVE_SPEED * delta;
          if (source.position.y <= this.sourceAqua.position.y) {
            this.backing = false;
          }
        }
      }
      if (!this.backing) {
        source.position.x = this.sourceAqua.position.x;
        target.position.x = this.targetAqua.position.x;
        source.position.y = this.sourceAqua.position.y;
        target.position.y = this.targetAqua.position.y;
        source.name = this.sourceAqua.name;
        target.name = this.targetAqua.name;
      }
    }
    this.bottle.aquaAnimation(delta)
  }

  render() {
    return (
      <View style={StyleSheet.absoluteFill}>
        <SpriteView
          touchDown={(position) => {this.touchDown(position)}}
          touchMoved={(position) => {}}
          touchUp={(position) => {this.touchUp(position)}}
          update={this.updateGame}
          onSetup={this.onSetup}
        />
        {/*<Text style={{marginTop:40}}>{this.state.score}</Text>*/}
      </View>
    );
  }
}
import React from 'react';
import { THREE } from 'expo-three';
import {ROWS,COLS,AQUA_NAME,AQUA_DISTANCE,TOP_GAP,FALL_SPEED} from '../Constants';
import Files from "../Files";
import Aqua from "./Aqua";

export default class Bottle extends THREE.Group {

  score = 0;

  constructor({ ...props }) {
    super(props);
    this.size = props.size;
  }

  randomAll(){
    const result = Array(ROWS).fill(0).map(() => Array(COLS).fill(0));
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        do {
          result[i][j] = Math.round(Math.random() * 5);
        } while ((i > 1 && result[i][j] === result[i - 1][j] && result[i][j] === result[i - 2][j])
        || (j > 1 && result[i][j] === result[i][j - 1] && result[i][j] === result[i][j - 2]))
      }
    }
    return result;
  }

  reset = async () =>{
    this.removeAll();
    const w = this.getAquaWidth();
    const startX = -(this.size.width-w)/2 + AQUA_DISTANCE;
    const startY = (this.size.height-w)/2-TOP_GAP - AQUA_DISTANCE;
    const b = this.randomAll();
    for(let i = 0; i < ROWS; i++){
      for(let j = 0; j < COLS; j++){
        const sprite = await this.setupAqua({
          clazz: AQUA_NAME[b[i][j]],
          x: startX + w*j + AQUA_DISTANCE*j,
          y: startY - w*i - AQUA_DISTANCE*i,
          w: w,
          h: w,
          row: i,
          col: j,
        });
        this.add(sprite);
      }
    }
  }

  getAquaWidth() {
    return (this.size.width-AQUA_DISTANCE*(COLS+1))/COLS
  }

  setupAqua = async ({clazz,x,y,w,h,row,col}) => {
    const aqua = new Aqua();
    await aqua.setup({
      image: Files.sprites[clazz],
      size: {
        width: w,
        height: h,
      },
    });
    aqua.position.x = x;
    aqua.position.y = y;
    aqua.name = row+":"+col;
    aqua.clazz = clazz;
    return aqua;
  }

  neighbors = (node) => {
    const row = parseInt(node.name.split(":")[0]);
    const col = parseInt(node.name.split(":")[1]);
    return [
      this.getObjectByName((row+1)+":"+col),
      this.getObjectByName((row-1)+":"+col),
      this.getObjectByName(row+":"+(col+1)),
      this.getObjectByName(row+":"+(col-1))].filter(_ => _ !== undefined);
  }

  swappable = (source,target) => {
    const sourceRow = parseInt(source.name.split(":")[0]);
    const sourceCol = parseInt(source.name.split(":")[1]);
    const targetRow = parseInt(target.name.split(":")[0]);
    const targetCol = parseInt(target.name.split(":")[1]);
    let sourceColCount = 1;
    let targetColCount = 1;
    for(let j=sourceRow-1;j>=0;j--){
      const sourceColObj = this.getObjectByName(j+":"+sourceCol);
      const targetColObj = this.getObjectByName(j+":"+targetCol);
      if(sourceColObj && sourceColObj.clazz === target.clazz){
        sourceColCount++;
      }
      if(targetColObj && targetColObj.clazz === source.clazz){
        targetColCount++;
      }
    }
    for(let j=sourceRow+1;j<ROWS;j++){
      const sourceColObj = this.getObjectByName(j+":"+sourceCol);
      const targetColObj = this.getObjectByName(j+":"+targetCol);
      if(sourceColObj && sourceColObj.clazz === target.clazz){
        sourceColCount++;
      }
      if(targetColObj && targetColObj.clazz === source.clazz){
        targetColCount++;
      }
    }
    if(sourceColCount >=3 || targetColCount >= 3)
      return true;
    else
      return false;
  }

  removable = () => {
    for(let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        let k = j+1;
        for(; k < COLS; k++){
          const obj1 = this.getObjectByName(i+":"+j);
          const obj2 = this.getObjectByName(i+":"+k);
          if(!obj1 || !obj2 || obj1.clazz !== obj2.clazz){
            break;
          }
        }
        if(k - j >= 3){
          for(let l = j;l < k;l++){
            const obj = this.getObjectByName(i+":"+l);
            if(obj)
              return true;
          }
        }
        j = k -1;
      }
    }
    for(let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        let k = j+1;
        for(; k < ROWS; k++){
          const obj1 = this.getObjectByName(j+":"+i);
          const obj2 = this.getObjectByName(k+":"+i);
          if(!obj1 || !obj2 || obj1.clazz !== obj2.clazz){
            break;
          }
        }
        if(k - j >= 3){
          for(let l = j;l < k;l++){
            const obj = this.getObjectByName(l+":"+i);
            if(obj)
              return true;
          }
        }
        j = k -1;
      }
    }
    return false;
  }

  removing = () => {
    for(let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        let k = j+1;
        for(; k < COLS; k++){
          const obj1 = this.getObjectByName(i+":"+j);
          const obj2 = this.getObjectByName(i+":"+k);
          if(!obj1 || !obj2 || obj1.clazz !== obj2.clazz){
            break;
          }
        }
        if(k - j >= 3){
          for(let l = j;l < k;l++){
            const obj = this.getObjectByName(i+":"+l);
            if(obj)
              obj.alive = false;
          }
        }
        j = k -1;
      }
    }
    for(let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        let k = j+1;
        for(; k < ROWS; k++){
          const obj1 = this.getObjectByName(j+":"+i);
          const obj2 = this.getObjectByName(k+":"+i);
          if(!obj1 || !obj2 || obj1.clazz !== obj2.clazz){
            break;
          }
        }
        if(k - j >= 3){
          for(let l = j;l < k;l++){
            const obj = this.getObjectByName(l+":"+i);
            if(obj)
              obj.alive = false;
          }
        }
        j = k -1;
      }
    }
    this.children.filter(_ => !_.alive).map(_ => {this.score++;this.remove(_)});
  }

  falling = (delta) => {
    const h = this.getAquaWidth()+AQUA_DISTANCE;
    let complete = false;
    for(let i = 0; i < COLS; i++) {
      let indicator = 0;
      complete = false;
      for (let j = ROWS-1; j >= 0; j--) {
        const obj = this.getObjectByName(j+":"+i);
        if(!obj){
          indicator++;
        }else if(indicator > 0){
          obj.name = (j - indicator)+":"+i;
          obj.position.y -=  delta * FALL_SPEED;
          if(obj.position.y <= h * indicator){
            obj.position.y = h * indicator;
            complete = true;
          }
        }
      }
    }
    return complete
  }

  filling = async (delta) => {
    const w = this.getAquaWidth();
    const startX = -(this.size.width-w)/2 + AQUA_DISTANCE;
    const startY = (this.size.height-w)/2-TOP_GAP - AQUA_DISTANCE;
    for(let i = 0; i < COLS; i++) {
      for (let j = ROWS - 1; j >= 0; j--) {
        const obj = this.getObjectByName(j+":"+i);
        if(!obj){
          for(; j >= 0; j--){
            const sprite = await this.setupAqua({
              clazz: AQUA_NAME[Math.round(Math.random() * 5)],
              x: startX + w*i + AQUA_DISTANCE*i,
              y: startY - w*j - AQUA_DISTANCE*j,
              w: w,
              h: w,
              row: j,
              col: i,
            });
            this.add(sprite);
          }
          break;
        }
      }
    }
  }

  aquaAnimation = (delta) => {
    this.children.forEach(_ => _.animation.update(1000 * delta))
  }

  removeAll = () => {
    while (this.children.length) {
      this.remove(this.children[0]);
    }
  };

  forEachAlive = (callback, callbackContext, args) => {
    this.traverse(function(node) {
      if (node.alive) {
        callback(node);
      }
    });
  };
}
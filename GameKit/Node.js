import { THREE } from 'expo-three'

export default class Node extends THREE.Group {
  get size() {
    const selectedSprite = this.getSelectedSprite();
    if (selectedSprite) {
      return selectedSprite.size;
    }
    return { width: null, height: null };
  }

  get angle() {
    return this.rotation.z;
  }
  set angle(angle) {
    this.rotation.z = angle;
  }

  get x() {
    return this.position.x;
  }
  set x(value) {
    this.position.x = value;
  }
  get y() {
    return this.position.y;
  }
  set y(value) {
    this.position.y = value;
  }

  alive = true;
  exists = true;
  renderable = true;
  fresh = true;

  kill = () => {
    this.alive = this.exists = this.visible = false;
    return this;
  };

  revive = health => {
    this.alive = this.exists = this.visible = true;
    this.health = health;
    return this;
  };

  reset = (x, y, health) => {
    this.fresh = this.exists = this.visible = this.renderable = true;
    this.position.x = x;
    this.position.y = y;
    this.health = health;
  };

  constructor({ sprites, sprite, selectedSpriteKey, ...props }) {
    super(props);

    if (!sprites) {
      if (sprite) {
        selectedSpriteKey = '0';
        sprites = { [selectedSpriteKey]: sprite };
      } else {
        return;
      }
    }

    Object.keys(sprites).map(val => {
      let _sprite = sprites[val];
      if (_sprite instanceof THREE.Object3D) {
        this.add(_sprite);
      }
      sprites[val].visible = false;
    });
    this.sprites = sprites;

    this.setSelectedSpriteKey(selectedSpriteKey || Object.keys(sprites)[0]);
  }

  setSelectedSpriteKey = key => {
    if (this.selectedSpriteKey != key) {
      for (let _key of Object.keys(this.sprites)) {
        let _sprite = this.sprites[_key];
        if (_key == key) {
          _sprite.visible = true;
        } else {
          _sprite.visible = false;
        }
      }

      this.isAnimating = key;
      const lastSprite = this.sprites[this.selectedSpriteKey];
      if (lastSprite) {
        lastSprite.visible = !this.isAnimating;
      }
      this.selectedSpriteKey = key;
    }
  };

  getSelectedSprite = () => {
    if (this.selectedSpriteKey) {
      if (this.sprites.hasOwnProperty(this.selectedSpriteKey)) {
        return this.sprites[this.selectedSpriteKey];
      }
    }
  };

  update(dt) {
    let sprite = this.getSelectedSprite();
    if (sprite) {
      sprite.animation.update(1000 * dt);
    }
  }
}
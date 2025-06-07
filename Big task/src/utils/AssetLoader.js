import * as THREE from 'three';
import { TextureLoader } from 'three';

export class AssetLoader {
  constructor() {
    this.textures = {};
    this.loadTextures();
  }

  loadTextures() {
    const loader = new TextureLoader();
    
    // 加载草地纹理
    this.textures.grass = loader.load('/assets/textures/grass.jpg');
   
   
    this.textures.road=loader.load('/assets/textures/road.jpg');
   
  }
  

  get(textureName) {
    return this.textures[textureName];
  }
}
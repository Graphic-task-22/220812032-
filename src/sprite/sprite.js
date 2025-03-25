import * as THREE from 'three';
// 创建精灵材质对象SpriteMaterial
const spriteMaterial = new THREE.SpriteMaterial({
    color:0x00ffff,//设置颜色
  });
  // 创建精灵模型对象，不需要几何体geometry参数
const sprite = new THREE.Sprite(spriteMaterial);

// 控制精灵大小
console.log('sprite.scale',sprite.scale);
sprite.scale.set(5, 2, 1); //只需要设置x、y两个分量就可以
export default sprite; 
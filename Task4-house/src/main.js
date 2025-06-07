import * as THREE from 'three';
import { setupScene } from './scene.js';
import createHouse from './house.js';

// 创建 canvas 挂载到页面
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// 设置场景
const { scene, camera, renderer, controls } = setupScene(canvas);

// 添加多个不同样式的房子
const houses = [
  createHouse({ baseColor: 0x5c8050, roofColor: 0x90ec00, baseSize: [40, 20, 40], roofHeight: 16, roofRadius: 32,}),

  
];

const positions = [
  [0, 0, 0],
  [40, 0, 0],
  [-40, 0, 0],
  [0, 0, 40],
  [0, 0, -40]
];

houses.forEach((house, i) => {
  house.position.set(...positions[i]);
  scene.add(house);
});


// 动画循环
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // 更新控制器
  renderer.render(scene, camera);
}

animate();
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import cube1 from "./mesh/cube1";
import cube from './mesh/cube';
import sphere from './mesh/sphere';
import plane from './mesh/plane';
import { initGUI } from './gui'; // 引入 gui.js

let renderer, camera, scene, ambientLight, pointLight; // 全局变量 场景、相机、渲染器、环境光、点光源

function init() {
  // 创建场景
  scene = new THREE.Scene();

  // 添加立方体、球体和另一个立方体到场景
  //scene.add(cube);
  //scene.add(sphere);
  //scene.add(cube1);
  //scene.add(plane);

  // 环境光
  ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);

  // 点光源
  pointLight = new THREE.PointLight(0xffffff, 5, 1000); // 强度提升到 5
  pointLight.position.set(0, 100, 0); // 光源置于平面上方
  scene.add(pointLight);


  // 创建相机
  // 相机配置调整
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1, // 近裁剪面调整为 1
    10000 // 远裁剪面扩展到 10000
  );
  camera.position.set(0, 0, 300); // 
  camera.lookAt(0, 0, 0);
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding; // 匹配纹理色彩空间
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  // 初始化 GUI
  initGUI(plane, ambientLight, pointLight, plane.material);

  // 初始化辅助工具
  initHelper();

  // 初始化性能监控
  initStats();

  // 开始渲染循环
  animate();
}

// 窗口调整大小事件
window.onresize = function () {
  if (!renderer) return;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
};

// 初始化辅助工具
function initHelper() {
  // 辅助坐标轴
  const axesHelper = new THREE.AxesHelper(200); // 参数为坐标轴长度
  scene.add(axesHelper);

  // 轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', () => renderer.render(scene, camera));

  // 网格地面（可选，与坐标轴配合使用）
  const gridHelper = new THREE.GridHelper(300, 25, 0x444444, 0x444444);
  scene.add(gridHelper);
}
// 初始化性能监控
function initStats() {
  const stats = new Stats();
  document.body.appendChild(stats.domElement);

  function render() {
    stats.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render(); 
}

// 渲染循环
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // 立方体旋转
  /*cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // 另一个立方体旋转
  cube1.rotation.x += 0.01;
  cube1.rotation.y += 0.01;*/
}

// 初始化
init();
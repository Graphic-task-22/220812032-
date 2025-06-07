import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupScene(canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.set(30, 30, 40);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 添加 OrbitControls 控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 惯性效果
  controls.dampingFactor = 0.05;

  // 灯光
  const ambient = new THREE.AmbientLight(0x888888,3);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(50, 50, 50);
  scene.add(dirLight);

  return { scene, camera, renderer, controls };
}
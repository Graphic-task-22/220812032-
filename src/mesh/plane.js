// src/mesh/plane.js
import * as THREE from 'three';

// 创建几何体（尺寸建议调整为 1:1 适应纹理）
const geometry = new THREE.SphereGeometry(60, 25, 25); //球体

const texLoader = new THREE.TextureLoader();
const texture = texLoader.load(
  '/assets/earth_atmos_2048.jpg',
);

// 配置正确的材质参数
// 确保使用支持透明度的材质类型
const material = new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true // 必须启用才能使用透明度
  });

// 创建平面网格并居中
const plane = new THREE.Mesh(geometry, material);

export default plane;
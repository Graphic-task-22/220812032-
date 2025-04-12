import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

// 创建平面几何体
const geometry = new THREE.PlaneGeometry(500, 500, 200, 200);

// 创建材质，将颜色改为金色
const material = new THREE.MeshBasicMaterial({
    color: 0xFFD700, // 金色
    wireframe: true
});

// 创建二维噪声函数
const noise2D = createNoise2D();

// 创建平面网格
const planeMesh = new THREE.Mesh(geometry, material);

// 缓存时间，避免每一帧都重新获取 Date.now()
let prevTime = Date.now();

export function updatePosition() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - prevTime) * 0.001; // 转换为秒
    prevTime = currentTime;

    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);

        // 计算噪声值
        const z = noise2D(x / 100, y / 100) * 50;

        // 增加更复杂的动画效果
        const sinNum1 = Math.sin((currentTime * 0.002 + x * 0.05));
        const sinNum2 = Math.cos((currentTime * 0.001 + y * 0.03));
        const animatedHeight = (sinNum1 + sinNum2) * 10;

        positions.setZ(i, z + animatedHeight);
    }
    positions.needsUpdate = true;
}

// 将平面绕 X 轴旋转 -Math.PI/2
planeMesh.rotateX(-Math.PI / 2);

export default planeMesh;
    
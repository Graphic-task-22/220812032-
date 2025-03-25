import * as THREE from 'three';

// 创建CylinderGeometry（圆柱体）对象
// 参数：顶部半径、底部半径、高度、径向分段数、高度分段数
const geometry = new THREE.CylinderGeometry(15, 15, 50, 32);

// 给一个材质，让它有颜色
const material = new THREE.MeshPhongMaterial({
  color: 0x0000ff, // 红色
  opacity: 0.8,
  transparent: true,
});

// Mesh（网格）。 网格包含一个几何体以及作用在此几何体上的材质，我们可以直接将网格对象放入到我们的场景中，并让它在场景中自由移动。
const cylinder = new THREE.Mesh(geometry, material);
cylinder.position.set(50, 100, 20);

export default cylinder;
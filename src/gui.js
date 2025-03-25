import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export function initGUI(plane, ambientLight, pointLight, material) { // 修改参数为 plane
  const gui = new GUI();

  // 平面位置控制
  const positionFolder = gui.addFolder('平面位置');
  positionFolder.add(plane.position, 'x', -500, 500).name('X坐标').step(1); // 扩大范围适配场景
  positionFolder.add(plane.position, 'y', -500, 500).name('Y坐标').step(1);
  positionFolder.add(plane.position, 'z', -500, 500).name('Z坐标').step(1);
  positionFolder.open();

  // 材质参数控制（适配 MeshLambertMaterial）
  const materialFolder = gui.addFolder('平面材质');
  materialFolder.addColor({ color: material.color.getHex() }, 'color') // 颜色控件需要特殊处理
    .name('基础颜色')
    .onChange(val => material.color.setHex(val));
  
  materialFolder.add(material, 'visible').name('可见性');
  materialFolder.add(material, 'wireframe').name('线框模式');
  materialFolder.add(material, 'transparent').name('透明度开关');
  materialFolder.add(material, 'opacity', 0, 1).name('透明度值').step(0.01);
  materialFolder.open();

  // 光源控制（修正颜色更新逻辑）
  const lightFolder = gui.addFolder('光源设置');
  
  // 环境光控制
  lightFolder.addColor({ color: ambientLight.color.getHex() }, 'color')
    .name('环境光颜色')
    .onChange(val => ambientLight.color.setHex(val));
  
  lightFolder.add(ambientLight, 'intensity', 0, 5).name('环境光强度');

  // 点光源控制
  lightFolder.addColor({ color: pointLight.color.getHex() }, 'color')
    .name('点光源颜色')
    .onChange(val => pointLight.color.setHex(val));
  
  lightFolder.add(pointLight, 'intensity', 0, 10).name('点光源强度');
  
  const pointLightPositionFolder = lightFolder.addFolder('点光源位置');
  pointLightPositionFolder.add(pointLight.position, 'x', -500, 500).name('X坐标');
  pointLightPositionFolder.add(pointLight.position, 'y', -500, 500).name('Y坐标');
  pointLightPositionFolder.add(pointLight.position, 'z', -500, 500).name('Z坐标');
  pointLightPositionFolder.open();
  
  lightFolder.open();

  // 重置功能优化
  const settings = {
    resetGUI: () => gui.reset(),
    resetDefaults: () => {
      // 平面默认位置和材质
      plane.position.set(0, 0, 0);
      material.color.set(0xffffff);
      material.transparent = false;
      material.opacity = 1;
      material.wireframe = false;
      
      // 光源默认值
      ambientLight.color.set(0xffffff);
      ambientLight.intensity = 2;
      pointLight.color.set(0xffffff);
      pointLight.intensity = 5;
      pointLight.position.set(0, 100, 0);
    }
  };

  gui.add(settings, 'resetGUI').name('重置GUI参数');
  gui.add(settings, 'resetDefaults').name('恢复默认配置');
}
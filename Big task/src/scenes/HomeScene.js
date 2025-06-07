import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AssetLoader } from '../utils/AssetLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'; // 添加此行
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // 添加此行
export class HomeScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.loader = new AssetLoader();
    this.clock = new THREE.Clock();
    this.keys = { w: false, a: false, s: false, d: false };

    this.isCameraFollowing = false; // 初始为自由模式，按F1切换
    
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.setupLights();
    this.createRectangularGrass(); // 创建草地
    this.createHighway(); // 创建马路
    //房子
    this.createSideWall();
    this.createDoor();
    this.createBackWall();
    this.createRoof();
    this.createFrontWall();
    this.createWindow();
    this.createFloor();

    this.loadBedModel(); // 加载床模型

    this.loadDuckModel(); // 加载鸭子模型
    this.loadChairModel(); // 加载椅子模型
    this.loadShelfModel(); // 加载柜子模型
    this.loadChairsModel(); // 加载椅子2模型
    


this.loadBoatModel(); // 加载船模型
this.loadHouseModel(); // 加载房子模型
this.loadTreeModel({
  modelPath: '/assets/GLTF/bamboo_tree/scene.gltf',

  scale: 1,
  houseRadius: 1800
});

 this.loadTreeModel({
  modelPath: '/assets/GLTF/maple_trees/scene.gltf',
 
  scale: 1,
  houseRadius:2000
});

this.loadTreeModel({
  modelPath: '/assets/GLTF/pine_tree/scene.gltf',

  scale: 0.9,
  houseRadius: 1850
});

this.loadTreeModel({
  modelPath: '/assets/GLTF/stylized_tree/scene.gltf',
 
  scale: 0.9,
  houseRadius: 1700
});
this.loadTreeModel({
  modelPath: '/assets/GLTF/tree/scene.gltf',

  scale: 0.9,
  houseRadius: 2000
});
    this.setupControls();
  
    
    this.animate();
  }
  
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0); 
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45, // 原50→45，减少视野范围减轻渲染压力
      window.innerWidth / window.innerHeight,
      0.1,
      3000 // 原5000→3000，减少远裁剪平面
    );
    this.camera.position.set(1000, 800, 1000); // 提高相机高度，视野更开阔
    this.camera.lookAt(800, 200, 0);
  }
  

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
    this.renderer.shadowMap.enabled =false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setupLights() {
    // 主光源（调整为侧光，降低强度）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4); // 强度降至0.4
    directionalLight.position.set(1200, 400, -200); // 移至场景左前上方（侧光角度）
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024); // 进一步降低阴影分辨率
    directionalLight.shadow.camera.far = 1000;
    this.scene.add(directionalLight);
  
    // 环境光（降低整体亮度）
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2); // 强度降至0.2
    this.scene.add(ambientLight);
  

  }
  
  createRectangularGrass() {
    // 创建草地（900x900）
    const grassGeometry = new THREE.PlaneGeometry(4000, 4000);
    
    // 加载草地纹理（801x760）
    const grassTexture = this.loader.get('grass');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 20); // 精准重复率
    grassTexture.anisotropy = 32;
    
    // 创建草地材质（带Alpha混合）
    const grassMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 0.9,
      metalness: 0,
      alphaTest: 0.5, // 透明阈值
      transparent: true // 开启透明
    });
    
    // 草地网格
    this.grass = new THREE.Mesh(grassGeometry, grassMaterial);
    this.grass.rotation.x = -Math.PI / 2;
    this.grass.receiveShadow = true;
    this.scene.add(this.grass);
  }

  createHighway() {
    // 创建马路（800x300，居中于草地）
    const highwayGeometry = new THREE.PlaneGeometry(4000, 380);
    
    // 加载马路纹理（703x538，含黄色法线）
    const roadTexture = this.loader.get('road');
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1.6, 1); // 精准重复率
    roadTexture.anisotropy = 20;
    
    // 创建马路材质（优化反光与过渡）
    const highwayMaterial = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.6, // 降低粗糙度增加光泽
      metalness: 0.15,
      side: THREE.DoubleSide,
      alphaTest: 0.4,
      transparent: true
    });

    
    // 马路网格（位置居中，高度差0.05避免闪烁）
    this.highway = new THREE.Mesh(highwayGeometry, highwayMaterial);
    this.highway.rotation.x = -Math.PI / 2;
    this.highway.rotation.z = -Math.PI / 2;


    this.highway.position.set(0, 0.2, 0); // 与草地高度差0.05
    this.highway.receiveShadow = true;
    this.scene.add(this.highway);

  
  }
  

  createSideWall() {
    const shape = new THREE.Shape();
    shape.moveTo(-100, 0);
    shape.lineTo(100, 0);
    shape.lineTo(100,100);
    shape.lineTo(0,150);
    shape.lineTo(-100,100);
    shape.lineTo(-100,0);

    const extrudeGeometry = new THREE.ExtrudeGeometry( shape );

    const texture = new THREE.TextureLoader().load('/assets/textures/wall2.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 0.01, 0.005 );

    var material = new THREE.MeshBasicMaterial( {map: texture} );

    const sideWall = new THREE.Mesh( extrudeGeometry, material ) ;
    const sideWall2 = new THREE.Mesh( extrudeGeometry, material ) ;
    
    this.scene.add(sideWall);
    this.scene.add(sideWall2);
    sideWall.position.set(800, 0.2,0 );
    sideWall2.position.set(800, 0.2,0 );
    sideWall2.position.z = 150;
    sideWall.position.z= -150;

    return sideWall;
}
createBackWall() {
  const shape = new THREE.Shape();
  shape.moveTo(-150, 0)
  shape.lineTo(150, 0)
  shape.lineTo(150,100)
  shape.lineTo(-150,100);

  const extrudeGeometry = new THREE.ExtrudeGeometry( shape ) 

  const texture = new THREE.TextureLoader().load('/assets/textures/wall.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 0.01, 0.005 );

  const material = new THREE.MeshBasicMaterial({map: texture});

  const backWall = new THREE.Mesh( extrudeGeometry, material) ;

  //backWall.position.z = 800;
  backWall.position.x = 1000;
  backWall.rotation.y = Math.PI * 0.5;
  backWall.position.set(900, 0.2,0 );
  this.scene.add(backWall);
}
createFloor() {
  const geometry = new THREE.PlaneGeometry( 200, 300);

  const texture = new THREE.TextureLoader().load('/assets/textures/floor.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 4, 4 );

  const material = new THREE.MeshBasicMaterial({map: texture});
  
  const floor = new THREE.Mesh( geometry, material );

  floor.rotation.x = -0.5 * Math.PI;
floor.position.set(800, 0.3,0 );
  this.scene.add(floor);
}
  
createFrontWall() {
  const shape = new THREE.Shape();
  shape.moveTo(-150, 0);
  shape.lineTo(150, 0);
  shape.lineTo(150,100);
  shape.lineTo(-150,100);
  shape.lineTo(-150,0);

  const window = new THREE.Path();
  window.moveTo(30,30)
  window.lineTo(80, 30)
  window.lineTo(80, 80)
  window.lineTo(30, 80);
  window.lineTo(30, 30);
  shape.holes.push(window);

  const door = new THREE.Path();
  door.moveTo(-30, 0)
  door.lineTo(-30, 80)
  door.lineTo(-80, 80)
  door.lineTo(-80, 0);
  door.lineTo(-30, 0);
  shape.holes.push(door);

  const extrudeGeometry = new THREE.ExtrudeGeometry( shape ) 

  const texture = new THREE.TextureLoader().load('/assets/textures/wall.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 0.01, 0.005 );

  const material = new THREE.MeshBasicMaterial({map: texture} );

  const frontWall = new THREE.Mesh( extrudeGeometry, material ) ;

  //frontWall.position.z = 150;
  frontWall.position.x = 100;
  frontWall.position.y = -150;
  frontWall.rotation.y = Math.PI * 0.5;
  frontWall.position.set(700, 0.2,0 );
  this.scene.add(frontWall);
}
createWindow() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, 50)
  shape.lineTo(50,50)
  shape.lineTo(50,0);
  shape.lineTo(0, 0);

  const hole = new THREE.Path();
  hole.moveTo(5,5)
  hole.lineTo(5, 45)
  hole.lineTo(45, 45)
  hole.lineTo(45, 5);
  hole.lineTo(5, 5);
  shape.holes.push(hole);

  const extrudeGeometry = new THREE.ExtrudeGeometry(shape);

  const texture = new THREE.TextureLoader().load('/assets/textures/window.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 0.1, 0.005 );

  const material = new THREE.MeshBasicMaterial({map: texture} );

  var window = new THREE.Mesh( extrudeGeometry, material ) ;
  window.rotation.y = Math.PI / 2;
 
  window.position.x = 700;
  window.position.y = 30;
  window.position.z = -30;
  this.scene.add(window);

  return window;
}
createDoor() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, 80);
  shape.lineTo(50,80);
  shape.lineTo(50,0);
  shape.lineTo(0, 0);

  const hole = new THREE.Path();
  hole.moveTo(5,5);
  hole.lineTo(5, 75);
  hole.lineTo(45, 75);
  hole.lineTo(45, 5);
  hole.lineTo(5, 5);
  shape.holes.push(hole);

  const extrudeGeometry = new THREE.ExtrudeGeometry( shape );
  const texture = new THREE.TextureLoader().load('/assets/textures/men.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 0.15, 0.005 );

  const material = new THREE.MeshBasicMaterial({map: texture} );


  const door = new THREE.Mesh( extrudeGeometry, material ) ;

  door.rotation.y = Math.PI / 2;
  
  door.position.x = 700;
  door.position.z= 80;
  this.scene.add(door);
}
createRoof() {
  const geometry = new THREE.BoxGeometry( 120, 320, 10 );

    const texture = new THREE.TextureLoader().load('/assets/textures/roof.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 5, 1);
    texture.rotation = Math.PI / 2;
    const textureMaterial = new THREE.MeshBasicMaterial({ map: texture});

    const colorMaterial = new THREE.MeshBasicMaterial({ color: 'grey' });

    const materials = [
        colorMaterial,
        colorMaterial,
        colorMaterial,
        colorMaterial,
        colorMaterial,
        textureMaterial
    ];

    const roof = new THREE.Mesh( geometry, materials );
    const roof2 = new THREE.Mesh( geometry, materials );
    this.scene.add(roof2);
    
    this.scene.add(roof);

    roof.rotation.x = Math.PI / 2;
    roof.rotation.y = - Math.PI / 4 * 0.6;

    roof.position.y = 60;
    
      
    roof2.rotation.x = Math.PI / 2;
    roof2.rotation.y = Math.PI / 4 * 0.6;
    roof2.position.y = 60;
   
    roof.position.set(850, 120);
    roof2.position.set(750, 120);
}
  // 加载并放置床模型
  loadBedModel() {
    const loader = new FBXLoader();
    loader.load(
      '/assets/models/bed.fbx', // 模型路径
      (model) => {
        this.setupBedModel(model); // 处理加载后的模型
      },
      (xhr) => {
        console.log(`FBX 加载进度: ${xhr.loaded / xhr.total * 100}%`);
      },
      (error) => {
        console.error('FBX 加载失败:', error);
      }
    );
  }

  // 处理模型位置、缩放和材质
  setupBedModel(model) {
    // 调整模型位置（假设房子内部坐标为 x=800, z=0，地板高度 y=0.3）
    model.position.set(860, 0.1, 0); // 放在地板上方
    model.scale.set(0.8, 0.8, 0.8); // 缩小模型（根据实际尺寸调整）
    model.position.z=-70;
    model.opcity = 1; // 确保模型不透明
  
    this.scene.add(model); // 添加到场景
  }
   
  // 处理模型位置、缩放和材质
  
  loadDuckModel() {
    const loader = new FBXLoader();
    loader.load(
      '/assets/models/duck.fbx', // 模型路径
      (model) => {
        this.setupDuckModel(model); // 处理加载后的模型
      },
      (xhr) => {
        console.log(`FBX 加载进度: ${xhr.loaded / xhr.total * 100}%`);
      },
      (error) => {
        console.error('FBX 加载失败:', error);
      }
    );
  }

  // 处理模型位置、缩放和材质
  setupDuckModel(model) {
    // 调整模型位置（假设房子内部坐标为 x=800, z=0，地板高度 y=0.3）
    model.position.set(1500, 0, 0); // 放在地板上方
    model.scale.set(0.003, 0.003, 0.003); // 缩小模型（根据实际尺寸调整）
    model.rotation.y = Math.PI/2; // 面向房子内部
    model.position.z=600;
   
    this.scene.add(model); // 添加到场景
  }
  loadBoatModel() {
    const loader = new FBXLoader();
    loader.load(
      '/assets/models/boat.fbx', // 模型路径
      (model) => {
        this.setupBoatModel(model); // 处理加载后的模型
      },
      (xhr) => {
        console.log(`FBX 加载进度: ${xhr.loaded / xhr.total * 100}%`);
      },
      (error) => {
        console.error('FBX 加载失败:', error);
      }
    );
  }

  // 处理模型位置、缩放和材质
  setupBoatModel(model) {
    // 调整模型位置（假设房子内部坐标为 x=800, z=0，地板高度 y=0.3）
    model.position.set(500, 160, 0); // 放在地板上方
    model.scale.set(0.3, 0.3, 0.3); // 缩小模型（根据实际尺寸调整）
    model.rotation.y = Math.PI/2; // 面向房子内部
    model.position.z=-500;
   
    this.scene.add(model); // 添加到场景
  }
  loadHouseModel() {
    const loader = new FBXLoader();
    loader.load(
      '/assets/models/house.fbx', // 模型路径
      (model) => {
        this.setupHouseModel(model); // 处理加载后的模型
      },
      (xhr) => {
        console.log(`FBX 加载进度: ${xhr.loaded / xhr.total * 100}%`);
      },
      (error) => {
        console.error('FBX 加载失败:', error);
      }
    );
  }

  // 处理模型位置、缩放和材质
  setupHouseModel(model) {
    // 调整模型位置（假设房子内部坐标为 x=800, z=0，地板高度 y=0.3）
    model.position.set(1000, 10, 800); // 放在地板上方
    model.scale.set(0.3, 0.3, 0.3); // 缩小模型（根据实际尺寸调整）
    model.rotation.y = Math.PI/2; // 面向房子内部
    model.position.x=1000;
   
   
    this.scene.add(model); // 添加到场景
  }

// 统一的树木加载函数（简化版，无碰撞检测）
loadTreeModel(treeConfig) {
  const { 
    modelPath,       // 模型路径
    count = 30,      // 树木数量
    baseScale = 1.0, // 基础缩放
    scaleVariance = 0.6, // 缩放随机变化范围
    houseRadius = 200,   // 避开房子的半径
    roadWidth = 380,     // 避开马路的宽度
    batchSize = 50,       // 每批加载数量（提高批量大小）
    batchDelay = 0.01,    // 批次间隔时间(ms)（减少延迟）
    clusterFactor = 0.2 // 聚类因子(0-1)
  } = treeConfig;

  const loader = new GLTFLoader();
  const GRASS_SIZE = 3000;
  
  const treeGroup = new THREE.Group();
  this.scene.add(treeGroup);
  
  // 生成聚类中心（保持自然分布，但不检查碰撞）
  const clusterCenters = [];
  const numClusters = Math.max(1, Math.floor(count * 0.1));
  for (let i = 0; i < numClusters; i++) {
    const x = (Math.random() - 0.5) * GRASS_SIZE * 0.8;
    const z = (Math.random() - 0.5) * GRASS_SIZE * 0.8;
    
    // 仅避开房子区域（简化判断）
    const distFromHouse = Math.sqrt(Math.pow(x - 800, 2) + Math.pow(z, 2));
    if (distFromHouse > houseRadius) {
      clusterCenters.push({ x, z });
    }
  }
  
  // 分批加载树木
  const loadBatch = (batchIndex) => {
    const startIdx = batchIndex * batchSize;
    const endIdx = Math.min(startIdx + batchSize, count);
    
    for (let i = startIdx; i < endIdx; i++) {
      let center;
      if (clusterCenters.length > 0 && Math.random() < clusterFactor) {
        center = clusterCenters[Math.floor(Math.random() * clusterCenters.length)];
      }
      
      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          
          // 优化渲染
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false;
              child.receiveShadow = false;
              // 合并材质以减少绘制调用
              if (child.material) {
                child.material.needsUpdate = true;
              }
            }
          });
          
          // 生成随机位置（仅避开房子和马路）
          let x, z;
          let isValidPosition = false;
          let attempts = 0;
          
          while (!isValidPosition && attempts < 10) { // 减少尝试次数
            if (center) {
              const clusterRadius = Math.random() * 100 + 50;
              const angle = Math.random() * Math.PI * 2;
              x = center.x + Math.cos(angle) * clusterRadius;
              z = center.z + Math.sin(angle) * clusterRadius;
            } else {
              x = (Math.random() - 0.5) * GRASS_SIZE * 0.8;
              z = (Math.random() - 0.5) * GRASS_SIZE * 0.8;
            }
            
            // 仅检查房子和马路（移除树木间距和其他物体检查）
            const distFromHouse = Math.sqrt(Math.pow(x - 800, 2) + Math.pow(z, 2));
            const isInRoad = Math.abs(z) < roadWidth;
            
            if (distFromHouse > houseRadius && !isInRoad) {
              isValidPosition = true;
            }
            attempts++;
          }
          
          if (!isValidPosition) return;
          
          // 设置随机属性
          const randomScale = baseScale * (1 + (Math.random() - 0.5) * scaleVariance);
          model.scale.set(randomScale, randomScale, randomScale);
          model.rotation.y = Math.random() * Math.PI * 2;
          model.position.set(x, 0, z);
          
          treeGroup.add(model);
        },
        (xhr) => {},
        (error) => {
          console.error(`树 ${i+1}/${count} 加载失败:`, error);
        }
      );
    }
    
    if (endIdx < count) {
      setTimeout(() => loadBatch(batchIndex + 1), batchDelay);
    }
  };
  
  loadBatch(0);
}

  loadChairModel() {
    const loader = new FBXLoader();
    loader.load(
      '/assets/models/chair.fbx', // 模型路径
      (model) => {
        this.setupChairModel(model); // 处理加载后的模型
      },
      (xhr) => {
        console.log(`FBX 加载进度: ${xhr.loaded / xhr.total * 100}%`);
      },
      (error) => {
        console.error('FBX 加载失败:', error);
      }
    );
  }

  // 处理模型位置、缩放和材质
  setupChairModel(model) {
    // 调整模型位置（假设房子内部坐标为 x=800, z=0，地板高度 y=0.3）
    model.position.set(870, 0.1, 0); // 放在地板上方
    model.scale.set(0.5, 0.5, 0.5); // 缩小模型（根据实际尺寸调整）
    model.position.z=104;
    model.rotation.y = -Math.PI/2; // 面向房子内部
    

    this.scene.add(model); // 添加到场景
  }
  loadShelfModel() {
    const loader = new FBXLoader();
    loader.load(
      '/assets/models/shelf.fbx', // 模型路径
      (model) => {
        this.setupShelfModel(model); // 处理加载后的模型
      },
      (xhr) => {
        console.log(`FBX 加载进度: ${xhr.loaded / xhr.total * 100}%`);
      },
      (error) => {
        console.error('FBX 加载失败:', error);
      }
    );
  }
  setupShelfModel(model) {
    // 调整模型位置（假设房子内部坐标为 x=800, z=0，地板高度 y=0.3）
    model.position.set(830, 0.1, 0); // 放在地板上方
    model.scale.set(1, 1, 1); // 缩小模型（根据实际尺寸调整）
   model.position.z=-143;
   model.position.x=750;
   
    model.rotation.y = -Math.PI/2; // 面向房子内部
   

    this.scene.add(model); // 添加到场景
  }
  loadChairsModel() {
    const loader = new FBXLoader();
    loader.load(
      '/assets/models/chair1.fbx', // 模型路径
      (model) => {
        this.setupChairsModel(model); // 处理加载后的模型
      },
      (xhr) => {
        console.log(`FBX 加载进度: ${xhr.loaded / xhr.total * 100}%`);
      },
      (error) => {
        console.error('FBX 加载失败:', error);
      }
    );
  }

  // 处理模型位置、缩放和材质
  setupChairsModel(model) {
    // 调整模型位置（假设房子内部坐标为 x=800, z=0，地板高度 y=0.3）
    model.position.set(810, 0.1, 0); // 放在地板上方
    model.scale.set(0.5, 0.5, 0.5); // 缩小模型（根据实际尺寸调整）
   model.position.z=-90;
   model.position.x=750;
   
    model.rotation.y = -Math.PI; // 面向房子内部
   

    this.scene.add(model); // 添加到场景
  }

  // 加载女孩模型

  
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    this.controls.enableDamping = true; // 启用阻尼效果
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true; // 启用缩放
        this.controls.enablePan = true;  // 启用平移
    this.controls.enableRotate = true; // 启用旋转
    this.controls.screenSpacePanning = true; // 优化平移流畅度
    this.controls.maxDistance = 2000; // 限制最大缩放距离
    this.controls.minDistance = 500; // 限制最小缩放距离
  }
  
 

  // 动画循环
  animate() {
    requestAnimationFrame(() => this.animate());
  
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
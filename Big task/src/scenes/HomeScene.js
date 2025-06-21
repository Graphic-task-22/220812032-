import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AssetLoader } from '../utils/AssetLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; 
import { CharacterController } from './CharacterController.js'; // 导入角色控制器
import { ItemCollectionSystem } from './ItemCollectionSystem.js'; 


export class HomeScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.loader = new AssetLoader();
    this.clock = new THREE.Clock();
      // 加载进度管理
      this.totalModels = 0;
      this.loadedModels = 0;
      this.loadingProgress = 0;
      this.isReady = false;
  // 任务对话框相关属性
this.taskDialog = null;
this.ghostInteracted = false; // 标记是否已与Ghost交互
    this.initScene();
    this.initCamera();
     //设置高性能渲染参数
  
    this.initRenderer();

    this.setupLights();
     // 引用UI元素
     this.weatherToggleButton = null;
     this.collectionProgressElement = null;
    // 初始化加载页面
    this.initLoadingScreen();
    this.characterController = new CharacterController(this.scene, this.camera);
     // 简化音频实现（默认播放）
     this.initBGM();
     this.initSnowSound(); // 初始化雪天音效
     // 初始化按钮音效
    this.initButtonSound();
 
    this.itemCollectionSystem = new ItemCollectionSystem(this.scene, this.camera, {
      maxPickDistance: 100,
      debug: true,
      showDebugLines: false,
      pickupEffect: 'fade',
      cooldownTime: 300
    });
    

    this.createRectangularGrass();
    this.createHighway();
    // 传递草地信息给角色控制器（使用原始草地尺寸）
    if (this.characterController) {
      this.characterController.setGrassBounds(
        this.grass.position.x, 
        this.grass.position.z, 
        this.grass.geometry.parameters.width,
        this.grass.geometry.parameters.height
      );
    }
    

    // 统一加载所有模型
    const modelsToLoad = [
      this.loadBusModel.bind(this),
      this.loadBusStopModel.bind(this),
      this.loadBus_1Model.bind(this),
      this.loadBus_2Model.bind(this),
      this.loadBooksModel.bind(this),
      this.loadCakeModel.bind(this),
      this.loadCoffeeModel.bind(this),
      this.loadCameModel.bind(this),
      this.loadDogModel.bind(this),
      this.loadPhoneModel.bind(this),
      this.loadBoneModel.bind(this),
      this.loadNPCModel.bind(this),
      this.loadMoneyModel.bind(this),
      this.loadQiangModel.bind(this),
      this.loadQiang_1Model.bind(this),
      this.loadSkateModel.bind(this),
      this.loadBikeModel.bind(this),
      this.loadStrainerModel.bind(this),
      this.loadChairModel.bind(this), 
      this.loadTeapotModel.bind(this),
      this.loadMealModel.bind(this),
      this.loadViolinModel.bind(this),
      this.loadBedModel.bind(this),
      this.loadWaterfallModel.bind(this),
     
      this.loadHouse_1Model.bind(this),
      this.loadHouse_2Model.bind(this),
      this.loadHouse_3Model.bind(this),
      
      this.loadHorseModel.bind(this), // 新增马模型加载
      this.loadSheepModel.bind(this), // 新增羊模型加载
      this.loadHouse_5Model.bind(this),
      this.loadBasketModel.bind(this),
      this.loadBenchModel.bind(this),
      this.loadFlowersModel.bind(this),
      this.loadFlowerTableModel.bind(this),
      this.loadFlowerployModel.bind(this),
      this.loadFlowerpoly_2Model.bind(this),
      this.loadHouseModel.bind(this),
      this.loadShoeModel.bind(this)
    ];
    

    // 计算总模型数量
    this.totalModels = modelsToLoad.length ;
    this.updateLoadingProgress(0);
    
    modelsToLoad.forEach(loaderFunc => loaderFunc());


    this.createSideWall();
    this.createDoor();
    this.createBackWall();
    this.createRoof();
    this.createFrontWall();
    this.createWindow();
    this.createFloor();
    // 马模型属性
    this.horse = null;
    this.horseMixer = null;
    this.horseVelocity = new THREE.Vector3(0, 0, -1); // 初始移动方向和速度
    this.horseDirection = new THREE.Vector3();
    this.horseSpeed = 40; // 移动速度
    this.horseTurnSpeed = 0.01; // 转向速度
     // 马模型属性
     this.sheep = null;
     this.sheepMixer = null;
     this.sheepVelocity = new THREE.Vector3(0, 0, -1); // 初始移动方向和速度
     this.sheepDirection = new THREE.Vector3();
     this.sheepSpeed = 50; // 移动速度
     this.sheepTurnSpeed = 0.01; // 转向速度
 // 天气系统变量
 this.weatherSystem = null;
 this.isSnowing = false;
 this.weatherType = 'none'; // 'rain', 'snow', 'none'
  this.snowRotations = null;
 
 // 初始化天气系统
 this.initWeatherSystem();
 
 // 设置天气按钮
 this.setupWeatherButton();

    this.setupControls();

  }
  
  // 更新加载进度
  updateLoadingProgress(progress) {
    this.loadingProgress = progress;
    this.progressFill.style.width = `${progress}%`;
    this.progressText.textContent = `${Math.round(progress)}%`;
    
     // 当加载完成时激活开始按钮
  if (progress >= 100) {
    this.startButton.classList.add('enabled');
    this.startButton.removeAttribute('disabled');
  }
  }
  
  onModelLoaded() {
    this.loadedModels++;
    const progress = (this.loadedModels / this.totalModels) * 100;
    this.updateLoadingProgress(progress);
    
    // 所有模型加载完成
    if (progress >= 100) {
      this.isReady = true;
      console.log('所有模型加载完成，等待用户点击开始游戏');
      
      // 激活开始按钮，但不隐藏加载页面
      this.startButton.classList.add('enabled');
      this.startButton.removeAttribute('disabled');
    }
  }
 // 初始化按钮音效
 initButtonSound() {
  // 创建按钮音效元素
  this.buttonSound = new Audio('/assets/audio/button.mp3');
  this.buttonSound.volume = 0.3; // 音效音量
}

// 播放按钮音效
playButtonSound() {
  if (this.buttonSound) {
    this.buttonSound.currentTime = 0; // 重置播放位置
    this.buttonSound.play().catch(err => {
      console.log('按钮音效播放需要用户交互', err);
      // 可以添加提示用户点击的逻辑
    });
  }
}
// 确保startGame只在按钮点击时调用
initLoadingScreen() {
  this.loadingScreen = document.getElementById('loading-screen');
  this.progressFill = document.getElementById('progress-fill');
  this.progressText = document.getElementById('progress-text');
  this.startButton = document.getElementById('start-game');
  // 获取UI元素引用
  this.weatherToggleButton = document.getElementById('weather-toggle');
  this.collectionProgressElement = document.getElementById('collection-progress');
  
  // 初始隐藏UI元素
  this.hideUIElements();
  
  // 初始设置为禁用
  this.startButton.setAttribute('disabled', 'disabled');
  this.startButton.classList.remove('enabled');
  
  this.startButton.addEventListener('click', () => {
    if (this.isReady) {
      this.playButtonSound(); // 播放按钮音效
      this.startGame();
    }
  });
}

 // 隐藏UI元素
 hideUIElements() {
  if (this.weatherToggleButton) {
    this.weatherToggleButton.classList.add('hidden');
  }
  if (this.collectionProgressElement) {
    this.collectionProgressElement.classList.add('hidden');
  }
}

// 显示UI元素
showUIElements() {
  if (this.weatherToggleButton) {
    this.weatherToggleButton.classList.remove('hidden');
  }
  if (this.collectionProgressElement) {
    this.collectionProgressElement.classList.remove('hidden');
  }
}

startGame() {
  this.animate();
  this.startButton.style.display = 'none';
  this.destroyLoadingScreen();

  // 延迟加载花和树，不阻塞进入场景
  setTimeout(() => {
    this.loadTreeAndFlowers();
  }, 100);  // 

  setTimeout(() => {
    this.showUIElements();
  }, 300);
}

loadTreeAndFlowers() {
   // 批量加载树木和花朵
   const TREE_TYPES = [
    { modelPath: '/assets/GLTF/bamboo_tree/scene.gltf', scale: 1, avoidRadius: 1800, count: 10 },
    { modelPath: '/assets/GLTF/stylized_tree/scene.gltf', scale: 1.2, avoidRadius: 1850, count: 10 },
    { modelPath: '/assets/GLTF/tree/scene.gltf', scale: 1.2, avoidRadius: 1900, count: 10 },
    { modelPath: '/assets/GLTF/maple_trees/scene.gltf', scale: 1.2, avoidRadius: 1750, count: 10 },
    { modelPath: '/assets/GLTF/pine_tree/scene.gltf', scale: 1.2, avoidRadius: 1700, count: 10 }
  ];
 
  const Flower_TYPES = [
    { modelPath_: '/assets/GLTF/colored_flower/scene.gltf', scale: 0.8, avoidRadius: 1050, count: 10},
    { modelPath_: '/assets/GLTF/flowers（mix)/scene.gltf', scale: 9, avoidRadius: 1000, count: 10 },
    { modelPath_: '/assets/GLTF/manyflowers/scene.gltf', scale: 0.8, avoidRadius: 1100, count: 10},
    { modelPath_: '/assets/GLTF/purpleflowers/scene.gltf', scale: 1, avoidRadius: 1150, count: 10 },
    { modelPath_: '/assets/GLTF/white_flower/scene.gltf', scale: 0.8, avoidRadius: 1200, count: 10 }
  ];
  TREE_TYPES.forEach(config => this.loadTreeModel(config));
  Flower_TYPES.forEach(config => this.loadManyFlowersModel(config));
}


// 销毁加载页面
destroyLoadingScreen() {
  if (this.loadingScreen) {
    // 淡出加载屏幕
    this.loadingScreen.style.transition = 'opacity 0.1s ease-out';
    this.loadingScreen.style.opacity = '0';
    
    // 动画结束后隐藏元素
    setTimeout(() => {
      this.loadingScreen.style.display = 'none';
    }, 100);
  }
}
  
initScene() {
  this.scene = new THREE.Scene();
  this.scene.background = new THREE.Color(0x87CEEB); // 天空蓝色背景
  
  // 添加默认光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  this.scene.add(ambientLight);
   // 初始化任务对话框
   this.initTaskDialog();
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 300, 100);
  this.scene.add(directionalLight);
}

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      5000 
    );
    // 设置相机初始位置
    this.camera.position.set(0, 70, -1200);
    this.camera.lookAt(0, 70, 0);
  }
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;
  
  }
  // 初始化任务对话框UI
initTaskDialog() {
  this.taskDialog = document.createElement('div');
  this.taskDialog.id = 'task-dialog';
  this.taskDialog.className = 'hidden';
  this.taskDialog.style.position = 'fixed';
  this.taskDialog.style.top = '50%';
  this.taskDialog.style.left = '50%';
  this.taskDialog.style.transform = 'translate(-50%, -50%)';
  this.taskDialog.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  this.taskDialog.style.color = 'white';
  this.taskDialog.style.padding = '30px';
  this.taskDialog.style.borderRadius = '15px';
  this.taskDialog.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
  this.taskDialog.style.zIndex = '2000';
  this.taskDialog.style.maxWidth = '80%';
  this.taskDialog.style.textAlign = 'center';
  this.taskDialog.style.fontSize = '24px';
  this.taskDialog.style.lineHeight = '1.6';
  
  document.body.appendChild(this.taskDialog);
}
  
  initBGM() {
    // 创建音频元素
    this.bgmAudio = new Audio('/assets/audio/bgm.mp3');
    this.bgmAudio.loop = true;       // 循环播放
    this.bgmAudio.volume = 0.3;      // 音量0.5
    
    // 监听用户交互（点击/按键）并播放音乐
    document.addEventListener('click', this.playBGM.bind(this), { once: true });
    document.addEventListener('keydown', this.playBGM.bind(this), { once: true });
  }
  initSnowSound() {
    // 雪天音效初始化
    this.snowAudio = new Audio('/assets/audio/snow.mp3');
    this.snowAudio.loop = true;       // 循环播放
    this.snowAudio.volume = 0.1;      // 雪声音量设置
    this.snowAudio.pause();     // 初始暂停
    
    
  }
  
  playBGM() {
    this.bgmAudio.play().catch(err => {
      console.log('音频播放需要用户交互', err);
     
    });
    
    // 移除交互监听（只触发一次）
    document.removeEventListener('click', this.playBGM);
    document.removeEventListener('keydown', this.playBGM);
  }


markItemAsCollectible(item, data = {}) {
  if (!item) return;
  
  console.log(`尝试标记物品: ${item.name || '未知物品'}, 类型: ${item.type}`);
  
  if (item.isGroup) {
    console.log(`处理组对象: ${item.name || '未知组'}`);
    item.traverse(child => {
      this.markItemAsCollectible(child, data);
    });
    return;
  }
  
  if (item.isMesh) {
    this.itemCollectionSystem.addCollectibleItem(item, data);
    console.log(`成功标记网格对象: ${item.name || '未知网格'}`);
  }
}
  

  setupLights() {
    // 主光源（调整为侧光，降低强度）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.85);
    directionalLight.position.set(0, 800, 1000); // 移至场景左前上方（侧光角度）
    directionalLight.castShadow =false; // 禁用阴影以提高性能
    directionalLight.shadow.mapSize.set(1024, 1024); // 进一步降低阴影分辨率
    directionalLight.shadow.camera.far = 4000;
    this.scene.add(directionalLight);
  
    // 环境光（降低整体亮度）
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4); 
    this.scene.add(ambientLight);
  

  }
  
  createRectangularGrass() {
    // 创建草地
    const grassGeometry = new THREE.PlaneGeometry(4000, 4000);
    
    // 加载草地纹理
    const grassTexture = this.loader.get('grass');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 20); 
    grassTexture.anisotropy = 10;
    
    // 创建草地材质
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
    // 创建马路
    const highwayGeometry = new THREE.PlaneGeometry(3000, 300);
    
    // 加载马路纹理
    const roadTexture = this.loader.get('road');
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1.6, 1); 
    roadTexture.anisotropy = 8;
    
    // 创建马路材质
    const highwayMaterial = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.6, 
      metalness: 0.15,
      side: THREE.DoubleSide,
      alphaTest: 0.4,
      transparent: true
    });

  
    // 马路网格
    this.highway = new THREE.Mesh(highwayGeometry, highwayMaterial);
    this.highway.rotation.x = -Math.PI / 2;
    this.highway.rotation.z = -Math.PI / 2;


    this.highway.position.set(0, 1, 0); 
    this.highway.receiveShadow = true;
    this.scene.add(this.highway);

  
  }
  initWeatherSystem() {
    // 创建雪花粒子系统
    const snowGeometry = new THREE.BufferGeometry();
    const snowCount = 6000; // 增加雪花数量
    const snowPositions = new Float32Array(snowCount * 3);
    const snowSpeeds = new Float32Array(snowCount);
    const snowLifetimes = new Float32Array(snowCount);
    const snowDrifts = new Float32Array(snowCount * 2);
    this.snowRotations = new Float32Array(snowCount * 3);
    
    for (let i = 0; i < snowCount; i++) {
      const index = i * 3;
      snowPositions[index] = (Math.random() - 0.5) * 4000;
      snowPositions[index + 1] = 400 + Math.random() * 500; // 降低初始高度，让雪花更快到达地面
      snowPositions[index + 2] = (Math.random() - 0.5) * 4000;
      snowSpeeds[i] = 10 + Math.random() * 14; // 加快雪花降落速度
      snowLifetimes[i] = 1 + Math.random() * 3; // 缩短生命周期，增加雪花重生频率
      snowDrifts[i*2] = (Math.random() - 0.5) * 2;
      snowDrifts[i*2+1] = (Math.random() - 0.5) * 2;
      
      this.snowRotations[index] = Math.random() * 2 * Math.PI;
      this.snowRotations[index + 1] = Math.random() * 2 * Math.PI;
      this.snowRotations[index + 2] = Math.random() * 2 * Math.PI;
    }
    
    snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    snowGeometry.setAttribute('speed', new THREE.BufferAttribute(snowSpeeds, 1));
    snowGeometry.setAttribute('lifetime', new THREE.BufferAttribute(snowLifetimes, 1));
    snowGeometry.setAttribute('drift', new THREE.BufferAttribute(snowDrifts, 2));
    snowGeometry.setAttribute('rotation', new THREE.BufferAttribute(this.snowRotations, 3));
    
    const snowOriginalLifetimeAttr = new THREE.BufferAttribute(snowLifetimes, 1);
    snowGeometry.setAttribute('originalLifetime', snowOriginalLifetimeAttr.clone());
    
    const snowMaterial = new THREE.PointsMaterial({
      size: 1.2, // 稍微增大雪花尺寸
      color: 0xf0f8ff, // 淡蓝色雪花，增强视觉效果
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      sizeAttenuation: true
    });
    
    this.snowParticles = new THREE.Points(snowGeometry, snowMaterial);
    this.snowParticles.frustumCulled = false;
    this.scene.add(this.snowParticles);
    this.snowParticles.visible = false; // 初始隐藏雪花粒子系统
    
    
  }

  toggleWeather() {
    console.log('点击天气切换按钮');
    console.log('当前雪花可见性:', this.snowParticles.visible);

    if (this.snowParticles.visible) {
      console.log('切换到晴天效果');
      this.snowParticles.visible = false;
      this.updateWeatherButtonText('切换为下雪');
      this.pauseSnowSound(); // 暂停雪声音效
    } else {
      console.log('切换到雪花效果');
      this.snowParticles.visible = true;
      this.updateWeatherButtonText('切换为晴天');
      //  仅在用户切换到下雪时播放音效，且确保已触发用户交互
      if (this.bgmAudio.played) { // 检查背景音乐是否已播放（即用户已交互）
        this.playSnowSound();
      } else {
        console.log('请先点击开始游戏或交互以播放音效');
      }
    }}
    updateWeather(delta) {
      if (this.snowParticles.visible) {
        this.updateSnow(delta);
        
        // 确保雪花显示时音效处于播放状态
        if (this.snowAudio.paused) {
          this.playSnowSound();
        }
      } else {
        // 确保雪花隐藏时音效处于暂停状态
        if (!this.snowAudio.paused) {
          this.pauseSnowSound();
        }
      }
    }
  
    // 播放雪声音效
    playSnowSound() {
      if (this.snowAudio) {
        this.snowAudio.play().catch(err => {
          console.log('雪声音频播放需要用户交互', err);
          // 显示播放提示（与背景音乐共用提示）
          this.showPlayPrompt();
        });
      }
    }
    
    // 暂停雪声音效
    pauseSnowSound() {
      if (this.snowAudio) {
        this.snowAudio.pause();
      }
    }
  updateSnow(delta) {
    const geometry = this.snowParticles.geometry;
    const position = geometry.attributes.position;
    const speed = geometry.attributes.speed;
    const lifetime = geometry.attributes.lifetime;
    const originalLifetime = geometry.attributes.originalLifetime;
    const drift = geometry.attributes.drift;
    const rotation = geometry.attributes.rotation;
    
    const positionArray = position.array;
    const driftArray = drift.array;
    const rotationArray = rotation.array;
    
    for (let i = 0; i < position.count; i++) {
      const index = i * 3;
      const driftIndex = i * 2;
      
      // 加快下落速度（乘以1.5倍系数）
      positionArray[index + 1] -= speed.getX(i) * delta * 1.5;
      positionArray[index] += driftArray[driftIndex] * delta;
      positionArray[index + 2] += driftArray[driftIndex + 1] * delta;
      
      // 加快旋转速度
      rotationArray[index] += 0.1;
      rotationArray[index + 1] += 0.3;
      rotationArray[index + 2] += 0.2;
      
      // 降低重生高度，使雪花更快到达地面
      if (positionArray[index + 1] < -1500) { // 原-2000改为-1500
        positionArray[index] = (Math.random() - 0.5) * 4000;
        positionArray[index + 1] = 3000 + Math.random() * 500; // 提高重生高度，增加雪花密度
        positionArray[index + 2] = (Math.random() - 0.5) * 4000;
        
        driftArray[driftIndex] = (Math.random() - 0.5) * 2;
        driftArray[driftIndex + 1] = (Math.random() - 0.5) * 2;
        rotationArray[index] = Math.random() * 2 * Math.PI;
        rotationArray[index + 1] = Math.random() * 2 * Math.PI;
        rotationArray[index + 2] = Math.random() * 2 * Math.PI;
        
        lifetime.setX(i, originalLifetime.getX(i));
      }
    }
    
    position.needsUpdate = true;
    drift.needsUpdate = true;
    rotation.needsUpdate = true;
    lifetime.needsUpdate = true;
  }

  setupWeatherButton() {
    const button = document.getElementById('weather-toggle');
    if (button) {
      this.weatherToggleButton = button;
      button.addEventListener('click', () => {
        this.playButtonSound(); // 播放按钮音效
        this.toggleWeather();
      });
      this.updateWeatherButtonText('切换为下雪');
    }
  }
  
  // 更新天气按钮文字
  updateWeatherButtonText(text) {
    const button = document.getElementById('weather-toggle');
    if (button) {
      button.textContent = text;
    }
  }

  loadBusModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/bus/scene.gltf',
      (gltf) => {
        this.bus= gltf.scene; 
        this.setupBusModel(this.bus); // 处理模型
        this.scene.add(this.bus); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupBusModel(model) {
    // 调整模型位置和缩放
    model.position.set(0, 1, 800); // 放在相机前方远处
    model.scale.set(0.5, 0.5, 0.5);    // 放大模型以便可见
    
  }
  loadBus_1Model(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/volkswagen_bus/scene.gltf',
      (gltf) => {
        this.bus_1= gltf.scene; // 使用专用变量存储瀑布模型
        this.setupBus_1Model(this.bus_1); // 处理模型
        this.scene.add(this.bus_1); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupBus_1Model(model) {
    // 调整模型位置和缩放
    model.position.set(1600, 50,100); // 放在相机前方远处
    model.scale.set(80, 80, 80);    // 放大模型以便可见
  }
  loadBus_2Model(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/destroyed_bus/scene.gltf',
      (gltf) => {
        this.bus_2= gltf.scene; 
        this.setupBus_2Model(this.bus_2); 
        this.scene.add(this.bus_2); 
        this.onModelLoaded(); 
      },
    );
  }
  setupBus_2Model(model) {
    // 调整模型位置和缩放
    model.position.set(-500, 1,-900); // 放在相机前方远处
    model.scale.set(30, 30, 30);    // 放大模型以便可见
  }
  
  
  loadBusStopModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/bus_stop/scene.gltf',
      (gltf) => {
        this.bus_stop= gltf.scene; 
        this.setupBusStopModel(this.bus_stop); 
        this.scene.add(this.bus_stop);
        this.onModelLoaded(); 
      },
    );
  }
  setupBusStopModel(model) {
    // 调整模型位置和缩放
    model.position.set(300, 80, -500); 
    model.scale.set(1, 1, 1);   
    model.rotation.y = Math.PI; 
    
    
  }
 //绘制房子模型
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
    sideWall.position.set(800, 1,0 );
    sideWall2.position.set(800, 1,0 );
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
  backWall.position.set(900, 1,0 );
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
floor.position.set(800, 1,0 );
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
  frontWall.position.set(700, 1,0 );
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
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  // 处理模型位置、缩放和材质
  setupBedModel(model) {
   
    model.position.set(860, 1, 0);
    model.scale.set(0.8, 0.8, 0.8); 
    model.position.z=-70;
    model.opcity = 1; 
  
    this.scene.add(model); // 添加到场景
  }
  // 加载并放置床模型
  loadChairModel() {
    const loader = new FBXLoader();
    loader.load(
      '/assets/models/chair.fbx', // 模型路径
      (model) => {
        this.setupChairModel(model); // 处理加载后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  // 处理模型位置、缩放和材质
  setupChairModel(model) {
    // 调整模型位置
    model.position.set(750, 1, -100); 
    model.scale.set(0.5, 0.5, 0.5); 
    
    model.opcity = 1; // 确保模型不透明
  
    this.scene.add(model); // 添加到场景
    
  }


  loadHouseModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/bamboo_house (1)/scene.gltf',
      (gltf) => {
        this.house = gltf.scene; 
        this.setupHouseModel(this.house); 
        this.scene.add(this.house); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
  
    );
  }
  setupHouseModel(model) {
    // 调整模型位置和缩放
    model.position.set(400,0.5, 1000);
    model.scale.set(60, 60, 60);   
  }

  loadHouse_3Model(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/farm/scene.gltf',
      (gltf) => {
        this.house_3 = gltf.scene; 
        this.setupHouse_3Model(this.house_3); 
        this.scene.add(this.house_3); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    
    );
  }
  setupHouse_3Model(model) {
    // 调整模型位置和缩放
    model.position.set(-600,10, 0); 
    model.scale.set(15, 15, 15);  
  }

  // 统一的树木加载函数（均匀分布）
  loadTreeModel(treeConfig) {
    const { 
      modelPath,      
      count = 10,      // 树木数量
      scale = 1.0,     // 统一缩放
      avoidRadius = 400, // 避开房子/马路的半径
      batchSize = 100,  // 增大批次大小，减少HTTP请求次数
      useCluster = false // 启用聚类（默认均匀分布）
    } = treeConfig;
  
    const loader = new GLTFLoader();
    const GRASS_SIZE = 4000; // 扩大草地范围，避免边缘留白
    const treeGroup = new THREE.Group();
    this.scene.add(treeGroup);
  
    // 生成分布点（均匀分布为主，可选聚类）
    const positions = [];
    for (let i = 0; i < count; i++) {
      let x, z;
      if (useCluster && Math.random() < 0.2) { // 低概率聚类，保持分散
        const centerX = (Math.random() - 0.5) * GRASS_SIZE * 0.6;
        const centerZ = (Math.random() - 0.5) * GRASS_SIZE * 0.6;
        const radius = Math.random() * 150 + 50; 
        x = centerX + Math.cos(Math.random() * 2 * Math.PI) * radius;
        z = centerZ + Math.sin(Math.random() * 2 * Math.PI) * radius;
      } else {
        // 全局随机分布（主要方式）
        x = (Math.random() - 0.5) * GRASS_SIZE * 0.9;
        z = (Math.random() - 0.5) * GRASS_SIZE * 0.9;
      }
      
      // 避开房子和马路
      const distFromHouse = Math.hypot(x - 800, z); 
      const isInRoad = Math.abs(z) < 380; 
      if (distFromHouse > avoidRadius && !isInRoad) {
        positions.push({ x, z });
      }
    }
  
   // 分批加载
   const loadBatch = (startIdx) => {
    const endIdx = Math.min(startIdx + batchSize, positions.length);
    for (let i = startIdx; i < endIdx; i++) {
      const { x, z } = positions[i];
      loader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.rotation.y = Math.random() * Math.PI * 2;
        model.position.set(x, 0, z);
        model.traverse(child => {
          if (child.isMesh) child.material.metalness = 0; // 统一材质优化
        });
        treeGroup.add(model);
      });
    }
    if (endIdx < positions.length) loadBatch(endIdx); // 递归加载下一批
  };

  loadBatch(0); // 开始加载
}

// 统一的树木加载函数（均匀分布）
loadManyFlowersModel(FlowerConfig) {
  const { 
    modelPath_,       // 模型路径
    count = 10,      // 树木数量
    scale = 1.0,     // 统一缩放
    avoidRadius = 600, // 避开房子/马路的半径
    batchSize = 100,  // 增大批次大小，减少HTTP请求次数
    useCluster = true // 是否启用聚类（默认均匀分布）
  } = FlowerConfig;

  const loader = new GLTFLoader();
  const GRASS_SIZE = 4000; // 扩大草地范围，避免边缘留白
  const treeGroup = new THREE.Group();
  this.scene.add(treeGroup);

  // 生成分布点（均匀分布为主，可选聚类）
  const positions = [];
  for (let i = 0; i < count; i++) {
    let x, z;
    if (useCluster && Math.random() < 0.2) { // 低概率聚类，保持分散
      const centerX = (Math.random() - 0.5) * GRASS_SIZE * 0.6;
      const centerZ = (Math.random() - 0.5) * GRASS_SIZE * 0.6;
      const radius = Math.random() * 150 + 50; // 聚类半径更小
      x = centerX + Math.cos(Math.random() * 2 * Math.PI) * radius;
      z = centerZ + Math.sin(Math.random() * 2 * Math.PI) * radius;
    } else {
      // 全局随机分布（主要方式）
      x = (Math.random() - 0.5) * GRASS_SIZE * 0.9;
      z = (Math.random() - 0.5) * GRASS_SIZE * 0.9;
    }
    
    // 避开房子和马路（简化判断逻辑）
    const distFromHouse = Math.hypot(x - 800, z);
    const isInRoad = Math.abs(z) < 200; 
    if (distFromHouse > avoidRadius && !isInRoad) {
      positions.push({ x, z });
    }
  }

   // 分批加载（移除延迟，并行加载）
   const loadBatch = (startIdx) => {
    const endIdx = Math.min(startIdx + batchSize, positions.length);
    for (let i = startIdx; i < endIdx; i++) {
      const { x, z } = positions[i];
      loader.load(modelPath_, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.rotation.y = Math.random() * Math.PI * 2;
        model.position.set(x, 0, z);
        model.traverse(child => {
          if (child.isMesh) child.material.metalness = 0; // 统一材质优化
        });
        treeGroup.add(model);
      });
    }
    if (endIdx < positions.length) loadBatch(endIdx); // 递归加载下一批
  };

  loadBatch(0); // 开始加载
}


   // 加载马模型
loadHorseModel() {
  const loader = new GLTFLoader();
  loader.load(
    '/dong/animals/Llama.gltf', // 模型路径
    (gltf) => {
      this.horse = gltf.scene;
      this.setupHorseModel(this.horse, gltf);
      this.scene.add(this.horse);
      this.onModelLoaded(); // 模型加载完成通知
    },
    (progress) => {
      console.log(`马模型加载进度: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
    },
    (error) => {
      console.error('马模型加载失败:', error);
    }
  );
}

// 设置马模型
setupHorseModel(model, gltf) {
  // 调整模型位置和缩放
  model.position.set(-80, 1, -1100); // 初始位置
  model.scale.set(20, 20, 20); // 放大模型
  
  // 设置动画混合器
  this.horseMixer = new THREE.AnimationMixer(model);
  
  // 存储动画动作（从gltf中获取动画）
  // 存储动画动作
  const animations = {};
  if (gltf && gltf.animations) {
    gltf.animations.forEach((clip) => {
      animations[clip.name] = this.horseMixer.clipAction(clip);
    });
    
    // 根据移动状态播放不同动画
    if (animations['WalkSlow'] && animations['Idle']) {
      this.walkAction = animations['WalkSlow'];
      this.idleAction = animations['Idle'];
      
      // 初始播放行走动画
      this.walkAction.play();
    } else if (animations['walk'] && animations['idle']) {
      this.walkAction = animations['walk'];
      this.idleAction = animations['idle'];
      this.walkAction.play();
    } else {
      console.warn('马模型动画: 未找到行走或闲置动画');
    }
  }
}

loadSheepModel() {
  const loader = new GLTFLoader();
  loader.load(
    '/dong/animals/Sheep.gltf', // 模型路径
    (gltf) => {
      this.sheep = gltf.scene;
      this.setupSheepModel(this.sheep, gltf); 
      this.scene.add(this.sheep);
      this.onModelLoaded(); // 模型加载完成通知
    },
    (progress) => {
      console.log(`羊模型加载进度: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
    },
    (error) => {
      console.error('羊模型加载失败:', error);
    }
  );
}

// 设置羊模型
setupSheepModel(model, gltf) {
  // 调整模型位置和缩放
  model.position.set(110, 1, 1200); // 初始位置
  model.scale.set(20, 20, 20); // 放大模型
  
  // 设置动画混合器
  this.sheepMixer = new THREE.AnimationMixer(model);
  
   const animations = {};
   if (gltf && gltf.animations) {
     gltf.animations.forEach((clip) => {
       animations[clip.name] = this.sheepMixer.clipAction(clip);
     });
     
     // 根据移动状态播放不同动画
     if (animations['Jump'] && animations['Idle']) {
       this.jumpAction = animations['Jump'];
       this.idleAction = animations['Idle'];
       this.jumpAction.play();
     } else if (animations['walk'] && animations['idle']) {
       this.walkAction = animations['walk'];
       this.idleAction = animations['idle'];
       this.walkAction.play();
     } else {
       console.warn('羊模型动画: 未找到跳跃/行走或闲置动画');
     }
   }
 }
  
  
  loadWaterfallModel() {
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/rumahome/scene.gltf',
      (gltf) => {
        this.waterfall = gltf.scene; 
        this.setupWaterfallModel(this.waterfall); // 处理模型
        this.scene.add(this.waterfall); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
      undefined,
      (error) => {
        console.error('瀑布模型加载失败:', error);
      }
    );
  }
  
  setupWaterfallModel(model) {
    // 调整模型位置和缩放
    model.position.set(800, 1, -920); // 放在相机前方远处
    model.scale.set(200,200, 200);    // 放大模型以便可见
    
  }
  loadBasketModel() {
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/basket/scene.gltf',
      (gltf) => {
        this.basket = gltf.scene; 
        this.setupBasketModel(this.basket); // 处理模型
        this.scene.add(this.basket); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  
  setupBasketModel(model) {
    // 调整模型位置和缩放
    model.position.set(730, 45, -1100); 
    model.scale.set(80,80, 80);   
    
  }
  loadBenchModel() {
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/low_wooden_bench/scene.gltf',
      (gltf) => {
        this.bench = gltf.scene; 
        this.setupBenchModel(this.bench); // 处理模型
        this.scene.add(this.bench); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  
 
  setupBenchModel(model) {
    // 调整模型位置和缩放
    model.position.set(1200, 1, 300);
    model.scale.set(80,80, 80);  
    
  }
  
  loadHouse_1Model(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/bamboo_house/scene.gltf',
      (gltf) => {
        this.house_1 = gltf.scene; 
        this.setupHouse_1Model(this.house_1);
        this.scene.add(this.house_1); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupHouse_1Model(model) {
    // 调整模型位置和缩放
    model.position.set(800, 1, 900); // 放在相机前方远处
    model.scale.set(0.7, 0.7, 0.7);    // 放大模型以便可见
  }
  
  loadHouse_5Model(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/pavilion__thai/scene.gltf',
      (gltf) => {
        this.house_5= gltf.scene; 
        this.setupHouse_5Model(this.house_5); // 处理模型
        this.scene.add(this.house_5); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupHouse_5Model(model) {
    // 调整模型位置和缩放
    model.position.set(1000, 1, 1600);
    model.scale.set(40, 40, 40);    // 放大模型以便可见
    model.rotation.y = Math.PI ; // 旋转模型使其面向正确方向
  }
  
  
  loadHouse_2Model(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/wooden_lake_house/scene.gltf',
      (gltf) => {
        this.house_2 = gltf.scene; 
        this.setupHouse_2Model(this.house_2); // 处理模型
        this.scene.add(this.house_2); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupHouse_2Model(model) {
    // 调整模型位置和缩放
    model.position.set(1600, 100, -400);
    model.scale.set(0.4, 0.4, 0.4);
    model.rotation.y = Math.PI ; // 旋转模型使其面向正确方向

    
    // 加载木质纹理
    const woodTexture = new THREE.TextureLoader().load('/assets/textures/wooden1.jpg');
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 2);
    woodTexture.minFilter = THREE.LinearMipmapLinearFilter;
    
    // 遍历模型中的所有网格
    model.traverse((child) => {
      if (child.isMesh) {
        // 应用木质材质
        child.material = new THREE.MeshStandardMaterial({
          map: woodTexture,
          roughness: 0.7,
          metalness: 0
        });
        
        // 确保材质更新
        child.material.needsUpdate = true;
      }
    });
  }

  loadFlowersModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/manyflowers/scene.gltf',
      (gltf) => {
        this.flowers_1 = gltf.scene; 
        this.setupFlowersModel(this.flowers_1); // 处理模型
        this.scene.add(this.flowers_1); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupFlowersModel(model) {
    // 调整模型位置和缩放
    model.position.set(800, 0, -600); // 放在相机前方远处
    model.scale.set(40, 40, 40);    // 放大模型以便可见
    
    
  }
  loadFlowerpoly_2Model(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/april_flowers/scene.gltf',
      (gltf) => {
        this.flowers_2 = gltf.scene; 
        this.setupFlowerpoly_2Model(this.flowers_2); // 处理模型
        this.scene.add(this.flowers_2); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupFlowerpoly_2Model(model) {
    // 调整模型位置和缩放
    model.position.set(1500, 28, -800); // 放在相机前方远处
    model.scale.set(8, 8, 8);    // 放大模型以便可见
    
    
  }
  loadFlowerTableModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/table_with_flowers/scene.gltf',
      (gltf) => {
        this.flowers_table= gltf.scene; 
        this.setupFlowerTableModel(this.flowers_table); // 处理模型
        this.scene.add(this.flowers_table); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupFlowerTableModel(model) {
    // 调整模型位置和缩放
    model.position.set(1700, 4, -100); // 放在相机前方远处
    model.scale.set(30, 30, 30);    // 放大模型以便可见
  }
  loadFlowerployModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/pinkflower/scene.gltf',
      (gltf) => {
        this.flowerploy= gltf.scene; 
        this.setupFlowerployModel(this.flowerploy); // 处理模型
        this.scene.add(this.flowerploy); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupFlowerployModel(model) {
    // 调整模型位置和缩放
    model.position.set(1100,1, -400); // 放在相机前方远处
    model.scale.set(30, 30, 30);    // 放大模型以便可见
  }
  loadShoeModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/aj_shoes/scene.gltf',
      (gltf) => {
        this.shoe= gltf.scene; 
        this.setupShoeModel(this.shoe); // 处理模型
        this.scene.add(this.shoe); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.shoe.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectShoe',root:this.shoe });
          }
        });
      },
    );
  }
  setupShoeModel(model) {
    // 调整模型位置和缩放
    model.position.set(200,1, 600); // 放在相机前方远处
    model.scale.set(1, 1, 1);    // 放大模型以便可见
  }
  loadBooksModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/books/scene.gltf',
      (gltf) => {
        this.books= gltf.scene;
        this.setupBooksModel(this.books); // 处理模型
        this.scene.add(this.books); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.books.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectBooks',root:this.books });
          }
        });
      },
    );
  }
  setupBooksModel(model) {
    // 调整模型位置和缩放
    model.position.set(328,20, -540); 
    model.scale.set(0.1, 0.1, 0.1);    // 放大模型以便可见
    model.rotation.y = -Math.PI/2 ; // 旋转模型使其面向正确方向

  }
  
  
  loadCakeModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/cake1/scene.gltf',
      (gltf) => {
        this.cake= gltf.scene; 
        this.setupCakeModel(this.cake); // 处理模型
        this.scene.add(this.cake); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.cake.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectCake',root:this.cake });
          }
        });
      },
    );
  }
  setupCakeModel(model) {
    // 调整模型位置和缩放
    model.position.set(1240,40, 250); 
    model.scale.set(5, 5, 5);  
   

  }
  loadCoffeeModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/coffeemat/scene.gltf',
      (gltf) => {
        this.coffeemat= gltf.scene; 
        this.setupCoffeeModel(this.coffeemat); // 处理模型
        this.scene.add(this.coffeemat); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.coffeemat.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectCoffeeMachine' ,root:this.coffeemat });
          }
        });
      },
    );
  }
  setupCoffeeModel(model) {
    // 调整模型位置和缩放
    model.position.set(1190,40, 340); 
    model.scale.set(0.1, 0.1, 0.1);    

  }
  loadCameModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/camera/scene.gltf',
      (gltf) => {
        this.came= gltf.scene;
        this.setupCameModel(this.came);
        this.scene.add(this.came); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.came.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectCamera', root:this.came });
          }
        });
      },
    );
  }
  setupCameModel(model) {
   
    model.position.set(1130,42, 280); 
    model.scale.set(110, 110, 110);  
    model.rotation.y = -Math.PI/2 ; 


  }
  loadDogModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/dog/scene.gltf',
      (gltf) => {
        this.dog= gltf.scene; 
        this.setupDogModel(this.dog); // 处理模型
        this.scene.add(this.dog); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupDogModel(model) {
    // 调整模型位置和缩放
    model.position.set(240,24, -500); 
    model.scale.set(30, 30, 30);    // 放大模型以便可见
    model.rotation.y = -Math.PI/2 ; // 旋转模型使其面向正确方向
   
  }
  loadPhoneModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/iphone_16_pro_max/scene.gltf',
      (gltf) => {
        this.phone= gltf.scene; 
        this.setupPhoneModel(this.phone); // 处理模型
        this.scene.add(this.phone); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.phone.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectPhone' ,root:this.phone });
          }
        });
      },
    );
  }
  setupPhoneModel(model) {
    // 调整模型位置和缩放
    model.position.set(1300,15, -1000); // 放在相机前方远处
    model.scale.set(20, 20, 20);    // 放大模型以便可见
  
  }

  loadBoneModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/kuloutou/scene.gltf',
      (gltf) => {
        this.bone= gltf.scene; 
        this.setupBoneModel(this.bone); // 处理模型
        this.scene.add(this.bone); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.bone.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectBone',  root:this.bone });
          }
        });
      },
    );
  }
  setupBoneModel(model) {
    // 调整模型位置和缩放
    model.position.set(400,18, 100);
    model.scale.set(20, 20, 20);    // 放大模型以便可见
    model.rotation.y = -Math.PI/2 ; // 旋转模型使其面向正确方向

  }
  loadMoneyModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/money/scene.gltf',
      (gltf) => {
        this.money= gltf.scene; 
        this.setupMoneyModel(this.money); // 处理模型
        this.scene.add(this.money); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.money.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectMoney', root:this.money });
          }
        });
      },
    );
  }
  setupMoneyModel(model) {
    // 调整模型位置和缩放
    model.position.set(800,8,600); 
    model.scale.set(80, 80, 80);   
   

  }
  loadQiangModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/qiang_1/scene.gltf',
      (gltf) => {
        this.qiang_1= gltf.scene; 
        this.setupQiangModel(this.qiang_1); // 处理模型
        this.scene.add(this.qiang_1); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.qiang_1.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectGun1' ,root:this.qiang_1 });
          }
        });
      },
    );
  }
  setupQiangModel(model) {
    // 调整模型位置和缩放
    model.position.set(-600,10,400); 
    model.scale.set(10, 10, 10);    
   

  }
  loadQiang_1Model(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/qiang_2/scene.gltf',
      (gltf) => {
        this.qiang_2= gltf.scene; 
        this.setupQiang_1Model(this.qiang_2); // 处理模型
        this.scene.add(this.qiang_2); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.qiang_2.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectGun2', root:this.qiang_2 });
          }
        });
      },
    );
  }
  setupQiang_1Model(model) {
    // 调整模型位置和缩放
    model.position.set(-1000,10,600); 
    model.scale.set(0.1, 0.1, 0.1);   
   

  }
  loadSkateModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/skateboard/scene.gltf',
      (gltf) => {
        this.skateboard= gltf.scene; 
        this.setupSkateModel(this.skateboard); // 处理模型
        this.scene.add(this.skateboard); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.skateboard.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectSkateboard' ,root:this.skateboard });
          }
        });
      },
    );
  }
  setupSkateModel(model) {
    // 调整模型位置和缩放
    model.position.set(-360,10,-970); 
    model.scale.set(10, 10, 10);  
   

  }
  
  loadBikeModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/sports_bike/scene.gltf',
      (gltf) => {
        this.bike= gltf.scene; 
        this.setupBikeModel(this.bike); // 处理模型
        this.scene.add(this.bike); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
      },
    );
  }
  setupBikeModel(model) {
    // 调整模型位置和缩放
    model.position.set(800,10,-1600);
    model.scale.set(60, 60, 60);   
   

  }
  loadStrainerModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/strainer/scene.gltf',
      (gltf) => {
        this.strainer= gltf.scene;
        this.setupStrainerModel(this.strainer); // 处理模型
        this.scene.add(this.strainer); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.strainer.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectStrainer', root:this.strainer });
          }
        });
      },
    );
  }
  setupStrainerModel(model) {
    // 调整模型位置和缩放
    model.position.set(600,1,-800); 
    model.scale.set(200, 200, 200);  
  }
  
  loadTeapotModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/tea_pot/scene.gltf',
      (gltf) => {
        this.tea_pot= gltf.scene; 
        this.setupTeapotModel(this.tea_pot); // 处理模型
        this.scene.add(this.tea_pot); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.tea_pot.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectTeaPot', root:this.tea_pot });
          }
        });
      },
    );
  }
  setupTeapotModel(model) {
    // 调整模型位置和缩放
    model.position.set(1000,49,1560); 
    model.scale.set(4, 4, 4);    
    
   

  }
  loadMealModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/udon_meal/scene.gltf',
      (gltf) => {
        this.udon_meal= gltf.scene; 
        this.setupMealModel(this.udon_meal); // 处理模型
        this.scene.add(this.udon_meal); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.udon_meal.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectUdonMeal',root:this.udon_meal },);
          }
        });
      },
    );
  }
  setupMealModel(model) {
    // 调整模型位置和缩放
    model.position.set(400,30,1000); 
    model.scale.set(15, 15, 15);  

  }
  loadViolinModel(){
    const loader = new GLTFLoader();
    loader.load(
      '/assets/GLTF/violin/scene.gltf',
      (gltf) => {
        this.violin= gltf.scene; 
        this.setupViolinModel(this.violin); // 处理模型
        this.scene.add(this.violin); // 添加处理后的模型
        this.onModelLoaded(); // 模型加载完成通知
        this.violin.traverse(child => {
          if (child.isMesh) {
            this.itemCollectionSystem.addCollectibleItem(child, { taskId: 'collectViolin' ,root:this.violin });
          }
        });
      },
    );
  }
  setupViolinModel(model) {
    // 调整模型位置和缩放
    model.position.set(-900,12,1000); 
    model.scale.set(120, 120, 120);   

  }
 // HomeScene.js 关键修改部分
loadNPCModel(){
  const loader = new GLTFLoader();
  loader.load(
    '/assets/GLTF/cute_ghost/scene.gltf',
    (gltf) => {
      this.ghost= gltf.scene;
      this.setupNPCModel(this.ghost); // 处理模型
      this.setupGhostCollider(this.ghost); // 为Ghost添加碰撞体
      this.scene.add(this.ghost); // 添加处理后的模型
      this.onModelLoaded(); // 模型加载完成通知
    },
  );
}
setupNPCModel(model) {
  // 调整模型位置和缩放
  model.position.set(0,1,-900);
  model.scale.set(20, 20, 20);   
  model.rotation.y = -Math.PI ;

}


setupGhostCollider(ghost) {
  
  const sphereGeometry = new THREE.SphereGeometry(5, 16, 16); // 半径5米的球体碰撞体
  
  const collider = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial({ visible: false }));
  collider.position.copy(ghost.position);
  collider.updateMatrixWorld();
  
  this.scene.add(collider);
  this.ghostCollider = collider;
}

checkGhostCollision() {
  if (!this.characterController.model || !this.ghostCollider) return;
  
  const playerPos = this.characterController.model.position;
  const ghostPos = this.ghostCollider.position;
  
  // 使用距离检测替代边界盒相交
  const distance = playerPos.distanceTo(ghostPos);
  const collisionDistance = 5; // 碰撞距离（米）
  
  if (distance < collisionDistance && !this.ghostInteracted) {
    this.triggerTaskDialog();
    
    // 通知角色控制器发生碰撞
    if (this.characterController) {
      this.characterController.onGhostCollision();
    }
  }
}


// 当角色与Ghost碰撞时调用
onGhostCollision() {
  
  console.log("角色与Ghost发生碰撞，触发任务对话框");
}
 
  // 触发任务对话框
triggerTaskDialog() {
  this.ghostInteracted = true;
  
  // 任务描述
  const taskDescription = `👻 亲爱的玩家，欢迎来到我的乡村！\n\n
  我的名字是鬼鬼，现在给你发布寻宝任务：\n
  🌟 请在场景中寻找并收集 **10个神秘宝藏** 🌟\n\n
  偷偷告诉你一个小技巧：\n
  🧭 宝藏的范围比较广哦～用鼠标点击你认为可能是宝藏的物品试试吧！`;
  
  this.taskDialog.textContent = taskDescription;
  this.taskDialog.classList.remove('hidden');
  
  // 5秒后自动隐藏对话框
  setTimeout(() => {
    this.taskDialog.classList.add('hidden');
  }, 5000);
}
  
  // 标记物品为可收集
  markAsCollectible(item, data = {}) {
    if (item) {
      this.itemCollectionSystem.addCollectibleItem(item, data);
      console.log(`已标记可收集物品: ${item.name || '未知物品'}`);
    } else {
      console.log("警告: 无法标记空物品");
    }
  }
  
  

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = false; // 临时禁用OrbitControls便于测试
    
    //this.controls.enableDamping = true; // 启用阻尼效果
        //this.controls.dampingFactor = 0.05;
        //this.controls.enableZoom = true; // 启用缩放
        //this.controls.enablePan = true;  // 启用平移
    //this.controls.enableRotate = true; // 启用旋转
    //this.controls.screenSpacePanning = true; // 优化平移流畅度
    
  }
  

  // 动画循环
  animate() {
    if (!this.isReady) return;
    requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();

   if (this.updateWeather) {
    console.log('调用天气更新');
    this.updateWeather(delta);
  } else {
    console.log('天气更新方法未定义');
  }
  
  
    // 更新角色控制器
    if (this.characterController) {
      this.characterController.update(delta);
    }
    // 检测玩家与Ghost的碰撞
  if (this.characterController && this.ghostCollider && !this.ghostInteracted) {
    this.checkGhostCollision();
  }
  

    // 马模型移动
    if (this.horse && this.horseMixer) {
      this.horseMixer.update(delta);
      
      // 基础移动
      this.horseDirection.copy(this.horseVelocity).normalize();
      this.horse.position.add(this.horseDirection.clone().multiplyScalar(this.horseSpeed * delta));
      
      // 边界检测与转向（扩大边界范围）
      let shouldTurn = false;
      if (this.horse.position.z < -1000 || this.horse.position.z > 1600) {
        this.horseVelocity.z = Math.sign(this.horseVelocity.z) * -0.5;
        shouldTurn = true;
      } else {
        this.horseVelocity.z = Math.sign(this.horseVelocity.z) * 1;
      }
      
      const targetRotation = this.horseVelocity.z > 0 ? 0 : Math.PI;
      
      // 提高转向速度
      this.horse.rotation.y = THREE.MathUtils.lerp(
        this.horse.rotation.y, 
        targetRotation, 
        0.1
      );
      
      // 同步动画与移动
      if (this.walkAction && this.idleAction) {
        if (Math.abs(this.horseVelocity.z) > 0.1) {
          // 移动时播放行走动画
          if (this.idleAction.isPlaying) {
            this.idleAction.stop();
          }
          if (!this.walkAction.isPlaying) {
            this.walkAction.play();
          }
        } else {
          // 停止时播放闲置动画
          if (this.walkAction.isPlaying) {
            this.walkAction.stop();
          }
          if (!this.idleAction.isPlaying) {
            this.idleAction.play();
          }
        }
      }
    }
    
    // 羊模型移动
    if (this.sheep && this.sheepMixer) {
      this.sheepMixer.update(delta);
      
      // 基础移动
      this.sheepDirection.copy(this.sheepVelocity).normalize();
      this.sheep.position.add(this.sheepDirection.clone().multiplyScalar(this.sheepSpeed * delta));
      
      // 边界检测与转向（扩大边界范围）
      let shouldTurn_ = false;
      if (this.sheep.position.z < -1000 || this.sheep.position.z > 1600) {
        this.sheepVelocity.z = Math.sign(this.sheepVelocity.z) * -0.5;
        shouldTurn_ = true;
      } else {
        this.sheepVelocity.z = Math.sign(this.sheepVelocity.z) * 1;
      }
      
      const targetRotation = this.sheepVelocity.z > 0 ? 0 : Math.PI;
      
      // 提高转向速度
      this.sheep.rotation.y = THREE.MathUtils.lerp(
        this.sheep.rotation.y, 
        targetRotation, 
        0.1
      );
      
      // 同步动画与移动
      if (this.jumpAction && this.idleAction) {
        if (Math.abs(this.sheepVelocity.z) > 0.1) {
          // 移动时播放跳跃/行走动画
          if (this.idleAction.isPlaying) {
            this.idleAction.stop();
          }
          if (!this.jumpAction.isPlaying) {
            this.jumpAction.play();
          }
        } else {
          // 停止时播放闲置动画
          if (this.jumpAction.isPlaying) {
            this.jumpAction.stop();
          }
          if (!this.idleAction.isPlaying) {
            this.idleAction.play();
          }
        }
      }
    }
    
    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  }
  

}  
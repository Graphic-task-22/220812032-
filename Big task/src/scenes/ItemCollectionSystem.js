import * as THREE from 'three';

export class ItemCollectionSystem {
  constructor(scene, camera, config = {}) {
    this.scene = scene;
    this.camera = camera;
    this.collectedItems = new Set();
    this.interactiveItems = new Map();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.pickableObjects = [];
    
    // 配置参数
    this.config = {
      maxPickDistance: config.maxPickDistance || 200, // 最大拾取距离
      debug: config.debug || false, // 调试模式
      showDebugLines: config.showDebugLines ||true, // 显示调试射线
      pickupEffect: config.pickupEffect || 'fade', // 拾取效果: 'fade' 或 'instant'
      cooldownTime: config.cooldownTime || 500, // 拾取冷却时间(毫秒)
      soundEnabled: config.soundEnabled !== undefined ? config.soundEnabled : true, // 音效开关
      soundVolume: config.soundVolume || 0.8, // 拾取音效音量
      pickupSoundPath: config.pickupSoundPath || '/assets/audio/pick_up.mp3', // 拾取音效路径
      gameCompleteSoundEnabled: config.gameCompleteSoundEnabled !== undefined ? config.gameCompleteSoundEnabled : true, // 游戏完成音效开关
      gameCompleteSoundVolume: config.gameCompleteSoundVolume || 0.2, // 游戏完成音效音量
      gameCompleteSoundPath: config.gameCompleteSoundPath || '/assets/audio/game_over.mp3', // 游戏完成音效路径
      gameCompleteItemCount: config.gameCompleteItemCount || 10, // 触发游戏完成的物品数量
    };
    
    this.lastPickTime = 0;
    this.debugLine = null;
    this.pickupSound = null; // 拾取音效对象
    this.gameCompleteSound = null; // 游戏完成音效对象
    this.isPickupSoundLoaded = false; // 拾取音效加载状态
    this.isGameCompleteSoundLoaded = false; // 游戏完成音效加载状态
    this.gameCompleted = false; // 游戏是否已完成
    this.totalCollectedItems = 0; // 已收集物品总数
    this.init();
  }
  
  init() {
    // 监听鼠标点击事件
    window.addEventListener('click', (event) => {
      this.onMouseClick(event);
    });
    
    // 创建调试射线
    if (this.config.showDebugLines) {
      this.createDebugLine();
    }
    
    // 加载音效
    if (this.config.soundEnabled) {
      this.loadPickupSound();
    }
    if (this.config.gameCompleteSoundEnabled) {
      this.loadGameCompleteSound();
    }
    this.updateCollectionCounter(); 

  }
  
  // 加载拾取音效文件
  loadPickupSound() {
    this.pickupSound = new Audio(this.config.pickupSoundPath);
    this.pickupSound.volume = this.config.soundVolume;
    
    this.pickupSound.onloadedmetadata = () => {
      this.isPickupSoundLoaded = true;
      if (this.config.debug) {
        console.log('拾取音效加载成功:', this.config.pickupSoundPath);
      }
    };
    
    this.pickupSound.onerror = (error) => {
      console.error('拾取音效加载失败:', error);
      this.config.soundEnabled = false; // 加载失败时禁用音效
    };
  }
  
  // 加载游戏完成音效文件
  loadGameCompleteSound() {
    this.gameCompleteSound = new Audio(this.config.gameCompleteSoundPath);
    this.gameCompleteSound.volume = this.config.gameCompleteSoundVolume;
    
    this.gameCompleteSound.onloadedmetadata = () => {
      this.isGameCompleteSoundLoaded = true;
      if (this.config.debug) {
        console.log('游戏完成音效加载成功:', this.config.gameCompleteSoundPath);
      }
    };
    
    this.gameCompleteSound.onerror = (error) => {
      console.error('游戏完成音效加载失败:', error);
      this.config.gameCompleteSoundEnabled = false; // 加载失败时禁用音效
    };
  }
  
  // 播放拾取音效
  playPickupSound() {
    if (!this.config.soundEnabled || !this.isPickupSoundLoaded || !this.pickupSound) return;
    
    try {
      this.pickupSound.currentTime = 0; // 重置播放位置
      this.pickupSound.play().catch(error => {
        console.warn('拾取音效播放被阻止，可能需要用户交互触发:', error);
        // 尝试在用户交互时重新启用音效
        if (error.name === 'NotAllowedError') {
          this.config.soundEnabled = false;
          console.log('请点击页面以启用音效');
          window.addEventListener('click', () => {
            this.config.soundEnabled = true;
            window.removeEventListener('click', arguments.callee);
          }, { once: true });
        }
      });
    } catch (error) {
      console.error('播放拾取音效时出错:', error);
    }
  }
  
  // 播放游戏完成音效
  playGameCompleteSound() {
    if (this.gameCompleted) return; // 防止重复播放
    
    if (!this.config.gameCompleteSoundEnabled || !this.isGameCompleteSoundLoaded || !this.gameCompleteSound) return;
    
    try {
      this.gameCompleted = true; // 标记为已完成，防止重复播放
      this.gameCompleteSound.currentTime = 0; // 重置播放位置
      this.gameCompleteSound.play().catch(error => {
        console.warn('游戏完成音效播放被阻止，可能需要用户交互触发:', error);
        // 尝试在用户交互时重新启用音效
        if (error.name === 'NotAllowedError') {
          console.log('请点击页面以播放游戏完成音效');
        }
      });
      
      console.log(`已收集 ${this.totalCollectedItems}/${this.config.gameCompleteItemCount} 个物品! 游戏结束`);
      // 可以在这里添加游戏结束逻辑
      if (window.gameManager) {
        window.gameManager.endGame();
      }
    } catch (error) {
      console.error('播放游戏完成音效时出错:', error);
    }
  }
  
  // 创建调试射线
  createDebugLine() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    geometry.attributes.position.setXYZ(0, 0, 0, 0);
    geometry.attributes.position.setXYZ(1, 0, 0, this.config.maxPickDistance);
    geometry.attributes.position.needsUpdate = true;
    
    this.debugLine = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0xff0000 })
    );
    //this.scene.add(this.debugLine);
  }
  
  // 鼠标点击处理
  onMouseClick(event) {
    const now = Date.now();
    if (now - this.lastPickTime < this.config.cooldownTime) return;
    this.lastPickTime = now;
    
    // 计算鼠标标准化坐标
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // 发射射线
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // 更新调试射线
    if (this.config.showDebugLines && this.debugLine) {
      const start = this.raycaster.ray.origin.clone();
      const end = new THREE.Vector3();
      this.raycaster.ray.at(this.config.maxPickDistance, end);
      
      this.debugLine.geometry.attributes.position.setXYZ(0, start.x, start.y, start.z);
      this.debugLine.geometry.attributes.position.setXYZ(1, end.x, end.y, end.z);
      this.debugLine.geometry.attributes.position.needsUpdate = true;
    }
    
    // 检测相交物体
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    if (this.config.debug) {
      console.log(`射线检测到 ${intersects.length} 个物体`);
    }
    
    // 查找可收集的物品
    const collectibleIntersect = intersects.find(intersect => {
      const object = intersect.object;
      return (object.userData.isCollectible && 
              !object.userData.collectible.collected);
    });
    
    if (collectibleIntersect) {
      this.collectItem(collectibleIntersect.object);
    } else {
      if (this.config.debug) {
        console.log('未找到可收集物品');
      }
    }
  }
  
  // 添加可收集物品
  addCollectibleItem(item, itemData = {}) {
    if (!item) return;
    
    // 递归处理组对象
    if (item.isGroup) {
      item.children.forEach(child => {
        this.addCollectibleItem(child, itemData);
      });
      return;
    }
    
    // 处理网格对象
    if (item.isMesh) {
      // 确保物体可交互
      item.userData.isCollectible = true;
      item.userData.collectible = {
        ...itemData,
        collected: false
      };
   
      
      this.interactiveItems.set(item, itemData);
      
      if (this.config.debug) {
        console.log(`添加可交互对象: ${item.name || '未知'} (类型: ${item.type})`);
      }
    }
  }
  updateCollectionCounter() {
    const counterElement = document.getElementById('collection-progress');
    if (counterElement) {
      counterElement.textContent = `已收集：${this.totalCollectedItems}/${this.config.gameCompleteItemCount}`;
    }
  }
  
  
  collectItem(item) {
    const data = item.userData.collectible;
    if (!data || data.collected) return;
  
    console.log(`收集物品: ${item.name || '未知物品'}`);
    data.collected = true;
  
    this.onItemCollected(item, data);
  
    // 播放收集音效
    this.playPickupSound();
  
    //淡出整个 root（即整组或主模型）
    const root = data.root || item;
    this.removeItem(root);
  
    // 清除所有其下 mesh 的标记
    root.traverse(child => {
      if (child.isMesh) {
        this.interactiveItems.delete(child);
        this.collectedItems.add(child);
      }
    });
    
    // 增加已收集物品计数
    this.totalCollectedItems++;
    // 更新计数显示
this.updateCollectionCounter();
    
    // 检查是否达到游戏完成数量
    if (this.totalCollectedItems >= this.config.gameCompleteItemCount) {
      this.playGameCompleteSound();
    } else if (this.config.debug) {
      console.log(`已收集 ${this.totalCollectedItems}/${this.config.gameCompleteItemCount} 个物品`);
    }
  }
  
  // 移除物品
  removeItem(item) {
    if (this.scene && item.parent) {
      // 根据配置使用不同的移除效果
      if (this.config.pickupEffect === 'fade') {
        this.fadeOutItem(item, () => {
          item.parent.remove(item);
        });
      } else {
        item.parent.remove(item);
      }
    } else {
      item.visible = false;
    }
    
    this.interactiveItems.delete(item);
    this.collectedItems.add(item);
    
    if (this.config.debug) {
      console.log(`已移除物品: ${item.name || '未知物品'}`);
    }
  }
  
  // 更自然的淡出 + 漂浮 + 缩小动画
  fadeOutItem(item, onComplete) {
    if (!item.isMesh) {
      onComplete();
      return;
    }

    // 克隆材质，避免影响其他实例
    const originalMaterial = item.material;
    item.material = originalMaterial.clone();
    item.material.transparent = true;
    item.material.depthWrite = false; // 防止闪烁
    item.material.opacity = 1;

    let opacity = 1;
    let scale = 1;
    let floatOffset = 0;

    const animate = () => {
      opacity -= 0.05;
      scale -= 0.03;
      floatOffset += 0.01;

      item.material.opacity = Math.max(0, opacity);
      item.scale.setScalar(Math.max(0, scale));
      item.position.y += 0.01; // 漂浮向上

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        onComplete(); // 完成后从场景中移除
      }
    };

    requestAnimationFrame(animate);
  }
  
  // 物品收集回调
  onItemCollected(item, itemData) {
    console.log(`收集成功! 物品: ${item.name || '未知物品'}`);
    
    if (window.taskSystem) {
      window.taskSystem.updateTaskProgress(itemData.taskId || 'default', 1);
    }
  }
}
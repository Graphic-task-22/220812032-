import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

export class CharacterController {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.model = null;
        this.mixer = null;
        this.actions = {};
        this.currentAction = 'Idle';
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.speed = 100; 
        this.isLoaded = false;
        this.debug = false; 
          // 草地边界信息属性（增加缓冲距离）
    this.grassCenterX = 0;
    this.grassCenterZ = 0;
    this.grassWidth = 4000;
    this.grassHeight = 4000;
    this.bufferDistance = 100; // 距离边缘的缓冲距离（米）
        // 键盘状态
        this.keys = {
            w: false, a: false, s: false, d: false,
            space: false
        };
        
        // 相机跟随偏移
        this.cameraOffset = new THREE.Vector3(0, 70, 100); 
        this.motionSmoothing = 0.4; // 增加移动平滑系数，使相机跟随更流畅
        
        // 记录上次更新时间
        this.lastUpdateTime = performance.now();
        
        // 动画状态
        this.isRolling = false;
         // 碰撞相关属性
    this.lastPosition = new THREE.Vector3(); // 记录上一帧位置
    this.ghostCollision = false; // 标记是否与Ghost碰撞
     // 碰撞距离属性
  this.ghostCollisionDistance = 5; // 与Ghost的碰撞检测距离（米）
        
        this.init();
    }
    
    init() {
       
        this.loadModel();
        this.setupKeyboardControls();
    }
    
    loadModel() {
       
        const loader = new GLTFLoader();
        loader.load(
            '/dong/people/KnightCharacter.gltf',
            (gltf) => {
               
                this.model = gltf.scene;
                this.model.scale.set(10, 10, 10);
                this.model.position.set(0, 1, -1150);
                
               
                this.scene.add(this.model);
                
                // 设置动画
                this.mixer = new AnimationMixer(this.model);
                
                // 存储动画动作
                gltf.animations.forEach((clip) => {
                    this.actions[clip.name] = this.mixer.clipAction(clip);
                  
                });
                
                // 确保必要的动画存在
                if (!this.actions['Idle'] || !this.actions['Run']) {
                    console.error('错误: 缺少必要的动画 (Idle 或 Run)');
                    return;
                }
                
                // 默认播放Idle动画
                this.fadeToAction('Idle', 0.5);
                
                // 设置相机跟随
                this.setupCameraFollow();
                
                // 更新加载状态
                this.isLoaded = true;
              
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100).toFixed(1);
                
            },
            (error) => {
                console.error('角色模型加载失败:', error);
            }
        );
    }
    setGrassBounds(centerX, centerZ, width, height) {
        this.grassCenterX = centerX;
        this.grassCenterZ = centerZ;
        this.grassWidth = width;
        this.grassHeight = height;
    }
    // 碰撞检测方法，使用距离检测替代边界盒相交
  checkGhostCollision(ghostPosition) {
    if (!this.model || !ghostPosition) return false;
    
    // 计算角色与Ghost的距离
    const distance = this.model.position.distanceTo(ghostPosition);
    
    // 当距离小于设定值时视为碰撞
    return distance < this.ghostCollisionDistance;
  }
  
  // 处理与Ghost的碰撞
  onGhostCollision() {
    this.ghostCollision = true;
    
    // 碰撞时停止移动
    this.velocity.set(0, 0, 0);
    
    // 5秒后重置碰撞状态，允许移动
    setTimeout(() => {
      this.ghostCollision = false;
    }, 5000); // 与对话框展示时间一致
  }
    setupKeyboardControls() {
       
        
        // 监听键盘按下事件
        document.addEventListener('keydown', (e) => {
            
            const keyMap = {
                'w': 'w', 'ArrowUp': 'w',
                'a': 'a', 'ArrowLeft': 'a',
                's': 's', 'ArrowDown': 's',
                'd': 'd', 'ArrowRight': 'd',
                ' ': 'space'
            };
            
            const key = e.key;
            const mappedKey = keyMap[key];
            
            if (mappedKey) {
                // 防止重复按键
                if (!this.keys[mappedKey]) {
                    this.keys[mappedKey] = true;
                  
                    
                    // 特殊处理空格键
                    if (mappedKey === 'space' && !this.isRolling) {
                        this.performRoll();
                    }
                }
                
                // 阻止默认行为
                e.preventDefault();
            }
        });
        
        // 监听键盘释放事件
        document.addEventListener('keyup', (e) => {
            const keyMap = {
                'w': 'w', 'ArrowUp': 'w',
                'a': 'a', 'ArrowLeft': 'a',
                's': 's', 'ArrowDown': 's',
                'd': 'd', 'ArrowRight': 'd',
                ' ': 'space'
            };
            
            const key = e.key;
            const mappedKey = keyMap[key];
            
            if (mappedKey && this.keys[mappedKey]) {
                this.keys[mappedKey] = false;
                
                e.preventDefault();
            }
        });
    }
    
    performRoll() {
        if (this.actions['Roll_sword']) {
          
            this.isRolling = true;
            this.fadeToAction('Roll_sword', 0.2);
            
            // 等待动画完成后回到Idle状态
            const clip = this.actions['Roll_sword'].getClip();
            const duration = clip.duration;
            
            
            setTimeout(() => {
                this.fadeToAction('Idle', 0.5);
                this.isRolling = false;
            }, duration * 1000);
        } else {
            console.warn('警告: 未找到翻跟头动画 (Roll_sword)');
        }
    }
    
    setupCameraFollow() {
       
        // 初始相机位置
        this.updateCameraPosition();
    }
 
updateCameraPosition() {
    if (!this.model) return;
    
    // 复用向量对象，避免频繁创建
    if (!this.targetPosition) this.targetPosition = new THREE.Vector3();
    if (!this.cameraOffset) this.cameraOffset = new THREE.Vector3();
    
    const modelPos = this.model.position;
    const modelRotY = this.model.rotation.y;
    
    // 预计算相机偏移，减少三角函数调用
    // 提取公共计算因子，减少重复计算
    const offsetDistance = 100; // 固定偏移距离
    this.cameraOffset.x = offsetDistance * Math.sin(modelRotY);
    this.cameraOffset.z = offsetDistance * Math.cos(modelRotY);
    
    const cameraYOffset = 100;
    
    // 直接设置目标位置，避免临时对象创建
    this.targetPosition.set(
      modelPos.x - this.cameraOffset.x,
      modelPos.y + cameraYOffset,
      modelPos.z - this.cameraOffset.z
    );
    
    // 调整平滑系数，平衡流畅度和性能
    this.motionSmoothing = 0.4; 
    
    // 
    const dx = this.camera.position.x - this.targetPosition.x;
    const dy = this.camera.position.y - this.targetPosition.y;
    const dz = this.camera.position.z - this.targetPosition.z;
    const currentDistanceSq = dx * dx + dy * dy + dz * dz;
    const maxDistanceSq = 100; 
    
    if (currentDistanceSq > maxDistanceSq) {
      // 限制最大移动距离
      this.camera.position.lerp(this.targetPosition, 0.05);
    } else {
      this.camera.position.lerp(this.targetPosition, this.motionSmoothing);
    }
    
    this.camera.lookAt(modelPos);
  }
    fadeToAction(name, duration) {
        if (!this.actions[name]) {
            console.warn(`警告: 尝试切换到不存在的动画 "${name}"`);
            return;
        }
        
        const toAction = this.actions[name];
        const currentAction = this.actions[this.currentAction];
        
        if (currentAction !== toAction) {
          
            currentAction.fadeOut(duration);
            toAction.reset().fadeIn(duration).play();
            this.currentAction = name;
        }
    }
     // 边界检测与约束
  checkAndConstrainToGrass() {
    if (!this.model) return true; // 模型未加载时不进行检测
    
    // 计算考虑缓冲距离后的有效半宽半高
    const effectiveHalfWidth = (this.grassWidth / 2) - this.bufferDistance;
    const effectiveHalfHeight = (this.grassHeight / 2) - this.bufferDistance;
    
    // 计算角色相对于草地中心的位置
    const relX = this.model.position.x - this.grassCenterX;
    const relZ = this.model.position.z - this.grassCenterZ;
    
    // 检测是否超出有效边界（距离边缘100米）
    const isWithinBounds = 
        relX >= -effectiveHalfWidth && 
        relX <= effectiveHalfWidth && 
        relZ >= -effectiveHalfHeight && 
        relZ <= effectiveHalfHeight;
    
    if (!isWithinBounds) {
      // 如果超出边界，将角色位置限制在有效边界上
      let newX = this.model.position.x;
      let newZ = this.model.position.z;
      
      // X轴边界限制
      if (relX < -effectiveHalfWidth) {
        newX = this.grassCenterX - effectiveHalfWidth;
      } else if (relX > effectiveHalfWidth) {
        newX = this.grassCenterX + effectiveHalfWidth;
      }
      
      // Z轴边界限制
      if (relZ < -effectiveHalfHeight) {
        newZ = this.grassCenterZ - effectiveHalfHeight;
      } else if (relZ > effectiveHalfHeight) {
        newZ = this.grassCenterZ + effectiveHalfHeight;
      }
      
      // 更新角色位置到有效边界
      this.model.position.set(newX, this.model.position.y, newZ);
      return false;
    }
    
    return true;
  }
 
    update(deltaTime) {
       
        if (deltaTime === undefined) {
            const now = performance.now();
            deltaTime = (now - this.lastUpdateTime) / 1000;
            this.lastUpdateTime = now;
        }
        
        // 限制最大deltaTime，防止长时间暂停后出现大跳跃
        deltaTime = Math.min(deltaTime, 0.1);
        
        if (!this.model || !this.mixer) {
            console.log('模型或动画混合器未加载，跳过更新');
            return;
        }
        
        // 更新动画
        this.mixer.update(deltaTime);
    

        // 只有在不翻跟头时才处理移动
        if (!this.isRolling) {
            // 处理移动
            this.velocity.set(0, 0, 0);
           
            
            if (this.keys.w) {
                this.velocity.z += this.speed; 
               
            }
            if (this.keys.s) {
                this.velocity.z -= this.speed;
             
            }
            if (this.keys.a) {
                this.velocity.x += this.speed;
               
            }
            if (this.keys.d) {
                this.velocity.x -= this.speed;
               
            }
            
            // 计算速度大小
            const speed = this.velocity.length();
           
            
            // 处理对角线移动，保持速度一致
            if (speed > this.speed) {
                this.velocity.normalize().multiplyScalar(this.speed);
            }
            
            // 限制最大速度，避免高速移动时计算过载
            const maxSpeed = 200;
            if (speed > maxSpeed) {
                this.velocity.normalize().multiplyScalar(maxSpeed);
                
            }
            // 处理与Ghost的碰撞（如果发生碰撞，位置已在HomeScene中回退）
      if (this.ghostCollision) {
        this.velocity.set(0, 0, 0); // 碰撞时停止移动
      }
              // 应用移动前进行边界检测
              const oldPos = this.model.position.clone();
              this.model.position.x += this.velocity.x * deltaTime;
              this.model.position.z += this.velocity.z * deltaTime;
              
              // 边界检测与位置回退
              if (!this.checkAndConstrainToGrass()) {
                  this.model.position.copy(oldPos);
                  this.velocity.set(0, 0, 0); // 重置速度
              }
 
             // 处理与Ghost的碰撞
    if (this.ghostCollision) {
        this.velocity.set(0, 0, 0); // 碰撞时停止移动
      } else {
            // 根据速度切换动画
            if (speed > 0.5) {
                // 移动时播放跑步动画
                if (this.currentAction !== 'Run') {
                    this.fadeToAction('Run', 0.2);
                }
                
                // 更新模型朝向
                this.direction.copy(this.velocity).normalize();
                const angle = Math.atan2(this.direction.x, this.direction.z);
                this.model.rotation.y = angle;
                
                // 应用移动
                const oldPos = this.model.position.clone();
                this.model.position.x += this.velocity.x * deltaTime;
                this.model.position.z += this.velocity.z * deltaTime;
            } else {
                // 静止时播放Idle动画
                if (this.currentAction !== 'Idle') {
                    this.fadeToAction('Idle', 0.5);
                }
            }
        }}
        
        //更新相机位置
        this.updateCameraPosition();
    }
}
    
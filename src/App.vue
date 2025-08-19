<template>
  <div class="app-wrapper">
    <!-- VANTA 波浪背景 -->
    <div ref="vantaRef" class="vanta-background"></div>

    <!-- 主要內容 -->
    <div
      class="w-full h-full flex flex-col relative text-white overflow-hidden bg-transparent gap-[2vh] main-container"
    >
      <header
        class="flex justify-between items-center px-[3vw] py-[2vh] min-h-[12vh] header"
      >
        <h1>布袋港 藍色公路氣象台</h1>
        <div class="time">{{ currentTime }}</div>
      </header>

      <main class="flex-1 grid grid-cols-3 gap-8 px-8 min-h-0 main-content">
        <!-- 左側區塊：船班時刻表 + 3D 模型 + Footer -->
        <section class="col-span-2 flex flex-col gap-4">
          <!-- 船班時刻表 -->
          <div class="flex-1 ferry-schedule">
            <div class="schedule-header">
              <div>預定出發</div>
              <div>船名</div>
              <div>碼頭</div>
              <div>預定抵達</div>
              <div>海氣象預報</div>
              <div>航行舒適度</div>
              <div>開航狀態</div>
            </div>

            <div class="flex flex-col gap-[1vh]">
              <div
                v-for="schedule in schedules"
                :key="schedule.id"
                class="ferry-row"
                :class="getRowClass(schedule.comfort)"
              >
                <div class="time-slot">{{ schedule.departure }}</div>
                <div>{{ schedule.shipName }}</div>
                <div>{{ schedule.pier }}</div>
                <div class="time-slot">{{ schedule.arrival }}</div>
                <div>
                  <div>
                    風力{{ schedule.windLevel }}級 浪高{{ schedule.waveHeight }}
                  </div>
                  <div class="weather-detail">
                    能見度{{ schedule.visibility }}
                  </div>
                </div>
                <div
                  class="comfort-level"
                  :class="getComfortClass(schedule.comfort)"
                >
                  {{ schedule.comfort }}
                </div>
                <div
                  class="status"
                  :class="[
                    getStatusClass(schedule.status),
                    { urgent: schedule.status === '可能停航' },
                  ]"
                >
                  {{ schedule.status }}
                </div>
              </div>
            </div>
          </div>

          <!-- 底部區塊：3D 模型 + Footer -->
          <div class="grid grid-cols-2 gap-4 h-64">
            <!-- 3D 船舶模型 -->
            <div class="weather-card ship-model-card">
              <div class="weather-title">
                <i class="fas fa-ship"></i> 航行船舶
              </div>
              <div ref="shipModelRef" class="ship-model-container"></div>
            </div>

            <!-- Footer 資訊 -->
            <div class="weather-card footer-info">
              <div class="weather-title">
                <i class="fas fa-info-circle"></i> 重要提醒
              </div>
              <div class="footer-text text-center">
                請隨時注意現場廣播與看板<br />風級7級已達管制標準
              </div>
            </div>
          </div>
        </section>

        <!-- 右側資訊面板 -->
        <aside class="flex flex-col gap-8 overflow-y-auto weather-info">
          <!-- 馬公天氣 -->
          <div class="weather-card">
            <div class="weather-title">
              <i class="fas fa-thermometer-half"></i> 馬公天氣
            </div>
            <div class="weather-item">
              <span><i class="fas fa-cloud-rain weather-icon"></i> 溫度</span>
              <span>26~28°C</span>
            </div>
            <div class="weather-item">
              <span><i class="fas fa-tint weather-icon"></i> 降雨機率</span>
              <span>80%</span>
            </div>
            <div class="weather-item">
              <span><i class="fas fa-eye weather-icon"></i> 能見度</span>
              <span>1-5KM</span>
            </div>
          </div>

          <!-- 貼心提醒 -->
          <div class="weather-card alerts">
            <div class="weather-title">
              <i class="fas fa-exclamation-triangle"></i> 貼心提醒
            </div>
            <div class="alert-item">
              <i class="fas fa-clock alert-icon"></i>
              <span>抵達時間受海氣象因素延遲</span>
            </div>
            <div class="alert-item">
              <i class="fas fa-cloud-rain alert-icon"></i>
              <span>下雨機率80% 小心甲板濕滑</span>
            </div>
            <div class="alert-item">
              <i class="fas fa-pills alert-icon"></i>
              <span>因風浪搖晃建議準備暈船藥</span>
            </div>
          </div>

          <!-- 明日預報 -->
          <div class="weather-card tomorrow-forecast">
            <div class="weather-title flex items-center justify-between gap-2">
              <div><i class="fas fa-calendar-alt"></i> 明日預報</div>
              <div class="forecast-date">8月9日 星期六</div>
            </div>
            <div class="flex items-center justify-center gap-8">
              <div class="forecast-icon">
                <i class="fas fa-cloud-rain fa-2x"></i>
              </div>
              <div class="forecast-temp">26~28°C</div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "App",
  setup() {
    const currentTime = ref("");
    const vantaRef = ref(null);
    const shipModelRef = ref(null);
    let vantaEffect = null;
    let shipScene = null;
    let shipRenderer = null;

    const schedules = ref([
      {
        id: 1,
        departure: "10:00",
        shipName: "太吉之星",
        pier: "B1",
        arrival: "11:20",
        windLevel: 7,
        waveHeight: "1.8m",
        visibility: "1KM",
        comfort: "大力搖晃",
        status: "可能停航",
      },
      {
        id: 2,
        departure: "12:00",
        shipName: "凱旋8號",
        pier: "F2",
        arrival: "13:00",
        windLevel: 5,
        waveHeight: "1.5m",
        visibility: "3KM",
        comfort: "搖晃",
        status: "開航",
      },
      {
        id: 3,
        departure: "14:00",
        shipName: "藍鵲輪",
        pier: "B1",
        arrival: "15:00",
        windLevel: 4,
        waveHeight: "1m",
        visibility: "5KM",
        comfort: "些微搖晃",
        status: "開航",
      },
    ]);

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      currentTime.value = `${hours}:${minutes}`;
    };

    const getRowClass = (comfort) => {
      switch (comfort) {
        case "大力搖晃":
          return "severe";
        case "搖晃":
          return "moderate";
        case "些微搖晃":
          return "mild";
        default:
          return "";
      }
    };

    const getComfortClass = (comfort) => {
      switch (comfort) {
        case "大力搖晃":
          return "comfort-severe";
        case "搖晃":
          return "comfort-moderate";
        case "些微搖晃":
          return "comfort-mild";
        default:
          return "comfort-mild";
      }
    };

    const getStatusClass = (status) => {
      return status === "可能停航" ? "status-suspended" : "status-operating";
    };

    // 3D 模型設置函式
    const initShipModel = () => {
      console.log("初始化 3D 模型...");

      if (!window.THREE) {
        console.error("THREE.js 未載入");
        return;
      }

      if (!window.THREE.FBXLoader) {
        console.error("FBXLoader 未載入");
        return;
      }

      if (!shipModelRef.value) {
        console.error("shipModelRef 不存在");
        return;
      }

      console.log(
        "容器尺寸:",
        shipModelRef.value.clientWidth,
        "x",
        shipModelRef.value.clientHeight
      );

      // 創建場景
      shipScene = new window.THREE.Scene();
      // 不設定背景色，保持透明

      // 創建相機
      const camera = new window.THREE.PerspectiveCamera(
        60, // 減小視野角度讓模型看起來更大
        shipModelRef.value.clientWidth / shipModelRef.value.clientHeight,
        0.1,
        1000
      );
      camera.position.set(2, 1.25, 2); // 拉近相機距離
      camera.lookAt(0, 0, 0);

      // 創建渲染器
      shipRenderer = new window.THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      shipRenderer.setSize(
        shipModelRef.value.clientWidth,
        shipModelRef.value.clientHeight
      );
      shipRenderer.setClearColor(0x000000, 0); // 完全透明背景
      shipRenderer.shadowMap.enabled = true;
      shipRenderer.shadowMap.type = window.THREE.PCFSoftShadowMap;
      shipModelRef.value.appendChild(shipRenderer.domElement);

      // 添加多個燈光來增加亮度
      const ambientLight = new window.THREE.AmbientLight(0xffffff, 1.2); // 增加環境光
      shipScene.add(ambientLight);

      const directionalLight = new window.THREE.DirectionalLight(0xffffff, 1.5); // 增加方向光
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      shipScene.add(directionalLight);

      // 添加多個點光源來增加亮度
      const pointLight1 = new window.THREE.PointLight(0xffffff, 0.8, 100);
      pointLight1.position.set(5, 5, 5);
      shipScene.add(pointLight1);

      const pointLight2 = new window.THREE.PointLight(0xffffff, 0.6, 100);
      pointLight2.position.set(-5, 5, 5);
      shipScene.add(pointLight2);

      const pointLight3 = new window.THREE.PointLight(0xffffff, 0.4, 100);
      pointLight3.position.set(0, -3, 5);
      shipScene.add(pointLight3);

      // 先添加一個測試立方體來確認場景正常
      const geometry = new window.THREE.BoxGeometry(0.8, 0.8, 0.8);
      const material = new window.THREE.MeshPhongMaterial({
        color: 0x00ff88,
        transparent: false,
        opacity: 1.0,
        shininess: 100,
      });
      const testCube = new window.THREE.Mesh(geometry, material);
      testCube.position.set(0, 0, 0);
      testCube.castShadow = true;
      testCube.receiveShadow = true;
      shipScene.add(testCube);

      // 渲染循環（先顯示測試立方體）
      const animate = () => {
        requestAnimationFrame(animate);
        testCube.rotation.x += 0.01;
        testCube.rotation.y += 0.01;
        shipRenderer.render(shipScene, camera);
      };
      animate();

      // 等待一秒後嘗試載入模型，確保 DOM 元素完全準備好
      setTimeout(() => {
        // 嘗試載入 GLB 模型（應該比較穩定）
        const gltfLoader = new window.THREE.GLTFLoader();
        console.log("開始載入 GLB 檔案...", "./src/images/porta.glb");
        console.log(
          "容器已準備好:",
          shipModelRef.value.clientWidth,
          "x",
          shipModelRef.value.clientHeight
        );

        gltfLoader.load(
          "./src/images/porta.glb",
          (gltf) => {
            console.log("GLB 載入成功!", gltf);
            console.log("場景內容:", gltf.scene);
            console.log("場景子物件數量:", gltf.scene.children.length);

            // 移除測試立方體
            shipScene.remove(testCube);

            const model = gltf.scene;

            // 確保模型有內容
            if (model.children.length === 0) {
              console.warn("GLB 模型為空，沒有子物件");
              return;
            }

            // 遍歷所有子物件並設置材質
            model.traverse((child) => {
              if (child.isMesh) {
                console.log(
                  "找到 Mesh:",
                  child.name,
                  child.geometry,
                  child.material
                );
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  // 確保材質可見並增加亮度
                  child.material.transparent = false;
                  child.material.opacity = 1.0;

                  // 如果是標準材質，增加發光效果
                  if (child.material.emissive) {
                    child.material.emissive.setHex(0x111111); // 輕微發光
                  }
                  if (child.material.emissiveIntensity !== undefined) {
                    child.material.emissiveIntensity = 0.2;
                  }

                  // 增加材質亮度
                  if (child.material.color) {
                    child.material.color.multiplyScalar(1.1); // 增加亮度
                  }
                }
              }
            });

            // 計算模型的邊界框來自動調整縮放
            const box = new window.THREE.Box3().setFromObject(model);
            const size = box.getSize(new window.THREE.Vector3());
            console.log("模型尺寸:", size.x, size.y, size.z);

            if (size.x === 0 || size.y === 0 || size.z === 0) {
              console.warn("模型尺寸為零，可能載入有問題");
              return;
            }

            // 根據模型尺寸自動調整縮放，讓模型佔滿區塊
            const maxSize = Math.max(size.x, size.y, size.z);
            const scale = 2.8 / maxSize; // 增大縮放比例，讓模型佔滿區塊
            console.log("計算的縮放比例:", scale);
            model.scale.set(scale, scale, scale);

            // 將模型置中
            const center = box.getCenter(new window.THREE.Vector3());
            model.position.sub(center.multiplyScalar(scale));
            console.log("模型位置:", model.position);

            shipScene.add(model);
            console.log(
              "GLB 模型已添加到場景，場景物件數量:",
              shipScene.children.length
            );

            // 更新渲染循環以旋轉模型
            const animateModel = () => {
              requestAnimationFrame(animateModel);
              model.rotation.y += 0.005; // 較慢的旋轉速度
              shipRenderer.render(shipScene, camera);
            };
            animateModel();
          },
          (progress) => {
            if (progress.total > 0) {
              const percent = (
                (progress.loaded / progress.total) *
                100
              ).toFixed(2);
              console.log("GLB 載入進度:", percent + "%");
            }
          },
          (error) => {
            console.error("載入 GLB 模型時發生錯誤:", error);
            console.log("GLB 載入失敗，嘗試 FBX...");

            // 如果 GLB 失敗，回退到 FBX
            const fbxLoader = new window.THREE.FBXLoader();
            fbxLoader.load(
              "./src/images/porta.fbx",
              (object) => {
                console.log("FBX 載入成功!", object);

                // 移除測試立方體
                shipScene.remove(testCube);

                // 計算模型的邊界框來自動調整縮放
                const box = new window.THREE.Box3().setFromObject(object);
                const size = box.getSize(new window.THREE.Vector3());
                console.log("FBX 模型尺寸:", size);

                // 根據模型尺寸自動調整縮放，讓模型佔滿區塊
                const maxSize = Math.max(size.x, size.y, size.z);
                const scale = 4 / maxSize; // 增大縮放比例
                object.scale.set(scale, scale, scale);

                // 將模型置中
                const center = box.getCenter(new window.THREE.Vector3());
                object.position.sub(center.multiplyScalar(scale));

                shipScene.add(object);
                console.log("FBX 模型已添加到場景");

                // 更新渲染循環以旋轉模型
                const animateModel = () => {
                  requestAnimationFrame(animateModel);
                  object.rotation.y += 0.005;
                  shipRenderer.render(shipScene, camera);
                };
                animateModel();
              },
              (progress) => {
                if (progress.total > 0) {
                  const percent = (
                    (progress.loaded / progress.total) *
                    100
                  ).toFixed(2);
                  console.log("FBX 載入進度:", percent + "%");
                }
              },
              (fbxError) => {
                console.error("載入 FBX 模型也失敗:", fbxError);
                console.log("繼續顯示測試立方體");
              }
            );
          },
          1000
        ); // 延遲 1 秒載入模型
      });
    };

    let timeInterval;

    onMounted(() => {
      updateTime();
      timeInterval = setInterval(updateTime, 60000);

      // 初始化 VANTA 波浪效果
      if (window.VANTA && window.THREE) {
        vantaEffect = window.VANTA.WAVES({
          el: vantaRef.value,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
        });
      }

      // 初始化 3D 船舶模型
      setTimeout(() => {
        initShipModel();
      }, 100);

      // 添加緊急狀態閃爍效果
      setInterval(() => {
        const urgentElements = document.querySelectorAll(".urgent");
        urgentElements.forEach((el) => {
          el.style.opacity = el.style.opacity === "0.7" ? "1" : "0.7";
        });
      }, 1000);
    });

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
      if (vantaEffect) {
        vantaEffect.destroy();
      }
      if (shipRenderer && shipModelRef.value) {
        shipModelRef.value.removeChild(shipRenderer.domElement);
        shipRenderer.dispose();
      }
    });

    return {
      currentTime,
      schedules,
      vantaRef,
      shipModelRef,
      getRowClass,
      getComfortClass,
      getStatusClass,
    };
  },
};
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.vanta-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.main-container {
  font-family: "Microsoft JhengHei", "Noto Sans TC", sans-serif;
  font-size: 1.25rem;
}

.header {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
}

.header::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
}

.header h1 {
  font-size: 4rem;
  font-weight: bold;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
}

.time {
  font-size: 3.5rem;
  font-weight: bold;
  color: #ffeb3b;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  font-family: "Courier New", monospace;
}

/* main-content 現在使用 Tailwind utilities */

.ferry-schedule {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  padding: 2vh 2vw;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  overflow-y: auto;
  position: relative;
}

.ferry-schedule::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  border-radius: 20px 20px 0 0;
}

.schedule-header {
  display: grid;
  grid-template-columns: 1fr 1.5fr 0.8fr 1fr 2fr 1.5fr 1.2fr;
  gap: 1vw;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 1.5vh 1vw;
  border-radius: 8px;
  margin-bottom: 1.5vh;
  font-weight: bold;
  font-size: 1.4rem;
  text-align: center;
}

.ferry-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 0.8fr 1fr 2fr 1.5fr 1.2fr;
  gap: 1vw;
  padding: 2vh 1vw;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  align-items: center;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.ferry-row:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.ferry-row.severe {
  border-left-color: #f44336;
  background: rgba(244, 67, 54, 0.2);
}

.ferry-row.moderate {
  border-left-color: #ff9800;
  background: rgba(255, 152, 0, 0.2);
}

.ferry-row.mild {
  border-left-color: #2196f3;
  background: rgba(33, 150, 243, 0.2);
}

.time-slot {
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
}

.weather-detail {
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 0.5vh;
}

.comfort-level {
  padding: 1vh 1.5vw;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
}

.comfort-severe {
  background: #f44336;
  color: white;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.5);
}

.comfort-moderate {
  background: #ff9800;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.5);
}

.comfort-mild {
  background: #2196f3;
  color: white;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.5);
}

.status {
  padding: 1vh 1.5vw;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
}

.status-suspended {
  background: #f44336;
  color: white;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.5);
}

.status-operating {
  background: #4caf50;
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.5);
}

/* weather-info 現在使用 Tailwind utilities */

.weather-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  padding: 2vh 2vw;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
}

.weather-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  border-radius: 20px 20px 0 0;
}

.weather-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 1.5vh;
  color: #ffeb3b;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.weather-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 1.3rem;
}

.weather-item:last-child {
  border-bottom: none;
}

.weather-icon {
  font-size: 1rem;
  margin-right: 8px;
}

.tomorrow-forecast {
  background: rgba(33, 150, 243, 0.3);
  border: 1px solid rgba(33, 150, 243, 0.5);
  text-align: center;
}

.forecast-date {
  font-size: 1.4rem;
  font-weight: bold;
  color: #81d4fa;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.forecast-icon {
  margin: 1vh 0;
  color: #81d4fa;
  font-size: 2rem;
}

.forecast-temp {
  font-size: 1.8rem;
  color: #ffeb3b;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.alerts {
  background: rgba(244, 67, 54, 0.3);
  border: 1px solid rgba(244, 67, 54, 0.5);
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 1.5vh 1vw;
  margin-bottom: 1vh;
  background: rgba(244, 67, 54, 0.2);
  border-radius: 8px;
  border-left: 4px solid #f44336;
  font-size: 1.1rem;
}

.alert-item:last-child {
  margin-bottom: 0;
}

.alert-icon {
  font-size: 1.2rem;
  margin-right: 10px;
  color: #ffeb3b;
}

.footer {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 -8px 32px rgba(31, 38, 135, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
}

.footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
}

.footer-text {
  font-size: 1.4rem;
  color: #ffeb3b;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.mascot {
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.urgent {
  animation: pulse 2s infinite;
}

/* 3D 船舶模型樣式 */
.ship-model-container {
  width: 100%;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  background: transparent; /* 完全透明背景 */
}

.ship-model-card {
  min-height: 240px;
}

/* Footer 資訊卡片樣式 */
.footer-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  min-height: 240px;
}

.footer-info .footer-text {
  font-size: 1.2rem;
  color: #ffeb3b;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
  line-height: 1.5;
}
</style>

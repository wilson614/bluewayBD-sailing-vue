<template>
  <div class="app-wrapper">
    <!-- VANTA 波浪背景 -->
    <div ref="vantaRef" class="vanta-background"></div>

    <!-- 主要內容 -->
    <div
      class="w-full h-full flex flex-col relative text-white overflow-hidden bg-transparent gap-[2vh] main-container"
    >
      <header class="flex justify-between items-center py-2 px-8">
        <h1>布袋港 藍色公路氣象台</h1>
        <div class="time">{{ currentTime }}</div>
      </header>

      <main class="flex-1 grid grid-cols-3 gap-8 px-6 min-h-0 main-content">
        <!-- 左側區塊：船班時刻表 + 3D 模型 + Footer -->
        <section class="col-span-2 flex flex-col gap-8">
          <!-- 船班時刻表 -->
          <div class="flex flex-col ferry-schedule">
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
          <div class="flex flex-col gap-8">
            <!-- Footer 資訊 -->
            <div class="weather-card ship-model-card">
              <div class="flex gap-4">
                <!-- 3D 船舶模型 -->
                <div
                  ref="shipModelRef"
                  class="ship-model-container w-1/8 h-full"
                ></div>
                <div class="footer-text text-center w-7/8">
                  請隨時注意現場廣播與看板<br />風級7級已達管制標準
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 右側資訊面板 -->
        <aside class="flex flex-col gap-8 overflow-y-auto weather-info">
          <!-- 馬公天氣 -->
          <div class="weather-card">
            <div class="weather-title flex items-center gap-2">
              <i class="fas fa-cloud fa-fw fa-lg"></i>
              <h4 class="inline-block">馬公天氣</h4>
            </div>
            <div class="weather-item flex items-center justify-between">
              <div class="flex items-center gap-4">
                <i class="fas fa-temperature-low fa-fw"></i>
                <h5 class="inline-block">溫度</h5>
              </div>
              <div><span>26~28</span><span class="text-xl ms-4">°C</span></div>
            </div>
            <div class="weather-item flex items-center justify-between">
              <div class="flex items-center gap-4">
                <i class="fas fa-tint weather-icon fa-fw"></i>
                <h5 class="inline-block">降雨機率</h5>
              </div>
              <div><span>80</span><span class="text-xl ms-4">%</span></div>
            </div>
            <div class="weather-item flex items-center justify-between">
              <div class="flex items-center gap-4">
                <i class="fas fa-eye weather-icon fa-fw"></i>
                <h5 class="inline-block">能見度</h5>
              </div>
              <div><span>1-5</span><span class="text-xl ms-4">km</span></div>
            </div>
          </div>

          <!-- 貼心提醒輪播 -->
          <div class="weather-card alerts">
            <div class="weather-title flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 mb-4">
                <i class="fas fa-exclamation-triangle fa-fw fa-lg"></i>
                <h4 class="inline-block">貼心提醒</h4>
              </div>
              <div class="carousel-indicators">
                <div
                  v-for="(alert, index) in alerts"
                  :key="alert.id"
                  class="indicator"
                  :class="{ active: currentAlertIndex === index }"
                ></div>
              </div>
            </div>
            <div class="alert-carousel">
              <div class="alert-slide" :class="{ 'slide-active': true }">
                <div class="alert-item">
                  <i
                    :class="alerts[currentAlertIndex].icon + ' alert-icon'"
                  ></i>
                  <span>{{ alerts[currentAlertIndex].message }}</span>
                </div>
                <div
                  class="alert-item"
                  v-if="alerts[(currentAlertIndex + 1) % alerts.length]"
                >
                  <i
                    :class="
                      alerts[(currentAlertIndex + 1) % alerts.length].icon +
                      ' alert-icon'
                    "
                  ></i>
                  <span>{{
                    alerts[(currentAlertIndex + 1) % alerts.length].message
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 明日預報 -->
          <div class="weather-card tomorrow-forecast">
            <div class="weather-title flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <i class="fas fa-calendar-alt"></i>
                <h4 class="inline-block">明日預報</h4>
              </div>
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

    // 貼心提醒輪播數據
    const alerts = ref([
      {
        id: 1,
        icon: "fas fa-clock",
        message: "抵達時間受海氣象因素延遲",
      },
      {
        id: 2,
        icon: "fas fa-cloud-rain",
        message: "下雨機率80% 小心甲板濕滑",
      },
      {
        id: 3,
        icon: "fas fa-pills",
        message: "因風浪搖晃建議準備暈船藥",
      },
      {
        id: 4,
        icon: "fas fa-life-ring",
        message: "請確實穿著救生衣保持安全",
      },
      {
        id: 5,
        icon: "fas fa-mobile-alt",
        message: "船上提供免費 WiFi 供旅客使用",
      },
    ]);

    // 輪播狀態
    const currentAlertIndex = ref(0);

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

      // 設定固定的 canvas 尺寸
      const canvasWidth = 400; // 您想要的寬度
      const canvasHeight = 180; // 您想要的高度

      console.log("Canvas 尺寸:", canvasWidth, "x", canvasHeight);

      // 創建場景
      shipScene = new window.THREE.Scene();
      // 不設定背景色，保持透明

      // 創建相機
      const canvasAspect = canvasWidth / canvasHeight; // 使用 canvas 的寬高比
      const camera = new window.THREE.PerspectiveCamera(
        60, // 減小視野角度讓模型看起來更大
        canvasAspect,
        0.1,
        1000
      );
      camera.position.set(2, 1.25, 2); // 拉近相機距離
      camera.lookAt(0, 0, 0);

      // 創建渲染器
      shipRenderer = new window.THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance", // 優先使用高效能 GPU
        precision: "highp", // 高精度著色器
      });

      // 設定高解析度渲染
      const pixelRatio = Math.min(window.devicePixelRatio, 2); // 限制最大像素比為 2 以平衡效能
      shipRenderer.setPixelRatio(pixelRatio);
      // 直接設定 canvas 尺寸
      shipRenderer.setSize(canvasWidth, canvasHeight);
      shipRenderer.setClearColor(0x000000, 0); // 完全透明背景
      shipRenderer.shadowMap.enabled = true;
      shipRenderer.shadowMap.type = window.THREE.PCFSoftShadowMap;

      // 啟用色調映射以改善視覺品質
      shipRenderer.toneMapping = window.THREE.ACESFilmicToneMapping;
      shipRenderer.toneMappingExposure = 1.0;

      // 啟用輸出編碼以改善色彩精度
      shipRenderer.outputEncoding = window.THREE.sRGBEncoding;
      shipModelRef.value.appendChild(shipRenderer.domElement);

      // 添加多個燈光來增加亮度
      const ambientLight = new window.THREE.AmbientLight(0xffffff, 1.2); // 增加環境光
      shipScene.add(ambientLight);

      const directionalLight = new window.THREE.DirectionalLight(0xffffff, 1.5); // 增加方向光
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      // 大幅提升陰影貼圖解析度
      directionalLight.shadow.mapSize.width = 4096;
      directionalLight.shadow.mapSize.height = 4096;
      // 改善陰影品質
      directionalLight.shadow.camera.near = 0.1;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.bias = -0.0001;
      directionalLight.shadow.radius = 4;
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
        console.log("Canvas 已準備好:", canvasWidth, "x", canvasHeight);

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

                // 如果幾何體有 UV 座標，啟用各向異性過濾以提升貼圖品質
                if (child.geometry.attributes.uv) {
                  child.geometry.computeVertexNormals();
                }

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

                  // 提升貼圖品質（如果有的話）
                  if (child.material.map) {
                    child.material.map.minFilter =
                      window.THREE.LinearMipmapLinearFilter;
                    child.material.map.magFilter = window.THREE.LinearFilter;
                    child.material.map.anisotropy =
                      shipRenderer.capabilities.getMaxAnisotropy();
                  }

                  // 如果有法線貼圖，也提升其品質
                  if (child.material.normalMap) {
                    child.material.normalMap.minFilter =
                      window.THREE.LinearMipmapLinearFilter;
                    child.material.normalMap.magFilter =
                      window.THREE.LinearFilter;
                    child.material.normalMap.anisotropy =
                      shipRenderer.capabilities.getMaxAnisotropy();
                  }

                  // 標記材質需要更新
                  child.material.needsUpdate = true;
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
              model.rotation.y += 0.025; // 較慢的旋轉速度
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

                // 為 FBX 模型應用相同的高品質設定
                object.traverse((child) => {
                  if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // 如果幾何體有 UV 座標，啟用各向異性過濾以提升貼圖品質
                    if (child.geometry.attributes.uv) {
                      child.geometry.computeVertexNormals();
                    }

                    if (child.material) {
                      // 提升貼圖品質（如果有的話）
                      if (child.material.map) {
                        child.material.map.minFilter =
                          window.THREE.LinearMipmapLinearFilter;
                        child.material.map.magFilter =
                          window.THREE.LinearFilter;
                        child.material.map.anisotropy =
                          shipRenderer.capabilities.getMaxAnisotropy();
                      }

                      // 如果有法線貼圖，也提升其品質
                      if (child.material.normalMap) {
                        child.material.normalMap.minFilter =
                          window.THREE.LinearMipmapLinearFilter;
                        child.material.normalMap.magFilter =
                          window.THREE.LinearFilter;
                        child.material.normalMap.anisotropy =
                          shipRenderer.capabilities.getMaxAnisotropy();
                      }

                      // 標記材質需要更新
                      child.material.needsUpdate = true;
                    }
                  }
                });

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

    // 處理視窗大小變化以維持高解析度
    const handleResize = () => {
      if (shipRenderer && shipModelRef.value && shipScene) {
        // 使用固定的 canvas 尺寸
        const canvasWidth = 800;
        const canvasHeight = 180;

        // 更新渲染器尺寸並保持高像素比
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        shipRenderer.setPixelRatio(pixelRatio);
        shipRenderer.setSize(canvasWidth, canvasHeight);

        // 更新相機寬高比
        const camera = shipScene.children.find((child) => child.isCamera);
        if (camera) {
          camera.aspect = canvasWidth / canvasHeight;
          camera.updateProjectionMatrix();
        }
      }
    };

    // 輪播自動切換功能（每次跳兩個項目）
    const nextAlert = () => {
      currentAlertIndex.value =
        (currentAlertIndex.value + 2) % alerts.value.length;
    };

    let timeInterval;
    let carouselInterval;

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
          shininess: 74.0,
          waveHeight: 27.5,
          waveSpeed: 0.55,
          zoom: 0.85,
        });
      }

      // 初始化 3D 船舶模型
      setTimeout(() => {
        initShipModel();
      }, 100);

      // 添加視窗大小變化監聽器
      window.addEventListener("resize", handleResize);

      // 啟動輪播自動切換（每 4 秒切換一次）
      carouselInterval = setInterval(nextAlert, 4000);

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
      if (carouselInterval) {
        clearInterval(carouselInterval);
      }
      if (vantaEffect) {
        vantaEffect.destroy();
      }
      if (shipRenderer && shipModelRef.value) {
        shipModelRef.value.removeChild(shipRenderer.domElement);
        shipRenderer.dispose();
      }
      // 移除視窗大小變化監聽器
      window.removeEventListener("resize", handleResize);
    });

    return {
      currentTime,
      schedules,
      alerts,
      currentAlertIndex,
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
  font-size: 1.5rem; /* 24px = 1.5rem - H6 級別作為基礎字體 */
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

header h1 {
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
}

.time {
  font-size: 3.5rem; /* 56px = 3.5rem - H2 級別 */
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
  font-size: 1.25rem; /* 32px = 2rem - H5 級別 */
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
  font-size: 1.5rem; /* 24px = 1.5rem - H6 級別 */
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
  font-size: 2.5rem; /* 40px = 2.5rem - H4 級別 */
  font-weight: bold;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
}

.weather-detail {
  font-size: 1.25rem; /* 20px = 1.25rem */
  opacity: 0.8;
  margin-top: 0.5vh;
}

.comfort-level {
  padding: 1vh 1.5vw;
  border-radius: 20px;
  font-size: 1.375rem; /* 22px = 1.375rem */
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
  font-size: 1.375rem; /* 22px = 1.375rem */
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
  color: #ffeb3b;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.weather-item {
  padding: 1vh 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 2rem; /* 32px = 2rem - H5 級別 */
}

.weather-item:last-child {
  border-bottom: none;
}

.weather-icon {
  font-size: 1.5rem; /* 24px = 1.5rem - H6 級別 */
  margin-right: 8px;
}

.tomorrow-forecast {
  background: rgba(33, 150, 243, 0.3);
  border: 1px solid rgba(33, 150, 243, 0.5);
  text-align: center;
}

.forecast-date {
  color: #81d4fa;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.forecast-icon {
  margin: 1vh 0;
  color: #81d4fa;
  font-size: 3.5rem; /* 56px = 3.5rem - H2 級別 */
}

.forecast-temp {
  font-size: 3rem; /* 48px = 3rem - H3 級別 */
  color: #ffeb3b;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.alerts {
  background: rgba(244, 67, 54, 0.3);
  border: 1px solid rgba(244, 67, 54, 0.5);
}

/* 輪播容器 */
.alert-carousel {
  position: relative;
  min-height: 100px;
  height: auto; /* 增加高度以容納兩個項目 */
  overflow: hidden;
}

/* 輪播指示器 */
.carousel-indicators {
  display: flex;
  gap: 6px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
}

.indicator.active {
  background: #ffeb3b;
  box-shadow: 0 0 8px rgba(255, 235, 59, 0.6);
}

/* 輪播幻燈片 */
.alert-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1vh;
}

.alert-slide.slide-active {
  opacity: 1;
  transform: translateX(0);
}

/* 輪播中的提醒項目 */
.alert-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(244, 67, 54, 0.2);
  border-radius: 8px;
  border-left: 4px solid #f44336;
  font-size: 1.25rem; /* 24px = 1.5rem - H6 級別 */
  margin-bottom: 0;
  flex: 1; /* 讓兩個項目平均分配空間 */
}

.alert-icon {
  font-size: 1.75rem; /* 28px = 1.75rem */
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
  overflow: hidden;
  background: transparent; /* 完全透明背景 */
}

.ship-model-card {
  min-height: 240px;
}

/* Footer 資訊卡片樣式 */

.footer-info .footer-text {
  font-size: 2rem; /* 32px = 2rem - H5 級別 */
  color: #ffeb3b;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
  line-height: 1.5;
}
</style>

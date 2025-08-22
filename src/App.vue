<template>
  <div class="app-wrapper">
    <!-- VANTA 波浪背景 -->
    <div ref="vantaRef" class="vanta-background"></div>

    <!-- 主要內容 -->
    <div
      class="w-full h-full flex flex-col relative text-white overflow-hidden bg-transparent main-container"
    >
      <header class="flex justify-between items-center py-2 px-8">
        <div class="flex flex-col">
          <h1>布袋港 藍色公路氣象台</h1>
        </div>
        <div class="datetime-display flex flex-col items-end">
          <div class="date-weekday text-xl text-gray-300">
            {{ currentDate }} {{ currentWeekday }}
          </div>
          <div class="time text-yellow-400">{{ currentTime }}</div>
        </div>
      </header>

      <main class="flex-1 grid gap-8 px-6 min-h-0 main-content">
        <!-- 左側區塊：船班時刻表 + 3D 模型 + Footer -->
        <section class="col-span-2 flex flex-col gap-8">
          <!-- 船班時刻表 -->
          <div class="flex flex-col card-ferry ferry-schedule p-6">
            <!-- 船班標題與分頁指示器 -->
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-4">
                <h3>航班資訊</h3>
                <div class="text-gray-300">資訊更新時間：{{ currentTime }}</div>
              </div>
              <div
                class="schedule-page-indicators"
                v-if="getTotalSchedulePages() > 1"
              >
                <div
                  v-for="page in getTotalSchedulePages()"
                  :key="page"
                  class="schedule-page-indicator"
                  :class="{ active: currentSchedulePage === page - 1 }"
                ></div>
              </div>
            </div>

            <div class="schedule-header">
              <div>預定出發</div>
              <div>船名</div>
              <div>碼頭</div>
              <div>預定抵達</div>
              <div>馬公天氣</div>
              <div>海氣象預報</div>
              <div>航行舒適度</div>
              <div>開航狀態</div>
            </div>

            <div
              class="flex flex-col items-center gap-2 ferry-schedules-container"
            >
              <div
                v-for="schedule in getCurrentPageSchedules()"
                :key="schedule.id"
                class="ferry-row"
                :class="getRowClass(schedule.comfort)"
              >
                <div>
                  <h4>{{ schedule.departure }}</h4>
                </div>
                <div>
                  <h5>{{ schedule.shipName }}</h5>
                </div>
                <div>
                  <h4>{{ schedule.pier }}</h4>
                </div>
                <div>
                  <h5>{{ schedule.arrival }}</h5>
                </div>
                <div class="flex flex-col items-center text-sm">
                  <div>
                    溫度
                    <b>{{ getWeatherByTime(schedule.arrival).temperature }}</b
                    >°C
                  </div>
                  <div>
                    降雨
                    <b>{{ getWeatherByTime(schedule.arrival).rainChance }}</b
                    >%
                  </div>
                </div>
                <div class="flex flex-col items-center">
                  <div>
                    風力 <b class="px-1"> {{ schedule.windLevel }} </b>
                    <small>級</small>
                  </div>
                  <div>
                    浪高<b class="px-1">{{ schedule.waveHeight }}</b>
                    <small>m</small>
                  </div>
                  <div>
                    能見度<b class="px-1">{{ schedule.visibility }}</b>
                    <small>km</small>
                  </div>
                </div>
                <div class="flex items-center justify-center">
                  <div
                    class="comfort-level"
                    :class="getComfortClass(schedule.comfort)"
                  >
                    {{ schedule.comfort }}
                  </div>
                </div>
                <div class="flex items-center justify-center">
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
          </div>

          <!-- 底部區塊：3D 模型 + 貼心提醒 -->
          <div class="flex gap-8">
            <!-- 3D 模型區塊 -->
            <div class="card-ferry basis-1/2 p-6">
              <div class="flex gap-4 justify-center items-center h-full">
                <div
                  ref="shipModelRef"
                  class="ship-model-container flex-none"
                ></div>
                <div class="text-center flex-1">
                  <h4>請隨時注意現場廣播與看板</h4>
                  <h4 class="text-orange-400 font-bold">風級7級已達管制標準</h4>
                </div>
              </div>
            </div>
            <!-- 貼心提醒區塊 -->
            <div class="card-ferry basis-1/2 flex flex-col gap-2 p-6">
              <div
                class="weather-title flex items-center justify-between gap-2"
              >
                <div class="flex items-center gap-2">
                  <i
                    class="fas fa-exclamation-triangle fa-fw fa-lg text-yellow-400"
                  ></i>
                  <h4 class="inline-block">貼心提醒</h4>
                </div>
                <div class="carousel-indicators">
                  <div
                    v-for="page in getTotalAlertPages()"
                    :key="page"
                    class="indicator"
                    :class="{ active: getCurrentAlertPage() === page - 1 }"
                  ></div>
                </div>
              </div>
              <div class="alert-carousel">
                <div class="alert-slide" :class="{ 'slide-active': true }">
                  <div class="alert-item">
                    <i :class="alerts[currentAlertIndex].icon + ' me-2'"></i>
                    <span>{{ alerts[currentAlertIndex].message }}</span>
                  </div>
                  <div
                    class="alert-item"
                    v-if="alerts[(currentAlertIndex + 1) % alerts.length]"
                  >
                    <i
                      :class="
                        alerts[(currentAlertIndex + 1) % alerts.length].icon +
                        ' me-2'
                      "
                    ></i>
                    <span>{{
                      alerts[(currentAlertIndex + 1) % alerts.length].message
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 右側資訊面板（預留空間） -->
        <aside class="flex flex-col gap-8">
          <!-- 可在此添加其他資訊或廣告 -->
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
    const currentDate = ref("");
    const currentWeekday = ref("");
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
        waveHeight: "1.8",
        visibility: "1",
        comfort: "劇烈搖晃",
        status: "可能停航",
      },
      {
        id: 2,
        departure: "12:00",
        shipName: "凱旋8號",
        pier: "F2",
        arrival: "13:00",
        windLevel: 5,
        waveHeight: "1.5",
        visibility: "3",
        comfort: "搖晃",
        status: "正常開航",
      },
      {
        id: 3,
        departure: "14:00",
        shipName: "藍鵲輪",
        pier: "B1",
        arrival: "15:00",
        windLevel: 4,
        waveHeight: "1",
        visibility: "5",
        comfort: "些微搖晃",
        status: "正常開航",
      },
      {
        id: 4,
        departure: "16:00",
        shipName: "布袋之星",
        pier: "A1",
        arrival: "17:20",
        windLevel: 3,
        waveHeight: "0.8",
        visibility: "8",
        comfort: "舒適",
        status: "正常開航",
      },
    ]);

    // 貼心提醒輪播數據
    const alerts = ref([
      {
        id: 1,
        icon: "fas fa-clock fa-fw text-red-200",
        message: "抵達時間受海氣象因素延遲",
      },
      {
        id: 2,
        icon: "fas fa-cloud-rain fa-fw text-sky-200",
        message: "下雨機率80% 小心甲板濕滑",
      },
      {
        id: 3,
        icon: "fas fa-pills fa-fw text-lime-100",
        message: "因風浪搖晃建議準備暈船藥",
      },
      {
        id: 4,
        icon: "fas fa-life-ring fa-fw text-amber-200",
        message: "請確實穿著救生衣保持安全",
      },
      {
        id: 5,
        icon: "fas fa-mobile-alt fa-fw ",
        message: "船上提供免費 WiFi 供旅客使用",
      },
    ]);

    // 輪播狀態
    const currentAlertIndex = ref(0);

    // 馬公天氣資料（根據抵達時間）
    const weatherData = ref([
      {
        id: 1,
        arrivalTime: "11:20",
        temperature: "25~27",
        rainChance: 75,
        visibility: "2-4",
        title: "11:20 抵達時段",
      },
      {
        id: 2,
        arrivalTime: "13:00",
        temperature: "26~28",
        rainChance: 80,
        visibility: "1-5",
        title: "13:00 抵達時段",
      },
      {
        id: 3,
        arrivalTime: "15:00",
        temperature: "27~29",
        rainChance: 65,
        visibility: "3-6",
        title: "15:00 抵達時段",
      },
    ]);

    // 當前顯示的天氣索引
    const currentWeatherIndex = ref(0);

    // 船班輪播相關
    const maxDisplaySchedules = 2; // 最多顯示 2 個航班
    const currentSchedulePage = ref(0);

    // 效能監控
    const isLowPerformanceDevice = ref(false);
    const shouldReduceEffects = ref(false);

    // 3D Canvas 尺寸設定（統一管理）
    const CANVAS_WIDTH = 150;
    const CANVAS_HEIGHT = 150;

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      currentTime.value = `${hours}:${minutes}`;

      // 更新日期
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");
      currentDate.value = `${year}/${month}/${day}`;

      // 更新星期幾
      const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
      const weekday = weekdays[now.getDay()];
      currentWeekday.value = `星期${weekday}`;
    };

    const getRowClass = (comfort) => {
      switch (comfort) {
        case "劇烈搖晃":
          return "severe";
        case "搖晃":
          return "moderate";
        case "些微搖晃":
        case "舒適":
        default:
          return "";
      }
    };

    const getComfortClass = (comfort) => {
      switch (comfort) {
        case "劇烈搖晃":
          return "comfort-severe";
        case "搖晃":
          return "comfort-moderate";
        case "些微搖晃":
          return "comfort-mild";
        case "舒適":
          return "comfort-comfortable";
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

      console.log("Canvas 尺寸:", CANVAS_WIDTH, "x", CANVAS_HEIGHT);

      // 創建場景
      shipScene = new window.THREE.Scene();
      // 不設定背景色，保持透明

      // 創建相機
      const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT; // 使用 canvas 的寬高比
      const camera = new window.THREE.PerspectiveCamera(
        60, // 減小視野角度讓模型看起來更大
        canvasAspect,
        0.1,
        1000
      );
      camera.position.set(2, 1.25, 2); // 拉近相機距離
      camera.lookAt(0, 0, 0);

      // 創建渲染器（優化設定降低 GPU 負擔）
      shipRenderer = new window.THREE.WebGLRenderer({
        alpha: true,
        antialias: false, // 關閉反鋸齒減少 GPU 負擔
        powerPreference: "low-power", // 優先使用低功耗 GPU
        precision: "mediump", // 使用中等精度著色器
      });

      // 設定適中解析度渲染
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5); // 進一步限制像素比以平衡效能
      shipRenderer.setPixelRatio(pixelRatio);
      // 直接設定 canvas 尺寸
      shipRenderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
      shipRenderer.setClearColor(0x000000, 0); // 完全透明背景
      shipRenderer.shadowMap.enabled = false; // 關閉陰影減少運算負擔

      // 簡化色調映射設定
      shipRenderer.toneMapping = window.THREE.LinearToneMapping;
      shipRenderer.toneMappingExposure = 1.4;
      shipModelRef.value.appendChild(shipRenderer.domElement);

      // 簡化光照設定減少 GPU 負擔
      const ambientLight = new window.THREE.AmbientLight(0xffffff, 1.8); // 提高環境光補償其他光源減少
      shipScene.add(ambientLight);

      // 只保留一個方向光，不使用陰影
      const directionalLight = new window.THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = false; // 關閉陰影
      shipScene.add(directionalLight);

      // 先添加一個測試立方體來確認場景正常
      const geometry = new window.THREE.BoxGeometry(0.8, 0.8, 0.8);
      const material = new window.THREE.MeshLambertMaterial({
        // 使用更簡單的 Lambert 材質
        color: 0x00ff88,
        transparent: false,
        opacity: 1.0,
      });
      const testCube = new window.THREE.Mesh(geometry, material);
      testCube.position.set(0, 0, 0);
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
        console.log("開始載入 GLB 檔案...", "/images/porta.glb");
        console.log("Canvas 已準備好:", CANVAS_WIDTH, "x", CANVAS_HEIGHT);

        gltfLoader.load(
          "/images/porta.glb",
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
                    child.material.emissiveIntensity = 0.4;
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
                  // if (child.material.normalMap) {
                  //   child.material.normalMap.minFilter =
                  //     window.THREE.LinearMipmapLinearFilter;
                  //   child.material.normalMap.magFilter =
                  //     window.THREE.LinearFilter;
                  //   child.material.normalMap.anisotropy =
                  //     shipRenderer.capabilities.getMaxAnisotropy();
                  // }

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

            // 更新渲染循環以旋轉模型（降低幀率）
            let lastTime = 0;
            const animateModel = (currentTime) => {
              requestAnimationFrame(animateModel);

              // 限制到 30 FPS 減少 GPU 負擔
              if (currentTime - lastTime > 20) {
                model.rotation.y += 0.015; // 更慢的旋轉速度
                shipRenderer.render(shipScene, camera);
                lastTime = currentTime;
              }
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
              "/images/porta.fbx",
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
                      // if (child.material.normalMap) {
                      //   child.material.normalMap.minFilter =
                      //     window.THREE.LinearMipmapLinearFilter;
                      //   child.material.normalMap.magFilter =
                      //     window.THREE.LinearFilter;
                      //   child.material.normalMap.anisotropy =
                      //     shipRenderer.capabilities.getMaxAnisotropy();
                      // }

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

                // 更新渲染循環以旋轉模型（降低幀率）
                let lastTime = 0;
                const animateModel = (currentTime) => {
                  requestAnimationFrame(animateModel);

                  // 限制到 30 FPS 減少 GPU 負擔
                  if (currentTime - lastTime > 20) {
                    object.rotation.y += 0.003; // 更慢的旋轉速度
                    shipRenderer.render(shipScene, camera);
                    lastTime = currentTime;
                  }
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
        // 更新渲染器尺寸並保持高像素比
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        shipRenderer.setPixelRatio(pixelRatio);
        shipRenderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

        // 更新相機寬高比
        const camera = shipScene.children.find((child) => child.isCamera);
        if (camera) {
          camera.aspect = CANVAS_WIDTH / CANVAS_HEIGHT;
          camera.updateProjectionMatrix();
        }
      }
    };

    // 輪播自動切換功能（每次跳兩個項目）
    const nextAlert = () => {
      currentAlertIndex.value =
        (currentAlertIndex.value + 2) % alerts.value.length;
    };

    // 計算貼心提醒總頁數（每頁顯示2個項目）
    const getTotalAlertPages = () => {
      return Math.ceil(alerts.value.length / 2);
    };

    // 獲取當前貼心提醒頁面索引（基於 currentAlertIndex）
    const getCurrentAlertPage = () => {
      return Math.floor(currentAlertIndex.value / 2);
    };

    // 天氣輪播自動切換功能
    const nextWeather = () => {
      currentWeatherIndex.value =
        (currentWeatherIndex.value + 1) % weatherData.value.length;
    };

    // 根據船班抵達時間同步天氣資訊
    const syncWeatherWithSchedule = () => {
      // 直接按照順序輪播天氣資訊
      currentWeatherIndex.value =
        (currentWeatherIndex.value + 1) % weatherData.value.length;
    };

    // 根據抵達時間獲取對應的天氣資料
    const getWeatherByTime = (arrivalTime) => {
      const weather = weatherData.value.find(
        (w) => w.arrivalTime === arrivalTime
      );
      return weather || { temperature: "25~27", rainChance: 70 };
    };

    // 獲取當前頁面要顯示的船班
    const getCurrentPageSchedules = () => {
      const startIndex = currentSchedulePage.value * maxDisplaySchedules;
      return schedules.value.slice(
        startIndex,
        startIndex + maxDisplaySchedules
      );
    };

    // 船班輪播控制
    const nextSchedulePage = () => {
      const totalPages = Math.ceil(
        schedules.value.length / maxDisplaySchedules
      );
      currentSchedulePage.value = (currentSchedulePage.value + 1) % totalPages;
    };

    // 計算總頁數
    const getTotalSchedulePages = () => {
      return Math.ceil(schedules.value.length / maxDisplaySchedules);
    };

    // 效能檢測函數
    const detectPerformance = () => {
      // 檢測裝置記憶體
      const memory = navigator.deviceMemory || 4;
      // 檢測硬體並行度
      const cores = navigator.hardwareConcurrency || 2;
      // 檢測是否為行動裝置
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // 判斷是否為低效能裝置
      isLowPerformanceDevice.value = memory < 4 || cores < 4 || isMobile;
      shouldReduceEffects.value =
        isLowPerformanceDevice.value || window.innerWidth < 1200;

      console.log("效能檢測結果:", {
        memory,
        cores,
        isMobile,
        isLowPerformanceDevice: isLowPerformanceDevice.value,
        shouldReduceEffects: shouldReduceEffects.value,
      });
    };

    // 效能適配的 VANTA 設定
    const getVantaConfig = () => {
      if (shouldReduceEffects.value) {
        return {
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          scale: 0.1,
          scaleMobile: 0.05,
          shininess: 10.0,
          waveHeight: 8.0,
          waveSpeed: 0.1,
          zoom: 1.5,
          forceAnimate: false,
          color: 0x00264c,
        };
      } else {
        return {
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          scale: 0.4,
          scaleMobile: 0.25,
          shininess: 20.0,
          waveHeight: 10.0,
          waveSpeed: 0.3,
          zoom: 1.2,
          forceAnimate: false,
          color: 0x00264c,
        };
      }
    };

    let timeInterval;
    let carouselInterval;
    let weatherCarouselInterval;
    let scheduleCarouselInterval;

    onMounted(() => {
      updateTime();
      timeInterval = setInterval(updateTime, 60000);

      // 先進行效能檢測
      detectPerformance();

      // 根據裝置效能初始化 VANTA 波浪效果
      if (window.VANTA && window.THREE && !shouldReduceEffects.value) {
        const vantaConfig = getVantaConfig();
        vantaEffect = window.VANTA.WAVES({
          el: vantaRef.value,
          THREE: window.THREE,
          minHeight: 200.0,
          minWidth: 200.0,
          ...vantaConfig,
        });
      } else if (shouldReduceEffects.value) {
        // 低效能裝置使用簡單背景色
        vantaRef.value.style.background =
          "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)";
        console.log("使用簡化背景以提升效能");
      }

      // 根據裝置效能決定是否載入 3D 船舶模型
      if (!isLowPerformanceDevice.value) {
        setTimeout(() => {
          initShipModel();
        }, 100);
      } else {
        // 低效能裝置顯示簡單的船舶圖片
        if (shipModelRef.value) {
          shipModelRef.value.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(255,255,255,0.1); border-radius: 8px;">
              <i class="fas fa-ship" style="font-size: 4rem; color: #00bcd4;"></i>
            </div>
          `;
        }
        console.log("使用簡化船舶圖示以提升效能");
      }

      // 添加視窗大小變化監聽器
      window.addEventListener("resize", handleResize);

      // 啟動輪播自動切換（每 4 秒切換一次）
      carouselInterval = setInterval(nextAlert, 4000);

      // 啟動天氣輪播自動切換（每 5 秒切換一次）
      weatherCarouselInterval = setInterval(nextWeather, 5000);

      // 啟動船班輪播自動切換（只在超過2個船班時啟動，每8秒切換一次）
      if (schedules.value.length > maxDisplaySchedules) {
        scheduleCarouselInterval = setInterval(nextSchedulePage, 8000);
      }

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
      if (weatherCarouselInterval) {
        clearInterval(weatherCarouselInterval);
      }
      if (scheduleCarouselInterval) {
        clearInterval(scheduleCarouselInterval);
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
      currentDate,
      currentWeekday,
      schedules,
      alerts,
      currentAlertIndex,
      weatherData,
      currentWeatherIndex,
      isLowPerformanceDevice,
      shouldReduceEffects,
      vantaRef,
      shipModelRef,
      getRowClass,
      getComfortClass,
      getStatusClass,
      getWeatherByTime,
      getCurrentPageSchedules,
      getTotalSchedulePages,
      currentSchedulePage,
      getTotalAlertPages,
      getCurrentAlertPage,
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
  backdrop-filter: blur(1px);
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

/* 日期時間顯示區塊 */
.datetime-display {
  text-align: right;
}

.date-weekday {
  font-size: 1.25rem; /* 20px */
  font-weight: 500;
  color: #e5e7eb;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
  font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
  opacity: 0.9;
}

.time {
  font-size: 2.25rem; /* 56px = 3.5rem - H2 級別 */
  font-weight: bold;
  text-shadow: 2px 2px 8px rgba(17, 58, 109, 0.8);
  font-family: "Courier New", monospace;
}

/* main-content 現在使用 Tailwind utilities */

.card-ferry {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(1px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  overflow-y: hidden;
  /* position: relative;
  min-height: 400px; */
}

.ferry-schedule {
  min-height: 400px;
}

.ferry-schedules-container {
  min-height: 280px;
  height: auto;
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
  grid-template-columns: 1fr 1.5fr 0.8fr 1fr 1.2fr 1.8fr 1.5fr 1.2fr;
  gap: 1vw;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(0.5px);
  padding: 1.5vh 1vw;
  border-radius: 8px;
  margin-bottom: 1.5vh;
  font-weight: bold;
  font-size: 1.25rem; /* 32px = 2rem - H5 級別 */
  text-align: center;
}

.ferry-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 0.8fr 1fr 1.2fr 1.8fr 1.5fr 1.2fr;
  gap: 1vw;
  padding: 2vh 1vw;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(0.5px);
  border-radius: 8px;
  align-items: center;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  font-size: 1.5rem; /* 24px = 1.5rem - H6 級別 */
  width: 100%;
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

/* .time-slot {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
} */

/* 已移除未使用的 weather-detail 樣式 */

.comfort-level {
  padding: 1rem;
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

.comfort-comfortable {
  background: #4caf50;
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.5);
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

/* 輪播容器 */
.alert-carousel {
  position: relative;
  min-height: 15vh;
  height: auto; /* 增加高度以容納兩個項目 */
  overflow: hidden;
}

/* 已移除未使用的天氣輪播樣式 */

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

/* 已移除未使用的天氣指示器樣式 */

/* 船班分頁指示器 */
.schedule-page-indicators {
  display: flex;
  gap: 8px;
  align-items: center;
}

.schedule-page-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.schedule-page-indicator.active {
  background: #ffc107;
  border-color: rgba(255, 193, 7, 0.5);
  box-shadow: 0 0 12px rgba(255, 193, 7, 0.8);
  transform: scale(1.2);
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
  padding: 0.25rem 1rem;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 8px;
  border-left: 4px solid #ffc107;
  font-size: 1.25rem; /* 24px = 1.5rem - H6 級別 */
  margin-bottom: 0;
  flex: 1; /* 讓兩個項目平均分配空間 */
}

/* 已移除未使用的天氣幻燈片樣式 */

/* 已移除未使用的 footer 和 mascot 樣式 */

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

/* 已移除未使用的 footer 資訊樣式 */
</style>

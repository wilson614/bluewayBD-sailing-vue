<template>
  <div class="app-wrapper">
    <!-- 輪播背景圖片 -->
    <div class="carousel-background">
      <div 
        v-for="(bg, index) in backgroundImages" 
        :key="index"
        class="background-slide"
        :class="{ 'active': currentBackgroundIndex === index }"
        :style="{ backgroundImage: `url(${bg})` }"
      ></div>
    </div>
    <!-- 主要內容 -->
    <div
      class="w-full flex flex-col relative text-white bg-transparent main-container"
      :class="{ 
        'h-full overflow-hidden': isLargeScreen,
        'min-h-screen overflow-x-hidden': !isLargeScreen 
      }"
    >
      <header class="flex flex-col py-3 lg:py-0">
        <div class="flex flex-row justify-between items-center 2xl:py-2 px-4 sm:py-4 px-8 gap-4 lg:gap-4">
           <div class="flex items-center gap-2">
          <!-- TIPC Logo -->
          <img 
            src="/images/logo-tipc.svg" 
            alt="TIPC Logo" 
            class="h-8 sm:h-12 lg:h-16 w-auto"
          />
          <div class="flex">
            <h1>{{ origin }}港</h1>
          </div>
        </div>
        <h1 class="hidden text-center md:text-left md:inline-block">藍色公路航線資訊</h1>
        <div class="datetime-display flex flex-col items-end">
          <div class="date-weekday text-xl text-gray-300">
            {{ currentDate }} {{ currentWeekday }}
          </div>
          <div class="time text-yellow-400">{{ currentTime }}</div>
        </div>
        </div>
        <h1 class="block md:hidden text-center">藍色公路航線資訊</h1>
      </header>

      <main class=" lg:grid lg:grid-cols-3 gap-2 lg:gap-4 px-2 lg:px-6 min-h-0 main-content">
        <!-- 左側區塊：船班時刻表 + 3D 模型 + Footer -->
        <section class="lg:col-span-3 flex flex-col gap-4">
          <!-- 船班時刻表 -->
          <div class="flex flex-col card-ferry ferry-schedule p-4">
            <!-- 船班標題 -->
            <div class="flex justify-between items-center mb-2 lg:mb-4 gap-2">
              <div class="flex items-center justify-between gap-4 w-full lg:w-auto">
                <h3>{{ dayLabel }}({{ currentDateMD }})航班資訊</h3>
                <div class="text-gray-300 lg:text-2xl text-sm">資訊更新時間：{{ currentTime }}</div>
              </div>
              <!-- 桌面版分頁指示器 -->
              <div
                class="schedule-page-indicators hidden lg:flex"
                v-if="getTotalSchedulePages() > 1"
              >
                <div
                  v-for="page in getTotalSchedulePages()"
                  :key="page"
                  class="schedule-page-indicator hidden lg:flex"
                  :class="{ active: currentSchedulePage === page - 1 }"
                ></div>
              </div>
            </div>
            
            <!-- 行動版航班輪播指示器（獨立區域） -->
            <div
              class="mobile-schedule-indicators-container lg:hidden flex justify-center mb-4"
              v-if="getTotalMobileSchedules() > 1"
            >
              <div class="flex gap-2">
                <div
                  v-for="schedule in getTotalMobileSchedules()"
                  :key="`mobile-indicator-${schedule}`"
                  class="mobile-schedule-indicator w-3 h-3 rounded-full transition-colors duration-300"
                  :class="{ 
                    'bg-blue-400': currentMobileScheduleIndex === schedule - 1,
                    'bg-gray-400': currentMobileScheduleIndex !== schedule - 1 
                  }"
                ></div>
              </div>
            </div>

            <!-- 桌面版表格標題 -->
            <div class="hidden lg:grid grid-ferry schedule-header">
              <h5>預定出發</h5>
              <h5>船名</h5>
              <h5>碼頭</h5>
              <h5>預定抵達</h5>
              <h5>航行舒適度</h5>
              <h5>開航狀態</h5>
              <h5>抵達{{ destination }}天氣</h5>
              <h5>海象預報</h5>
            </div>

            <!-- 桌面版船班列表 -->
            <div class="hidden lg:flex flex-col items-center gap-2 ferry-schedules-container">
              <div
                v-for="schedule in getCurrentPageSchedules()"
                :key="schedule.id"
                class="grid grid-ferry ferry-row py-2"
                :class="getRowClass(schedule.comfort)"
              >
                <div>
                  <h3>{{ schedule.departure }}</h3>
                </div>
                <div>
                  <h2>{{ schedule.shipName }}</h2>
                </div>
                <div>
                  <h3>{{ schedule.pier }}</h3>
                </div>
                <div>
                  <h3>{{ schedule.arrival }}</h3>
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
                <div class="grid grid-cols-2 gap-x-3 gap-y-1">
                  
                    <!-- 天氣圖示 -->
                    <div class="weather-icon flex justify-end">
                      <img 
                        :src="`/images/weather_icons/day/${getWeatherByTime(schedule.arrival).weatherCode}.svg`"
                        :alt="getWeatherByTime(schedule.arrival).weatherDesc"
                        class="w-12 h-12"
                        onerror="this.style.display='none'; this.nextSibling.style.display='inline-block';"
                      />
                      <i class="fas fa-cloud fa-3x text-blue-300" style="display: none;"></i>
                    </div>
                    <!-- 溫度資訊 -->
                    <div>
                      <h4 class="text-bold me-2 inline-block">{{
                        getWeatherByTime(schedule.arrival).temperature
                      }}</h4>
                      <p class="inline-block">°C</p>
                    </div>
                 
                  <div class="text-2xl text-right"><i class="fas fa-umbrella fa-fw"></i></div>
                  <div class="col-span-1">
                    <h5 class="text-bold me-2 inline-block">{{
                      getWeatherByTime(schedule.arrival).rainChance
                    }}</h5>
                    <p class="inline-block">%</p>
                  </div>
                  <div class="col-span-2 text-center"><p>{{
                      getWeatherByTime(schedule.arrival).weatherComfort
                    }}</p></div>
                </div>
                <div class="grid grid-cols-3 gap-x-3 gap-y-1">
                  <div class="text-2xl text-right pe-2"><i class="fas fa-wind fa-fw"></i></div>
                  <div class="col-span-2">
                    <h5 class="text-bold me-2 inline-block">{{ schedule.windLevel }}</h5>
                    <p class="inline-block">級</p>
                  </div>
                  <div class="text-2xl text-right pe-2"><i class="fas fa-water fa-fw"></i></div>
                  <div class="col-span-2">
                    <h5 class="text-bold me-2 inline-block">{{ schedule.waveHeight }}</h5>
                    <p class="inline-block">m</p>
                  </div>
                  <div class="text-2xl text-right pe-2"><i class="fas fa-eye fa-fw"></i></div>
                  <div class="col-span-2">
                    <h5 class="text-bold me-2 inline-block">{{ schedule.visibility }}</h5>
                    <p class="inline-block">km</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 行動版卡片式列表 -->
            <div class="lg:hidden space-y-4">
              <div
                v-for="schedule in getCurrentMobileSchedules()"
                :key="`mobile-${schedule.id}`"
                class="ferry-card p-4 rounded-lg"
                :class="getRowClass(schedule.comfort)"
              >
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div class="space-y-2">
                    <p class="text-gray-300">船名</p>
                    <h2 class="">{{ schedule.shipName }}</h2>
                  </div>
                  <div class="space-y-2">
                    <p class="text-gray-300">碼頭</p>
                    <h3 class="">{{ schedule.pier }}</h3>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div class="space-y-2">
                    <p class="text-gray-300">預訂出發</p>
                    <h3 class="">{{ schedule.departure }}</h3>
                  </div>
                  <div class="space-y-2">
                    <p class="text-gray-300">預訂抵達</p>
                    <h3 class="">{{ schedule.arrival }}</h3>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div class="space-y-2">
                    <p class="text-gray-300">航行舒適度</p>
                    <div class="comfort-level" :class="getComfortClass(schedule.comfort)">
                      {{ schedule.comfort }}
                    </div>
                  </div>
                  <div class="space-y-2">
                    <p class="text-gray-300">開航狀態</p>
                    <div class="status" :class="[getStatusClass(schedule.status), { urgent: schedule.status === '可能停航' }]">
                      {{ schedule.status }}
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <p class="text-gray-300">抵達{{ destination }}天氣</p>
                    <div class="flex items-center gap-2">
                      <img 
                        :src="`/images/weather_icons/day/${getWeatherByTime(schedule.arrival).weatherCode}.svg`"
                        :alt="getWeatherByTime(schedule.arrival).weatherDesc"
                        class="w-8 h-8"
                        onerror="this.style.display='none'; this.nextSibling.style.display='inline-block';"
                      />
                      <i class="fas fa-cloud text-blue-300" style="display: none;"></i>
                      <h4>{{ getWeatherByTime(schedule.arrival).temperature }}</h4>
                      <p >°C</p>
                    </div>
                    
                    <div class="flex items-center gap-2">
                      <div class="text-2xl text-right"><i class="fas fa-umbrella fa-fw"></i></div>
                      <h5>{{
                        getWeatherByTime(schedule.arrival).rainChance
                      }}</h5>
                      <p>%</p>
                    </div>
                    <p>{{
                      getWeatherByTime(schedule.arrival).weatherComfort
                    }}</p></div>
                  <div class="space-y-2">
                    <p class="text-gray-300">海象預報</p>
                    <div>
                      <div class="flex flex-row items-center gap-2">
                        <i class="fas fa-wind"></i> 
                        <h5>{{ schedule.windLevel }}</h5>
                        <p>級</p></div>
                      <div class="flex flex-row items-center gap-2">
                        <i class="fas fa-water"></i>
                         <h5>{{ schedule.waveHeight }}</h5>
                         <p>m</p></div>
                      <div class="flex flex-row items-center gap-2">
                        <i class="fas fa-eye"></i>
                         <h5>{{ schedule.visibility }}</h5>
                         <p>km</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部統一資訊區塊 -->
          <div class="card-ferry p-3 lg:p-4">
            <div class="flex flex-col lg:flex-row gap-4 lg:gap-8 h-full">
              <!-- 3D 模型區塊 -->
              <div class="lg:basis-2/12 flex flex-col justify-center items-center gap-2 lg:gap-4">
                <div class="flex items-center gap-2">
                  <i class="fas fa-exclamation-triangle fa-fw fa-lg text-yellow-400"></i>
                  <h4 class="inline-block">貼心提醒</h4>
                </div>
                <div
                  ref="shipModelRef"
                  class="ship-model-container flex-none"
                ></div>
              </div>
              
              <!-- 貼心提醒區塊 -->
              <div class="lg:basis-10/12 flex flex-col justify-center gap-2">
                
                <div class="alert-carousel">
                  <div class="alert-slide" :class="{ 'slide-active': true }">
                    <div class="alert-grid gap-4">
                      <!-- 使用新的顯示邏輯：前兩個固定為嚴重等級，後兩個輪播其他等級 -->
                      <div
                        v-for="(alert, index) in getCurrentDisplayAlerts()"
                        :key="`alert-${alert.id}-${index}`"
                        class="alert-item"
                        :class="getAlertLevelClass(alert.level)"
                      >
                        <i :class="alert.icon + ' me-2'"></i>
                        <h5>{{ alert.message }}</h5>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <div class="carousel-indicators">
                    <div
                      v-for="page in getTotalAlertPages()"
                      :key="page"
                      class="indicator"
                      :class="{ active: getCurrentAlertPage() === page - 1 }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";

export default {
  name: "App",
  setup() {
    const port = "MK";
    const origin = port === "MK" ? "馬公" : "布袋";
    const destination = port === "MK" ? "布袋" : "馬公";
    const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
    const isToday = ref(true)
    const dayLabel = computed(() => (isToday.value ? '今日' : '明日'))
    const schedules_api = ref([]);
    const weatherData_api = ref([]);
    const currentTime = ref("");
    const currentDate = ref("");
    const currentDateMD = ref("");
    const currentWeekday = ref("");
    const shipModelRef = ref(null);
    let shipScene = null;
    let shipRenderer = null;

    // 背景圖片輪播相關
    const backgroundImages = ref([
      '/images/bg-1.jpg',
      '/images/bg-2.jpg',
      '/images/bg-3.jpg'
    ]);

    const currentBackgroundIndex = ref(0);

    const nextBackground = () => {
      currentBackgroundIndex.value = 
        (currentBackgroundIndex.value + 1) % backgroundImages.value.length;
    };

    // 貼心提醒輪播數據 (按等級排序: 嚴重 -> 中度 -> 普通)
    const alerts = ref([
      // 嚴重等級：管制相關
      {
        id: 1,
        icon: "fas fa-pills fa-fw",
        message: "預計航程中風浪稍大，建議備妥暈船藥",
        level: "severe",
      },
      {
        id: 2,
        icon: "fas fa-wind fa-fw",
        message: "'可能停航' 請隨時注意現場廣播和看板",
        level: "severe",
      },
      // 中度等級
      {
        id: 3,
        icon: "fas fa-umbrella fa-fw",
        message: "請備妥雨具，小心甲板濕滑",
        level: "moderate",
      },
      {
        id: 4,
        icon: "fas fa-sun fa-fw",
        message: "注意防曬，多補充水分",
        level: "moderate",
      },
      // 普通等級
      {
        id: 5,
        icon: "fas fa-life-ring fa-fw",
        message: "請確實穿著救生衣以策安全",
        level: "normal",
      },
      {
        id: 6,
        icon: "fas fa-ship fa-fw",
        message: "目前浪高平穩，適合搭乘",
        level: "normal",
      },
    ]);

    // 輪播狀態
    const currentAlertIndex = ref(0);
    
    // 響應式裝置偵測
    const isMobile = ref(false);
    const isLargeScreen = ref(false);
    
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768;
    };
    
    const checkLargeScreen = () => {
      isLargeScreen.value = window.innerWidth >= 1920;
    };

    // 分離嚴重等級和其他等級的提醒
    const getSevereAlerts = () => {
      return alerts.value.filter(alert => alert.level === 'severe').slice(0, 2);
    };

    const getNonSevereAlerts = () => {
      return alerts.value.filter(alert => alert.level !== 'severe');
    };

    // 獲取當前要顯示的提醒（統一輪播邏輯：嚴重等級固定，其他等級輪播）
    const getCurrentDisplayAlerts = () => {
      const severeAlerts = getSevereAlerts();
      const nonSevereAlerts = getNonSevereAlerts();
      const result = [];
      
      // 統一邏輯：前兩格固定顯示嚴重等級（最多2個）
      if (severeAlerts.length >= 1) result.push(severeAlerts[0]);
      if (severeAlerts.length >= 2) result.push(severeAlerts[1]);
      
      // 後面格子輪播其他等級
      if (nonSevereAlerts.length > 0) {
        const startIndex = currentAlertIndex.value % nonSevereAlerts.length;
        const remainingSlots = 4 - result.length;
        
        for (let i = 0; i < remainingSlots && i < nonSevereAlerts.length; i++) {
          const index = (startIndex + i) % nonSevereAlerts.length;
          result.push(nonSevereAlerts[index]);
        }
      }
      
      return result;
    };

    // 當前顯示的天氣索引
    const currentWeatherIndex = ref(0);

    // 船班輪播相關
    const maxDisplaySchedules = 2; // 桌面版最多顯示 2 個航班
    const currentSchedulePage = ref(0);
    
    // 行動版航班輪播相關
    const currentMobileScheduleIndex = ref(0);
    const maxMobileDisplaySchedules = 1; // 行動版每次顯示 1 個航班

    // 效能監控
    const isLowPerformanceDevice = ref(false);
    const shouldReduceEffects = ref(false);

    // 3D Canvas 尺寸設定（統一管理）
    const CANVAS_WIDTH = 150;
    const CANVAS_HEIGHT = 150;

    const updateTime = () => {
      // 使用台灣時區 (UTC+8)
      const now = new Date();
      
      // 使用 toLocaleString 直接格式化為台灣時間
      const timeOptions = {
        timeZone: 'Asia/Taipei',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      const dateOptions = {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      
      const weekdayOptions = {
        timeZone: 'Asia/Taipei',
        weekday: 'long'
      };
      
      // 格式化時間
      currentTime.value = now.toLocaleString('zh-TW', timeOptions);
      
      // 格式化日期
      const dateStr = now.toLocaleString('zh-TW', dateOptions);
      currentDate.value = dateStr.replace(/\//g, '/'); // 確保格式一致
      
      // 格式化星期
      const weekdayStr = now.toLocaleString('zh-TW', weekdayOptions);
      currentWeekday.value = weekdayStr;
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

    // 根據提醒等級返回對應的樣式類別
    const getAlertLevelClass = (level) => {
      switch (level) {
        case "severe":
          return "alert-severe";
        case "moderate":
          return "alert-moderate";
        case "normal":
        default:
          return "alert-normal";
      }
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

    // 輪播自動切換功能（只輪播非嚴重等級的提醒）
    const nextAlert = () => {
      const nonSevereAlerts = getNonSevereAlerts();
      if (nonSevereAlerts.length > 0) {
        // 計算需要跳過的數量，確保後兩格都更新
        const jumpCount = Math.min(2, nonSevereAlerts.length);
        currentAlertIndex.value = 
          (currentAlertIndex.value + jumpCount) % nonSevereAlerts.length;
      }
    };

    // 計算貼心提醒總頁數（基於非嚴重等級的輪播）
    const getTotalAlertPages = () => {
      const nonSevereAlerts = getNonSevereAlerts();
      const severeAlerts = getSevereAlerts();
      const availableSlots = 4 - severeAlerts.length; // 可用於輪播的格數
      
      if (nonSevereAlerts.length === 0 || availableSlots <= 0) return 1;
      return Math.ceil(nonSevereAlerts.length / availableSlots);
    };

    // 獲取當前貼心提醒頁面索引（基於非嚴重等級的輪播）
    const getCurrentAlertPage = () => {
      const nonSevereAlerts = getNonSevereAlerts();
      const severeAlerts = getSevereAlerts();
      const availableSlots = 4 - severeAlerts.length;
      
      if (nonSevereAlerts.length === 0 || availableSlots <= 0) return 0;
      return Math.floor(currentAlertIndex.value / availableSlots);
    };

    // 天氣輪播自動切換功能
    const nextWeather = () => {
      currentWeatherIndex.value =
        (currentWeatherIndex.value + 1) % weatherData_api.value.length;
    };

    // 根據船班抵達時間同步天氣資訊
    const syncWeatherWithSchedule = () => {
      // 直接按照順序輪播天氣資訊
      currentWeatherIndex.value =
        (currentWeatherIndex.value + 1) % weatherData_api.value.length;
    };

    // 根據抵達時間獲取對應的天氣資料
    const getWeatherByTime = (arrivalTime) => {
      const weather = weatherData_api.value.find(
        (w) => w.arrivalTime === arrivalTime
      );
      return weather || { 
        temperature: "25~27", 
        rainChance: 70,
        weatherCode: "02",
        weatherDesc: "晴時多雲"
      };
    };

    // 獲取當前頁面要顯示的船班（桌面版）
    const getCurrentPageSchedules = () => {
      const startIndex = currentSchedulePage.value * maxDisplaySchedules;
      return schedules_api.value.slice(
        startIndex,
        startIndex + maxDisplaySchedules
      );
    };
    
    // 獲取當前要顯示的船班（行動版）
    const getCurrentMobileSchedules = () => {
      const list = Array.isArray(schedules_api.value) ? schedules_api.value : [];
      const len = list.length;
      if (!len) return [];
      const i = ((currentMobileScheduleIndex.value % len) + len) % len; // 正規化索引
      const item = list[i];
      return item ? [item] : [];
    };

    // 船班輪播控制（桌面版）
    const nextSchedulePage = () => {
      const totalPages = Math.ceil(
        schedules_api.value.length / maxDisplaySchedules
      );
      currentSchedulePage.value = (currentSchedulePage.value + 1) % totalPages;
    };
    
    // 行動版航班輪播控制
    const nextMobileSchedule = () => {
      currentMobileScheduleIndex.value = 
        (currentMobileScheduleIndex.value + 1) % schedules_api.value.length;
    };

    // 計算總頁數（桌面版）
    const getTotalSchedulePages = () => {
      return Math.ceil(schedules_api.value.length / maxDisplaySchedules);
    };
    
    // 計算行動版輪播總數
    const getTotalMobileSchedules = () => {
      return schedules_api.value.length;
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

    let fetching = false;
    let scheduleTimer = null;
    async function fetchScheduleApi() {
      if (fetching) return;
      fetching = true;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}?port=${port}&date=${date}`
        );
        const data = await res.json();

        const nowHHmm = new Date().toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Taipei',
          hour: '2-digit',
          minute: '2-digit'
        });

        const toHHmm = (t) => {
          const [h, m] = String(t ?? '').trim().split(':');
          return `${String(parseInt(h, 10) || 0).padStart(2, '0')}:${String(parseInt(m, 10) || 0).padStart(2, '0')}`;
        }

        isToday.value = true;
        const now = new Date();
        const dateMD = now.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', timeZone: 'Asia/Taipei' });
        currentDateMD.value = dateMD.replace(/\//g, '/');

        let weatherNow = data.weatherNow;
        let tempNow = data.tempNow;

        let items = (data.items ?? []).filter(it => toHHmm(it.depart) >= nowHHmm);

        if (items.length === 0) {
          const tz = 'Asia/Taipei';
          const tmr = new Date(`${date}T00:00:00+08:00`);
          tmr.setDate(tmr.getDate() + 1);
          const tomorrow = tmr.toLocaleDateString('en-CA', { timeZone: tz });

          const res2 = await fetch(
            `${import.meta.env.VITE_API_BASE}?port=${port}&date=${tomorrow}`
          );
          const data2 = await res2.json();
          items = data2.items ?? []
          isToday.value = false;
          const dateMD = new Date(tomorrow).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', timeZone: tz });
          currentDateMD.value = dateMD.replace(/\//g, '/');
        }

        schedules_api.value = items.map((item, i) => ({
          id: i + 1,
          departure: item.depart,
          shipName: item.ship,
          pier: item.pier,
          arrival: item.eta,
          windLevel: Number(item.wind),
          waveHeight: String(item.waveHeight ?? "N/A"),
          visibility: String(item.vis ?? "N/A"),
          comfort: item.comfort,
          status: item.status,
        }));

        const allConfortOk = schedules_api.value.every(s => s.comfort === '舒適');
        if (allConfortOk) {
          alerts.value = alerts.value.filter(a => a.id !== 1);
        }
        if (!allConfortOk) {
          alerts.value = alerts.value.filter(a => a.id !== 6);
        }

        const allStatusOk = schedules_api.value.every(s => s.status === '正常開航');
        if (allStatusOk) {
          alerts.value = alerts.value.filter(a => a.id !== 2);
        }

        const mapWeatherDescToCode = (desc) => {
          const m = { '晴':'01','晴時多雲':'02','多雲':'04','陰':'05','陣雨':'08','豪雨':'12','雷陣雨':'15' };
          return m[desc] ?? '02';
        };

        weatherData_api.value = items.map((item, i) => ({
          id: i + 1,
          arrivalTime: item.eta,
          temperature: String(item.temp ?? ''),
          rainChance: typeof item.rainpop === 'string'
            ? (parseInt(item.rainpop.replace('%',''), 10) || 0)
            : (Number.isFinite(item.rainpop) ? item.rainpop : 0),
          visibility: String(item.vis ?? 'N/A'),
          weatherCode: mapWeatherDescToCode(item.weather ?? ''),
          weatherDesc: item.weather ?? '',
          title: `${item.eta} 抵達時段`,
          weatherComfort: item.weatherComfort ?? '舒適',
        }));

        const allRainLow = weatherData_api.value.every(w => w.rainChance < 80);
        if (allRainLow) {
          alerts.value = alerts.value.filter(a => a.id !== 3);
        }

        const allTempLow = weatherData_api.value.every(t => Number(t.temperature) < 36);
        if (allTempLow) {
          alerts.value = alerts.value.filter(a => a.id !== 4);
        }

        const countAlerts = alerts.value.filter(i => [1, 2, 3, 4].includes(i.id)).length;
        if (countAlerts > 2) {
          alerts.value = alerts.value.filter(a => a.id !== 5);
        }

        const exists = alerts.value.some(a => a.id === 7);
        if (!exists && countAlerts <= 1) {
          // 新增 id=7
          alerts.value.push({
            id: 7,
            icon: "fas fa-cloud-sun fa-fw",
            message: `${origin}港目前天氣為${weatherNow}，溫度${tempNow}度`,
            level: "normal",
          });
        } else if (exists && countAlerts > 1) {
          // 刪除 id=7
          alerts.value = alerts.value.filter(a => a.id !== 7);
        }

        console.log("API 航班資料：", schedules_api.value);
        console.log("API 天氣資料：", weatherData_api.value);
        console.log("出發港口及天氣", port, weatherNow, tempNow);
      } catch (err) {
        console.error("載入 API 失敗：", err);
      } finally {
        fetching = false;
      }
    }

    function clearScheduleTimers() {
      if (scheduleCarouselInterval) { clearInterval(scheduleCarouselInterval); scheduleCarouselInterval = null; }
      if (mobileScheduleCarouselInterval) { clearInterval(mobileScheduleCarouselInterval); mobileScheduleCarouselInterval = null; }
    }

    function startScheduleTimers() {
      clearScheduleTimers();

      const len = schedules_api.value.length;

      const totalPages = Math.max(1, Math.ceil(len / maxDisplaySchedules));
      if (currentSchedulePage.value >= totalPages) currentSchedulePage.value = 0;
      if (currentMobileScheduleIndex.value >= len) currentMobileScheduleIndex.value = 0;

      if (len > maxDisplaySchedules) {
        scheduleCarouselInterval = setInterval(nextSchedulePage, 8000);
      }

      if (len > 1) {
        mobileScheduleCarouselInterval = setInterval(nextMobileSchedule, 5000);
      }
    }

    const handleAlertCarousel = () => {
      if (alerts.value.length > 4) {
        if (!carouselInterval) {
          carouselInterval = setInterval(nextAlert, 4000);
          console.log("🚀 啟動提醒輪播");
        }
      } else {
        if (carouselInterval) {
          clearInterval(carouselInterval);
          carouselInterval = null;
          console.log("🛑 停止提醒輪播");
        }
      }
    };

    let timeInterval;
    let carouselInterval = null;
    let weatherCarouselInterval;
    let scheduleCarouselInterval;
    let mobileScheduleCarouselInterval;
    let backgroundInterval;
    
    watch(
      () => schedules_api.value.length,
      () => { startScheduleTimers(); },
      { immediate: true }
    )

    watch(
      () => alerts.value.length,
      () => { handleAlertCarousel(); },
      { immediate: true }
    );

    onMounted(() => {
      
      fetchScheduleApi();
      scheduleTimer = setInterval(fetchScheduleApi, 60000);

      updateTime();
      // 改為每秒更新確保時間準確
      timeInterval = setInterval(updateTime, 1000);

      // 先進行效能檢測
      detectPerformance();
      
      // 初始化響應式偵測
      checkMobile();
      checkLargeScreen();
      
      // 添加響應式監聽器
      const handleResponsiveChange = () => {
        checkMobile();
        checkLargeScreen();
        handleResize();
      };
      window.addEventListener("resize", handleResponsiveChange);

      // 啟動背景圖片自動輪播（每30秒切換一次）
      backgroundInterval = setInterval(nextBackground, 30000);

      // 根據裝置效能決定是否載入 3D 船舶模型
      if (!isLowPerformanceDevice.value) {
        setTimeout(() => {
          initShipModel();
        }, 100);
      } else {
        // 低效能裝置顯示簡單的船舶圖片
        if (shipModelRef.value) {
          shipModelRef.value.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; border-radius: 8px;">
              <img src="/images/porta.png">
            </div>
          `;
        }
        console.log("使用簡化船舶圖示以提升效能");
      }

      // 啟動天氣輪播自動切換（每 5 秒切換一次）
      weatherCarouselInterval = setInterval(nextWeather, 5000);

      // 添加緊急狀態閃爍效果
      setInterval(() => {
        const urgentElements = document.querySelectorAll(".urgent");
        urgentElements.forEach((el) => {
          el.style.opacity = el.style.opacity === "0.7" ? "1" : "0.7";
        });
      }, 1000);

      handleAlertCarousel();
    });

    onUnmounted(() => {
      clearScheduleTimers();
      if (scheduleTimer) clearInterval(scheduleTimer);
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
      if (mobileScheduleCarouselInterval) {
        clearInterval(mobileScheduleCarouselInterval);
      }
      if (backgroundInterval) {
        clearInterval(backgroundInterval);
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
      currentDateMD,
      currentWeekday,
      schedules_api,
      alerts,
      currentAlertIndex,
      weatherData_api,
      currentWeatherIndex,
      isLowPerformanceDevice,
      shouldReduceEffects,
      isMobile,
      isLargeScreen,
      backgroundImages,
      currentBackgroundIndex,
      shipModelRef,
      getRowClass,
      getComfortClass,
      getStatusClass,
      getAlertLevelClass,
      getWeatherByTime,
      getCurrentPageSchedules,
      getTotalSchedulePages,
      currentSchedulePage,
      getCurrentMobileSchedules,
      getTotalMobileSchedules,
      currentMobileScheduleIndex,
      getTotalAlertPages,
      getCurrentAlertPage,
      getCurrentDisplayAlerts,
      getSevereAlerts,
      getNonSevereAlerts,
      isToday,
      dayLabel,
      origin,
      destination,
    };
  },
};
</script>


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
        <!-- 船班時刻表 -->
        <section class="col-span-2 ferry-schedule">
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

      <footer class="text-center px-[3vw] py-[2vh] min-h-[8vh] footer">
        <div class="footer-text">
          請隨時注意現場廣播與看板 | 風級7級已達管制標準
        </div>
      </footer>

      <div
        class="absolute bottom-[2vh] left-[3vw] text-6xl z-10 text-blue-300 mascot"
      >
        <i class="fas fa-ship"></i>
      </div>
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
    let vantaEffect = null;

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
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00
        });
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
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    });

    return {
      currentTime,
      schedules,
      vantaRef,
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
</style>

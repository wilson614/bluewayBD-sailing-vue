# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個為布袋港藍色公路氣象台設計的即時資訊顯示系統。應用程式支援多種裝置尺寸，從大型電視牆（16:9）到行動裝置，顯示船班時刻表、天氣狀況和航行舒適度指標。

## 開發指令

```bash
# 啟動開發伺服器（預設 port 3000）
npm run dev

# 建置正式版本
npm run build

# 預覽正式版本
npm run preview
```

## 核心架構

### 技術堆疊

- **Vue.js 3** 使用 Composition API
- **Tailwind CSS** 樣式框架，具備完整響應式設計
- **Vite** 建置工具
- **Three.js + FBX/GLTF Loaders** 3D 船舶模型渲染
- **Font Awesome 5** 圖標庫

### 應用程式結構

單頁 Vue 應用程式 (`src/App.vue`)，採用響應式設計：
- **大螢幕（1920px+）**：電視牆模式，固定 16:9 比例，隱藏滾動
- **中等螢幕（1024-1919px）**：桌機模式，表格式船班顯示
- **小螢幕（<1024px）**：行動版模式，卡片式船班顯示，垂直滾動

### 樣式系統架構

**統一樣式管理**：
- 所有樣式集中在 `src/style.css` 中管理
- 全域字體系統與響應式斷點統一定義
- App.vue 僅包含模板和邏輯，不含樣式定義

**響應式設計**：
- 5 個主要斷點：≥1920px, 1024-1919px, 768-1023px, 480-767px, <480px
- 使用 `rem` 單位和 root font-size 調整實現一致縮放
- 雙重佈局系統：桌面版表格 + 行動版卡片

### 背景系統

**輪播背景**：
- 自動輪播背景圖片 (`/public/images/bg-1.jpg`, `bg-2.jpg`, `bg-3.jpg`)
- 每 30 秒自動切換，具備淡入淡出效果
- 深色遮罩確保文字可讀性

**已移除 VANTA.js**：原動態波浪背景效果已替換為靜態輪播背景系統

### 輪播系統架構

**貼心提醒輪播**：
- 2x2 格子佈局，同時顯示 4 個提醒
- 等級分類：`severe`（嚴重）、`moderate`（中度）、`normal`（普通）
- 嚴重等級固定置頂顯示，其他等級輪播切換
- 每 4 秒自動切換內容

**船班輪播**：
- 最多同時顯示 2 個船班
- 超過 2 個船班時啟動自動輪播，每 8 秒切換
- 分頁指示器顯示當前頁面位置

### 3D 模型系統

**三階載入策略**：
1. 測試立方體（確認渲染功能）
2. GLB 格式模型載入（`/public/images/porta.glb`）
3. FBX 格式備案載入（`/public/images/porta.fbx`）

**效能優化**：
- 低效能裝置自動降級為船舶圖標
- 30 FPS 限制減少 GPU 負擔
- 自動縮放和置中算法

### 資料管理架構

**船班資料結構**：
```javascript
{
  id, departure, arrival, shipName, pier,
  windLevel, waveHeight, visibility,
  comfort, status  // 舒適度和開航狀態
}
```

**天氣資料同步**：
- 根據 `arrivalTime` 對應天氣預報
- 天氣圖標路徑：`/public/images/weather_icons/day/{weatherCode}.svg`
- 錯誤處理：圖標載入失敗時顯示 Font Awesome 替代圖標

### 字體和本地化

**繁體中文字體堆疊**：
1. Noto Sans TC（主要）
2. Microsoft JhengHei（Windows 備用）
3. PingFang TC（macOS 備用）
4. sans-serif（通用備用）

**響應式字體系統**：
- H1-H6 和 P 標籤統一在 `style.css` 中定義
- 使用 root font-size 配合 rem 單位實現比例縮放

## 關鍵開發注意事項

**Git 提交規範**：
- 要求提交時附上詳細的修改說明
- 提交訊息包含「主要修改內容」和「技術改進」

**3D 模型載入**：
- Three.js 相關檔案透過 script 標籤載入而非 ES6 匯入
- 透過 `window.THREE` 全域物件存取
- GLTFLoader 和 FBXLoader 需要載入順序控制

**響應式偵測**：
- `isMobile` 和 `isLargeScreen` 響應式變數控制佈局切換
- 視窗大小變化監聽器自動調整顯示模式
- 行動版使用垂直堆疊，桌面版使用 2x2 網格

**效能考量**：
- 裝置效能檢測自動降級 3D 功能
- 背景圖片在行動裝置使用 `scroll` attachment
- 輪播動畫使用 CSS transitions 而非 JavaScript 動畫

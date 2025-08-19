# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 在此儲存庫中工作時的指導文件。

## 專案概述

這是一個為布袋港藍色公路氣象台設計的 16:9 電視牆顯示系統。應用程式以全螢幕格式顯示即時船班時刻表、天氣狀況和航行舒適度指標，專為大型顯示器優化。

## 開發指令

```bash
# 啟動開發伺服器
npm run dev

# 建置正式版本
npm run build

# 預覽正式版本
npm run preview
```

## 系統架構

### 技術堆疊
- **Vue.js 3** 使用 Composition API
- **Tailwind CSS** 樣式框架，具備客製化 16:9 響應式設計
- **Vite** 建置工具
- **VANTA.js + Three.js** 動態波浪背景效果
- **Font Awesome 5** 圖標庫

### 主要組件架構

應用程式為單頁 Vue 組件 (`src/App.vue`)，包含三個主要區塊：
1. **頁首**：標題和即時時鐘
2. **主要內容**：船班時刻表（左側 2/3）+ 天氣資訊側邊欄（右側 1/3）
3. **頁尾**：狀態訊息和導航資訊

### 背景效果實作

VANTA.js 使用 script 標籤載入於 `index.html` 而非 ES6 匯入：
- Three.js：`/src/JS/three.r134.min.js`
- VANTA.js：`/src/JS/vanta.waves.min.js`
- 透過全域 `window.THREE` 和 `window.VANTA` 物件存取

### 樣式架構

- **液態玻璃效果**：所有卡片使用 `backdrop-filter: blur()` 搭配漸層背景
- **間距系統**：版面配置使用 Tailwind 的 `gap` 工具類別而非個別 margin
- **視窗單位**：所有間距使用 `vh/vw` 單位以確保在各尺寸顯示器上的一致縮放
- **16:9 寬高比**：容器強制使用 `aspect-ratio: 16/9` 適配電視顯示器

### 資料管理

船班時刻表資料由 `schedules` ref 陣列管理，包含以下屬性：
- 班次資訊：`departure`、`arrival`、`shipName`、`pier`
- 天氣資料：`windLevel`、`waveHeight`、`visibility`
- 狀態指標：`comfort`（搖晃程度）、`status`（開航狀態）

動態 CSS 類別透過計算方法套用：
- `getRowClass()`：根據舒適度等級設定列背景色彩
- `getComfortClass()`：舒適度指標樣式
- `getStatusClass()`：營運狀態樣式

### 客製化字體配置

Tailwind 已配置繁體中文字體：
- 主要字體：Microsoft JhengHei
- 備用字體：PingFang TC、Noto Sans TC

## 重要注意事項

- VANTA.js 波浪背景需要在 Vue 初始化前先透過 script 標籤載入 THREE.js 和 VANTA.js
- 所有樣式使用視窗單位 (vh/vw) 和 gap 間距系統以確保電視顯示器的一致縮放
- 時間每分鐘透過 `setInterval` 更新
- 緊急狀態項目使用 CSS 動畫實現閃爍警告效果
- 應用程式專為橫向 16:9 顯示器設計，在行動裝置上可能無法正確顯示
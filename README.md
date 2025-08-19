# 布袋港藍色公路氣象台電視牆顯示系統

基於您的 PDF 規格開發的 16:9 電視牆顯示界面，使用 Vue.js 和 Tailwind CSS 構建。

## 功能特色

- ✅ 16:9 電視牆專用比例設計
- ✅ **動態波浪背景效果**（使用 Vanta.js + Three.js）
- ✅ 船班資訊即時顯示（出發時間、船名、碼頭、抵達時間）
- ✅ 海氣象預報展示（風力、浪高、溫度、能見度）
- ✅ 航行舒適度指示器（正常、些微搖晃、搖晃、大力搖晃）
- ✅ 開航狀態指示（開航、可能停航）
- ✅ 貼心提醒區域
- ✅ 毛玻璃效果 (backdrop-filter)
- ✅ 響應式設計適配大螢幕
- ✅ Font Awesome 5 圖標整合

## 安裝與運行

```bash
# 安裝依賴
npm install

# 開發模式運行
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 技術棧

- **Vue.js 3** - 前端框架
- **Tailwind CSS** - CSS 框架
- **Vite** - 建置工具
- **VANTA.js** - 動態波浪背景效果
- **Three.js** - 3D 圖形引擎
- **Font Awesome 5** - 圖標庫

## 推薦免費圖標資源

以下是一些優質的免費圖標庫供您使用：

1. **Heroicons** (https://heroicons.com/)
   - MIT 授權，完全免費
   - SVG 格式，完美配合 Tailwind CSS
   - 已在專案中使用部分圖標

2. **Tabler Icons** (https://tabler-icons.io/)
   - MIT 授權，3000+ 圖標
   - 設計風格一致

3. **Lucide** (https://lucide.dev/)
   - ISC 授權，美觀簡潔
   - React/Vue 組件支援

4. **Phosphor Icons** (https://phosphoricons.com/)
   - MIT 授權，6000+ 圖標
   - 多種粗細變化

5. **Feather Icons** (https://feathericons.com/)
   - MIT 授權，輕量化設計

## 專案結構

```
src/
├── App.vue          # 主應用組件
├── main.js          # 應用入口
└── style.css        # 全域樣式
```

## 自定義說明

- 修改 `schedules` 資料來更新船班資訊
- 調整 `weatherInfo` 資料來更新天氣預報
- 在 `getComfortClass()` 和 `getStatusClass()` 方法中自定義顏色主題
- 時間會自動更新顯示
- **波浪背景配置**：VANTA.js 波浪效果配置參數：
  - `mouseControls` - 滑鼠控制開關
  - `touchControls` - 觸控控制開關
  - `gyroControls` - 陀螺儀控制開關
  - `minHeight`, `minWidth` - 最小尺寸設定
  - `scale`, `scaleMobile` - 縮放比例設定

## 瀏覽器建議

推薦使用現代瀏覽器以獲得最佳顯示效果：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
#!/bin/bash

# 建立天氣圖示下載腳本
# 下載中央氣象署天氣圖示 (day 資料夾)

# 建立圖示資料夾
mkdir -p weather_icons/day

# 基礎 URL
BASE_URL="https://www.cwa.gov.tw/V8/assets/img/weather_icons/weathers/svg_icon/day"

# 天氣圖示編號清單 (根據 WeatherIcon.js)
ICON_CODES=(
    "01" "02" "03" "04" "05" "06" "07" "08" "09" "10"
    "11" "12" "13" "14" "15" "16" "17" "18" "19" "20" 
    "21" "22" "23" "24" "25" "26" "27" "28" "29" "30"
    "31" "32" "33" "34" "35" "36" "37" "38" "39" "40"
    "41" "42"
)

echo "開始下載中央氣象署天氣圖示..."
echo "總共需要下載 ${#ICON_CODES[@]} 個圖示"

# 下載成功計數器
SUCCESS_COUNT=0
FAIL_COUNT=0

# 逐一下載圖示
for code in "${ICON_CODES[@]}"; do
    URL="${BASE_URL}/${code}.svg"
    OUTPUT_FILE="weather_icons/day/${code}.svg"
    
    echo "下載: ${code}.svg"
    
    # 使用 curl 下載，-s 靜默模式，-f 失敗時回傳錯誤，--create-dirs 建立目錄
    if curl -s -f --create-dirs -o "$OUTPUT_FILE" "$URL"; then
        echo "✅ 成功下載: ${code}.svg"
        ((SUCCESS_COUNT++))
    else
        echo "❌ 下載失敗: ${code}.svg"
        ((FAIL_COUNT++))
    fi
    
    # 避免對伺服器造成過大負擔，稍微延遲
    sleep 0.5
done

echo ""
echo "==============================================="
echo "下載完成統計:"
echo "成功: $SUCCESS_COUNT 個檔案"
echo "失敗: $FAIL_COUNT 個檔案"
echo "檔案儲存位置: ./weather_icons/day/"
echo "==============================================="

# 列出下載的檔案
echo ""
echo "已下載的檔案清單："
ls -la weather_icons/day/
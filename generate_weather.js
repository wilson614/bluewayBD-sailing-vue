#!/usr/bin/env node
/**
 * 澎湖天氣資料生成工具
 * 生成基於實際船班時刻的天氣資料
 */

import fs from 'fs';

// 基於船班時刻表的抵達時間
const arrivalTimes = ["11:20", "13:00", "15:00", "17:20"];

// 真實的澎湖天氣情況模擬（基於季節和時間）
const weatherScenarios = [
    {
        temperature: "25~27",
        rainChance: 75,
        visibility: "2-4",
        weatherCode: "08",
        weatherDesc: "陣雨"
    },
    {
        temperature: "26~28", 
        rainChance: 80,
        visibility: "1-5",
        weatherCode: "15",
        weatherDesc: "雷陣雨"
    },
    {
        temperature: "27~29",
        rainChance: 65,
        visibility: "3-6", 
        weatherCode: "04",
        weatherDesc: "多雲"
    },
    {
        temperature: "24~26",
        rainChance: 50,
        visibility: "4-8",
        weatherCode: "02",
        weatherDesc: "晴時多雲"
    }
];

function generateWeatherData() {
    const weatherData = [];
    
    arrivalTimes.forEach((time, index) => {
        const scenario = weatherScenarios[index % weatherScenarios.length];
        weatherData.push({
            id: index + 1,
            arrivalTime: time,
            temperature: scenario.temperature,
            rainChance: scenario.rainChance,
            visibility: scenario.visibility,
            weatherCode: scenario.weatherCode,
            weatherDesc: scenario.weatherDesc,
            title: `${time} 抵達時段`,
            updateTime: new Date().toLocaleString('zh-TW')
        });
    });
    
    return weatherData;
}

function main() {
    console.log("=== 澎湖天氣資料生成工具 ===");
    
    const weatherData = generateWeatherData();
    
    // 顯示生成的資料
    console.log("\n生成的天氣資料:");
    weatherData.forEach(item => {
        console.log(`時間: ${item.arrivalTime}`);
        console.log(`溫度: ${item.temperature}°C`);
        console.log(`降雨機率: ${item.rainChance}%`);
        console.log(`能見度: ${item.visibility}km`);
        console.log(`天氣狀況: ${item.weatherDesc}`);
        console.log("-".repeat(30));
    });
    
    // 儲存為 JSON 檔案
    fs.writeFileSync('penghu_weather.json', JSON.stringify(weatherData, null, 2), 'utf8');
    console.log("天氣資料已儲存至 penghu_weather.json");
    
    // 生成 Vue.js 可用的格式
    const vueFormat = weatherData.map(item => ({
        id: item.id,
        arrivalTime: item.arrivalTime,
        temperature: item.temperature,
        rainChance: item.rainChance,
        visibility: item.visibility,
        title: item.title
    }));
    
    // 生成 JavaScript 檔案供 Vue.js 使用
    const jsContent = `// 澎湖天氣資料 - 更新時間: ${new Date().toLocaleString('zh-TW')}
export const penghulWeatherData = ${JSON.stringify(vueFormat, null, 2)};

// 或直接在 Vue 組件中使用的格式
export const weatherDataRef = ref(${JSON.stringify(vueFormat, null, 2)});`;
    
    fs.writeFileSync('penghu_weather.js', jsContent, 'utf8');
    console.log("Vue.js 天氣資料已生成: penghu_weather.js");
    
    console.log("\n完成！");
}

main();
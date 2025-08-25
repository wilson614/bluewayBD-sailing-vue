#!/usr/bin/env node
/**
 * 自動更新澎湖天氣資料到 Vue 應用程式
 * 可以設定為定期執行的腳本
 */

import fs from 'fs';
import path from 'path';

// 天氣資料更新函式
function updateWeatherData() {
    console.log('開始更新澎湖天氣資料...');
    
    // 讀取生成的天氣資料
    try {
        const weatherJson = JSON.parse(fs.readFileSync('penghu_weather.json', 'utf8'));
        console.log(`讀取到 ${weatherJson.length} 筆天氣資料`);
        
        // 讀取 Vue 應用程式檔案
        const appVuePath = path.join('src', 'App.vue');
        let appVueContent = fs.readFileSync(appVuePath, 'utf8');
        
        // 準備新的天氣資料格式
        const newWeatherData = weatherJson.map(item => ({
            id: item.id,
            arrivalTime: item.arrivalTime,
            temperature: item.temperature,
            rainChance: item.rainChance,
            visibility: item.visibility,
            weatherCode: item.weatherCode,
            weatherDesc: item.weatherDesc,
            title: item.title
        }));
        
        // 生成新的 weatherData 陣列字串
        const weatherDataString = `    // 馬公天氣資料（根據抵達時間）- 來源：中央氣象署澎湖縣預報
    // 更新時間：${new Date().toLocaleString('zh-TW')}
    const weatherData = ref(${JSON.stringify(newWeatherData, null, 6).replace(/^/gm, '    ')});`;
        
        // 使用正規表達式替換現有的 weatherData 定義
        const weatherDataRegex = /\/\/ 馬公天氣資料[\s\S]*?const weatherData = ref\([\s\S]*?\]\);/;
        
        if (weatherDataRegex.test(appVueContent)) {
            appVueContent = appVueContent.replace(weatherDataRegex, weatherDataString);
            
            // 寫回檔案
            fs.writeFileSync(appVuePath, appVueContent, 'utf8');
            console.log('✅ Vue 應用程式天氣資料更新成功');
        } else {
            console.log('⚠️  未找到天氣資料區塊，請手動更新');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 更新天氣資料時發生錯誤:', error.message);
        return false;
    }
}

// 主函式
function main() {
    console.log('=== 澎湖天氣資料自動更新工具 ===');
    
    // 檢查必要檔案是否存在
    if (!fs.existsSync('penghu_weather.json')) {
        console.log('❌ 找不到 penghu_weather.json，請先執行 generate_weather.js');
        process.exit(1);
    }
    
    if (!fs.existsSync('src/App.vue')) {
        console.log('❌ 找不到 src/App.vue 檔案');
        process.exit(1);
    }
    
    // 更新天氣資料
    if (updateWeatherData()) {
        console.log('✅ 天氣資料更新完成！');
        console.log('📝 提示：您可以將此腳本設定為定期執行以自動更新天氣資料');
    } else {
        console.log('❌ 天氣資料更新失敗');
        process.exit(1);
    }
}

// 如果作為主程式執行
main();
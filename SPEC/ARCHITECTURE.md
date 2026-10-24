# 架構與檔案分層

## 目錄結構

```text
MonsterGarden/
├── index.html                       # 網頁入口，宣告載入順序
├── assets/
│   ├── monsters/                    # 使用者提供的原始 PNG / AVIF
│   └── styles/
│       └── app.css                  # 滿版版面與場所選單
├── SPEC/                            # 技術規格與維護文件
└── src/
    ├── main.js                      # 模組組裝、動畫生命週期與事件
    ├── config/
    │   ├── monsters.js              # 怪物圖片清單
    │   └── scenes.js                # 場景參數
    ├── assets/
    │   ├── resource-loader.js       # HTTP 快取重新驗證與清單腳本更新
    │   └── image-loader.js          # 圖片解碼、透明裁切及失敗處理
    ├── creatures/
    │   └── simulation.js            # 移動、待機、目標與雪地腳印
    ├── scenes/
    │   └── scene-renderer.js        # 場景地形、植被與環境特效
    ├── rendering/
    │   ├── creature-renderer.js     # 單張圖片的變形與繪製
    │   └── world-renderer.js        # Canvas 尺寸、繪製順序與畫面合成
    └── ui/
        └── scene-selector.js        # 原生下拉選單與無障礙標籤
```

每個檔案用 IIFE 隔離內部實作，僅透過 `window.MonsterGarden` 提供必要介面。使用依序執行的傳統 `defer` 腳本，避免 ES module 在 `file://` 下的來源限制。模擬不依賴 DOM，圖片載入不處理 UI，繪製不修改角色狀態。

支援高像素密度畫面、自動適應視窗、分頁隱藏時停止繪製。系統偏好減少動態時顯示靜態生態箱，仍可切換場所。

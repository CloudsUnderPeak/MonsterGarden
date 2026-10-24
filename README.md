# Monster Garden

滿版的小怪物生態箱。使用專案內的 PNG / AVIF，透過伸縮、搖擺、翻轉和彈跳表現活動。畫面只保留右上角的場所選單，提供微風草原、月光池畔與靜靜雪原。點擊地面可吸引怪物靠近。

線上網站：https://cloudsunderpeak.github.io/MonsterGarden/

沒有內建示範怪物，也不會在圖片失敗時產生替代角色。

## 開啟與部署

直接雙擊根目錄的 `index.html`，或將專案部署至 GitHub Pages 等靜態網站服務。不需後端、套件安裝或建置。

GitHub Pages 使用分支部署，來源資料夾選擇 `/(root)`。請保留 `.nojekyll`，並一起部署 `assets/` 與 `src/`。所有資源使用相對路徑，支援專案子路徑。

此儲存庫已啟用 Pages，發布來源為 `main` 的根目錄。設定位置：[Settings → Pages](https://github.com/CloudsUnderPeak/MonsterGarden/settings/pages)，Source 為 **Deploy from a branch**，Branch 為 **main / (root)**。之後推送到 `main` 就會自動更新網站。

### 日後更新

1. 修改程式或圖片；若新增、移除、改名圖片，同步更新 `src/config/monsters.js`。
2. 雙擊 `index.html` 檢查本機畫面。
3. 在專案資料夾執行：

```bash
git add .
git commit -m "Update Monster Garden"
git push origin main
```

4. 到儲存庫的 [Actions](https://github.com/CloudsUnderPeak/MonsterGarden/actions) 查看 Pages 部署進度；完成後開啟線上網站。若仍看到舊版，可用 Ctrl+F5 強制重新整理。

## 怪物圖片

圖片放在 `assets/monsters/`；圖片清單集中於 `src/config/monsters.js`。目前已設定專案內的四張 AVIF。

新增、移除或重新命名圖片時，同步修改清單，例如：

```js
Garden.monsterPaths = Object.freeze([
  'assets/monsters/小怪物.png',
  'assets/monsters/森林/苔苔.avif',
]);
```

清單中的路徑相對於 `index.html`，區分大小寫，使用 `/` 分隔資料夾；中文與空白不需手動編碼。純靜態瀏覽器無法自行列出專案資料夾內容，因此需要這份清單。

建議使用透明背景、角色朝右的圖片。圖片維持比例，透明邊界會自動裁切，不修改原檔。AVIF 需要瀏覽器解碼支援。部分瀏覽器在 `file://` 下限制讀取像素時，會使用原始圖片邊界。全透明或無法解碼的圖片會跳過，畫面僅在載入異常或沒有圖片時顯示簡短提示。

## 檔案分層

```text
MonsterGarden/
├── index.html                       # 網頁入口，宣告載入順序
├── .nojekyll                        # GitHub Pages 靜態檔案設定
├── assets/
│   ├── monsters/                    # 使用者提供的原始 PNG / AVIF
│   └── styles/
│       └── app.css                  # 滿版版面與場所選單
└── src/
    ├── main.js                      # 模組組裝、動畫生命週期與事件
    ├── config/
    │   ├── monsters.js              # 怪物圖片清單
    │   └── scenes.js                # 場景參數
    ├── assets/
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

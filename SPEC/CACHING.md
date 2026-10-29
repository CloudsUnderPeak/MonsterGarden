# ETag 與資源重新驗證

## 範圍

HTTP / HTTPS 網站在每次載入時，重新驗證 `src/config/monsters.js` 和清單中的怪物圖片。資源 URL 保持固定，不加入時間戳記，也不清空瀏覽器快取。

ETag 由主機提供。`src/assets/resource-loader.js` 使用 `fetch(url, { cache: 'no-cache' })`，要求瀏覽器以 HTTP 快取中的 ETag / Last-Modified 進行條件請求：

- 內容未變更：伺服器可回傳 `304 Not Modified`，瀏覽器合併既有快取，供程式使用。
- 內容已變更：伺服器回傳新版內容，瀏覽器更新快取。
- 沒有快取：正常下載並建立快取。

`no-cache` 表示使用前先驗證，不代表禁用快取。JavaScript 不自行保存 ETag，也不直接處理沒有內容的 304 回應。

## 載入順序

1. 入口頁面先載入傳統 JavaScript 圖片清單，維持本機相容性。
2. 線上模式重新驗證清單腳本，透過暫時的 Blob URL 執行回應內容，使本次載入使用最新清單。
3. 圖片載入器重新驗證每張圖片，將回應內容透過 Blob URL 解碼、裁掉透明邊界，再建立居民。
4. 載入完成或失敗時清理 Blob URL 與計時器。請求和解碼設有逾時，單張圖片失敗不會阻止其他圖片顯示。

網站仍是純靜態，不需後端或 Service Worker。主機和 CDN 的快取策略仍可能影響更新傳遞時間；前端不能設定主機的 ETag 或保證來源內容立即到達所有節點。

## 本機模式與限制

以 `file://` 開啟時，不發出 HTTP 請求，也不使用 ETag，直接載入既有清單與本機圖片。

ETag 只驗證已知資源，不會探索新檔名。新增、移除或改名圖片時，仍須同步更新檔名清單；代理依 `AGENTS.md` 檢查並維護。

右上角的重新整理按鈕從已載入圖庫重新抽選最多 10 隻怪物並分布位置，不重新下載圖片；重新整理整個網頁才重新驗證清單和圖片。

參考：[MDN Request.cache](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)、[MDN ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag)。

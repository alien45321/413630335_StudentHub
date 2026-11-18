# 413630335_StudentHub

在原本的網頁程式設計專案中新增 StudentHub 學生資料 API。

## 啟動

使用 Node.js 24 以上版本，在專案根目錄執行：

```sh
npm start
```

API 預設位於 `http://localhost:8877`。SQLite 資料庫會在第一次啟動時建立於 `data/students.sqlite`，關閉伺服器後已新增的資料仍會保留。

若 8877 已被使用，可在 PowerShell 執行 `$env:PORT = '8878'; npm start`，然後將 Postman 的兩個請求改用相同的連接埠。

| 方法 | 路徑 | 功能 |
| --- | --- | --- |
| POST | `/api/v1/user/insertOne` | 新增一筆學生資料，回傳新增的學生 |
| GET | `/api/v1/user/findAll` | 依 `sid` 順序列出所有學生 |

## Postman 測試

1. 匯入 [StudentHub.postman_collection.json](StudentHub.postman_collection.json)。
2. 執行 `insertOne`，確認 HTTP 200 並檢查回傳的 `sid`。範例每次執行會使用不同的測試帳號。
3. 執行 `findAll`，確認 HTTP 200，並在回傳陣列中找到剛新增的測試學生。

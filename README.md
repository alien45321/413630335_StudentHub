# 413630335 StudentHub

依據課程的 [115_StudentHub 範例](https://github.com/yyyxi18/115_StudentHub) 製作。學生清單使用 React，API 使用 Express、TypeScript 和 MongoDB。

| 路徑 | 用途 |
| --- | --- |
| `FrontEndExample/` | React 學生清單 |
| `BackEndExample/` | Express API、MongoDB 資料模型與測試資料 |
| `index.html`、`about.html` | 原有的網頁設計作業 |

## 本機啟動

安裝 Node.js 24 與 Docker Desktop。若電腦已有 MongoDB，可以直接設定連線並跳過 Docker 指令。

```powershell
docker run -d --name studenthub-413630335-mongo -p 127.0.0.1:27017:27017 -v studenthub-413630335-data:/data/db mongo:8
Copy-Item BackEndExample/.env.example BackEndExample/.env
npm --prefix FrontEndExample ci
npm --prefix FrontEndExample run build
npm --prefix BackEndExample ci
npm --prefix BackEndExample run build
npm --prefix BackEndExample run seed
npm start
```

在瀏覽器開啟 `http://127.0.0.1:8877/`。初始化會在空的學生清單中放入兩筆虛構學生資料。若使用已有帳號的 MongoDB，可在 `BackEndExample/.env` 設定 `DBUSER`、`DBPASSWORD` 及相應的 `DBAUTHSource`。

## Postman 測試

匯入 [StudentHub.postman_collection.json](StudentHub.postman_collection.json)。執行整個 Collection，或先送出 `insertOne` 再執行 `findAll`。如果更改 API 埠號，請一併調整 Postman 的 `baseUrl`。

| 方法 | 路徑 | 預期結果 |
| --- | --- | --- |
| POST | `/api/v1/user/insertOne` | HTTP 200，回傳新增的學生及系統分配的 `sid` |
| GET | `/api/v1/user/findAll` | HTTP 200，清單包含剛新增的學生 |

範例帳號符合老師規定的 `tku + 科系縮寫 + 四碼座號`。若選到已存在的座號，重新執行新增請求即可產生另一個座號。

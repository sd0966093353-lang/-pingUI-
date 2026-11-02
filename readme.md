# 🌐 IPv4 / ICMP Ping 協定分析與封包產生器

這是一個基於網頁的互動式視覺化工具，專為學習、分析與構建 **IPv4** 與 **ICMP (Ping)** 封包所設計。本工具提供封包標頭的即時動態連動計算（包含 RFC 791/1071 規範之 Checksum 演算法）、32 位元網格視覺化展示、動態負載產生以及終端機發送模擬。

## ✨ 核心功能特色

* **📊 32-Column 網格標頭視覺化**：
  * 完全符合 RFC 791 規範的 32 位元橫列排版。
  * 互動式欄位：點擊任何標頭格子，即可彈出檢視位元長度、十進位/十六進位/二進位數值與 RFC 規格詳細說明。

* **⚡ 欄位自動連動計算**：
  * **Total Length (總長度)**：依據 `20 (IP 標頭) + 8 (ICMP 標頭) + Data 長度` 自動即時累加計算。
  * **Header Checksum (標頭校驗和)**：當 TTL、來源/目的地 IP 或 Data 長度變動時，即時依據 RFC 791 進行 Ones' Complement Sum 反相累加計算。
  * **ICMP Checksum**：動態計算包含 ICMP 標頭與資料負載（Payload）的完整校驗和。

* **🎛️ 常用預設情境與進階自訂**：
  * 內建多種情境：Google DNS、Cloudflare DNS、Windows 預設 Ping、Linux 預設 Ping、TTL 超時測試（模擬 Traceroute）與最大未分段 MTU (1472B)。
  * 支援手動調整 TTL、封包識別碼 (Identification)、DF (Don't Fragment) 旗標、TOS/DSCP 以及負載長度。

* **💻 Ping 終端機模擬器與二進位匯出**：
  * 動態終端機 Console：模擬封包往返時間 (RTT)、序號累加以及 TTL 遞減逾時機制。
  * **Wireshark Hex Dump 匯出**：可一鍵複製原始十六進位封包數據，直接匯入 Wireshark (`File -> Import from Hex Dump`) 進行分析。
  * **程式碼自動生成**：提供 **Python (Raw Socket)** 與 **C 語言 (Winsock/POSIX)** 的底層發送實作程式碼。

## 🛠️ 專案檔案結構

```
.
├── index.html     # 視覺化封包計算器與分析儀主頁面 (單頁應用)
├── server.js      # (選用) Node.js 後端伺服器，用於支援原生 ICMP 封包發送
└── README.md      # 專案說明文件
```

## 🚀 快速開始

### 1. 網頁視覺化分析儀（純前端模式）

無需安裝額外環境，直接在瀏覽器中開啟 `index.html` 即可使用完整計算與模擬功能：

```bash
# 在 Windows 環境開啟
start index.html

# 在 macOS 環境開啟
open index.html
```

### 2. (選用) 本機真實 Ping 後端服務整合

如果您希望透過瀏覽器介面發送**真實的網際網路 ICMP 封包**：

1. 安裝 Node.js 依賴套件：
   ```bash
   npm install
   ```

2. 以**系統管理員 / 最高權限 (Administrator/root)** 執行伺服器（底層 RAW Socket 需高級權限）：
   ```bash
   # Windows (請以管理員身份開啟 CMD 或 PowerShell)
   node server.js
   ```

3. 開啟網頁後，系統會自動偵測 `http://localhost:3000` 並帶入您本機的真實網卡 IPv4 位址。

## 📚 本專案涵蓋之網路教學觀念

1. **IPv4 封包封裝機制**：理解各層 Header 結構、版本、服務類型與分段旗標 (DF/MF)。
2. **IP 分段與 MTU 限制**：觀察當 Payload 超過標準乙太網路 MTU (1500 位元組) 時對傳輸的影響。
3. **ICMP 協定運作**：Echo Request (Type 8, Code 0) 封包之控制欄位。
4. **Internet Checksum 演算法 (RFC 791 / RFC 1071)**：實作 16-bit 字累加、32-bit 進位折疊 (Carry Folding) 與取反相補數運算細節。

## 📜 授權條款

本專案採用 [MIT License](LICENSE) 開源授權。
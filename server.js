// server.js - 輕量原生 Node.js 真實 Ping 服務器 (無須安裝額外 npm 套件)
const http = require('http');
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// 1. 自動偵測本機實體網路介面 IPv4 位址
function getLocalIpInfo() {
  const interfaces = os.networkInterfaces();
  const results = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      // 排除 IPv6 及 內部回傳地址 (127.0.0.1)
      if (addr.family === 'IPv4' && !addr.internal) {
        results.push({
          name: name,
          ip: addr.address,
          netmask: addr.netmask,
          mac: addr.mac
        });
      }
    }
  }

  // 優先挑選 Wi-Fi 或乙太網路 (Ethernet)
  let primary = results.find(r => /wi-fi|wlan|ethernet|區域連線|乙太網路/i.test(r.name));
  if (!primary && results.length > 0) {
    primary = results[0];
  }

  return {
    primaryIp: primary ? primary.ip : '127.0.0.1',
    primaryInterface: primary ? primary.name : 'Loopback',
    allInterfaces: results
  };
}

// 建立 HTTP 服務
const server = http.createServer((req, res) => {
  // 設定 CORS 標頭，允許直接由 file:// 或其他 port 存取
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);

  // API 1: 取得本機 IP 資訊
  if (reqUrl.pathname === '/api/my-ip') {
    const ipInfo = getLocalIpInfo();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(ipInfo));
    return;
  }

  // API 2: 執行真實作業系統 Ping (Windows ping.exe)
  if (reqUrl.pathname === '/api/ping') {
    const destIp = reqUrl.searchParams.get('ip') || '8.8.8.8';
    let dataLen = parseInt(reqUrl.searchParams.get('len'), 10);
    if (isNaN(dataLen) || dataLen < 0) dataLen = 32;
    if (dataLen > 65500) dataLen = 65500;

    let ttl = parseInt(reqUrl.searchParams.get('ttl'), 10);
    if (isNaN(ttl) || ttl < 1) ttl = 64;
    if (ttl > 255) ttl = 255;

    let count = parseInt(reqUrl.searchParams.get('n'), 10) || 1;

    // 安全驗證：僅允許合法 IPv4 位址或域名格式，防止命令注入
    const ipOrDomainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+$/;
    if (!ipOrDomainRegex.test(destIp)) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '無效的目標 IP 或主機名稱' }));
      return;
    }

    // Windows 平台使用 ping 指令:
    const isWindows = process.platform === 'win32';
    const pingCmd = isWindows
      ? `chcp 65001 > nul && ping "${destIp}" -l ${dataLen} -i ${ttl} -n ${count} -w 2000`
      : `ping -c ${count} -s ${dataLen} -t ${ttl} "${destIp}"`;

    console.log(`[真實 Ping 執行] 指令: ${pingCmd}`);

    exec(pingCmd, { encoding: 'utf8', timeout: 15000 }, (error, stdout, stderr) => {
      const lines = stdout.split(/\r?\n/).filter(line => line.trim().length > 0);
      let replyTime = null;
      let replyTtl = null;
      let isTimeout = false;
      let isTtlExpired = false;

      const timeMatch = stdout.match(/(?:時間|time)[=<]([\d\.]+)\s*ms/i);
      if (timeMatch) replyTime = parseFloat(timeMatch[1]);

      const ttlMatch = stdout.match(/TTL=(\d+)/i);
      if (ttlMatch) replyTtl = parseInt(ttlMatch[1], 10);

      if (/逾時|timed? out|無法連線|unreachable/i.test(stdout)) isTimeout = true;
      if (/過期|expired|TTL exceeded/i.test(stdout)) isTtlExpired = true;

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        destIp,
        dataLen,
        ttl,
        count,
        cmd: pingCmd,
        rawOutput: stdout,
        lines: lines,
        replyTime,
        replyTtl,
        isTimeout,
        isTtlExpired,
        exitCode: error ? error.code : 0
      }));
    });
    return;
  }

  // 靜態檔案服務：提供 index.html
  let filePath = path.join(__dirname, reqUrl.pathname === '/' ? 'index.html' : reqUrl.pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('檔案不存在');
      return;
    }

    let contentType = 'text/html; charset=utf-8';
    if (filePath.endsWith('.css')) contentType = 'text/css';
    if (filePath.endsWith('.js')) contentType = 'application/javascript';
    if (filePath.endsWith('.json')) contentType = 'application/json';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ipInfo = getLocalIpInfo();
  console.log('=====================================================');
  console.log(`📡 IPv4/ICMP 真實 Ping 伺服器已啟動！`);
  console.log(`🌐 本地網址: http://localhost:${PORT}`);
  console.log(`💻 偵測到本機 IPv4 位址: ${ipInfo.primaryIp} (網路介面: ${ipInfo.primaryInterface})`);
  console.log('=====================================================');
});


const express = require('express');
const path = require('path');
const app = express();

// 設置靜態文件目錄
app.use(express.static(path.join(__dirname, 'public')));

// 設定根路徑
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // 返回 index.html 頁面
});

// 設置端口，並啟動伺服器
const port = 8082;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

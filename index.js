const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid"); // UUID生成用
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let chatHistory = [];

io.on("connection", (socket) => {
  console.log("ユーザー接続");

  // 履歴送信
  socket.emit("chat history", chatHistory);

  // メッセージ受信
  socket.on("chat message", ({ text, userId }) => {
    const msg = { id: uuidv4(), text, userId };
    chatHistory.push(msg);
    io.emit("chat message", msg);
  });

  // メッセージ削除リクエスト
  socket.on("delete message", ({ id, userId }) => {
    const index = chatHistory.findIndex((msg) => msg.id === id);
    if (index !== -1 && chatHistory[index].userId === userId) {
      chatHistory.splice(index, 1);
      io.emit("message deleted", id);
    } else {
      console.log("❌ 削除拒否（他人のメッセージ）");
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ サーバー起動: http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

nextApp.prepare().then(() => {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  const players = new Map();

  function createPlayer() {
    return {
      x: Math.random() * (GAME_WIDTH - 40),
      y: Math.random() * (GAME_HEIGHT / 2),
      vx: 0,
      vy: 0,
      balloons: [true, true],
      score: 0
    };
  }

  function checkCollision(player1, player2) {
    const balloonRadius = 12;
    const playerWidth = 32;
    const playerHeight = 48;
    const sierraRadius = 20;
  
    const sierra1CenterX = player1.x + playerWidth / 2;
    const sierra1CenterY = player1.y + playerHeight + sierraRadius;
  
    for (let j = 0; j < player2.balloons.length; j++) {
      if (player2.balloons[j]) {
        const balloon2X = player2.x + (j === 0 ? -12 : 28) + balloonRadius;
        const balloon2Y = player2.y - 48 - balloonRadius;
  
        const dx = sierra1CenterX - balloon2X;
        const dy = sierra1CenterY - balloon2Y;
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        if (distance < sierraRadius + balloonRadius) {
          return { player2BalloonIndex: j };
        }
      }
    }
  
    return null;
  }

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    const playerId = socket.id;
    players.set(playerId, createPlayer());

    socket.emit('gameState', Array.from(players));
    io.emit('playerJoined', { id: playerId, ...players.get(playerId) });

    socket.on('move', (data) => {
      const player = players.get(playerId);
      if (player) {
        player.vx = data.vx;
        player.vy = data.vy;
        io.emit('playerMoved', { id: playerId, ...player });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
      players.delete(playerId);
      io.emit('playerLeft', playerId);
    });
  });

  setInterval(() => {
    const playersArray = Array.from(players.entries());
    for (let i = 0; i < playersArray.length; i++) {
      const [id, player] = playersArray[i];
      
      player.x += player.vx;
      player.y += player.vy;
      player.vy += 0.2; // Gravedad
      
      // Límites del juego
      player.x = Math.max(0, Math.min(GAME_WIDTH - 40, player.x));
      player.y = Math.max(0, Math.min(GAME_HEIGHT - 60, player.y));
  
      for (let j = 0; j < playersArray.length; j++) {
        if (i !== j) {
          const [otherId, otherPlayer] = playersArray[j];
          const collision = checkCollision(player, otherPlayer);
          if (collision) {
            const { player1BalloonIndex, player2BalloonIndex } = collision;
            otherPlayer.balloons[player2BalloonIndex] = false;
            player.score++;
            io.emit('balloonPopped', { id: otherId, balloonIndex: player2BalloonIndex });
            io.emit('scoreUpdated', { id: id, score: player.score });
            
            if (!otherPlayer.balloons.some(b => b)) {
              setTimeout(() => {
                const newPlayer = createPlayer();
                players.set(otherId, newPlayer);
                io.emit('playerReset', { id: otherId, ...newPlayer });
              }, 3000); // Espera 3 segundos antes de regenerar
            }
          }
        }
      }
  
      io.emit('playerMoved', { id, ...player });
    }
  }, 1000 / 60); // 60 FPS // 60 FPS

  app.all('*', (req, res) => nextHandler(req, res));

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
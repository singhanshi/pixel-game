const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");
const proposal = document.getElementById("proposal");

const TILE = 32;
const SIZE = 15;

let gameState = "play"; // play | meet | proposal
let stepsTaken = 0;
let doorUnlocked = false;

// 0 floor, 1 wall, 2 door, 3 table, 4 sofa
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,3,0,1,0,0,0,0,0,1,0,4,0,1],
  [1,0,0,0,0,0,0,2,0,0,0,0,0,0,1],
  [1,1,1,1,0,0,0,0,0,0,0,1,1,1,1],

  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

  [1,1,1,1,0,0,0,0,0,0,0,1,1,1,1],

  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// 🧍 Characters
const player1 = {
  x: 2, y: 2,
  skin: "#ffe0bd",
  hair: "#6d4c41",
  outfit: "#ff5c8a",
  name: "Anshii"
};

const player2 = {
  x: 12, y: 10,
  skin: "#ffe0bd",
  hair: "#222",
  outfit: "#5c9cff",
  name: "Madhav"
};

let heartPulse = 0;

// 🏷 Room name
function drawRoomName() {
  ctx.fillStyle = "#ff5c8a";
  ctx.font = "14px Courier New";
  ctx.textAlign = "center";
  const name = player1.y < 4 ? "Bedroom" : "Living Room";
  ctx.fillText(name, canvas.width / 2, 20);
}

// 💭 Thought bubble
function drawThoughtBubble() {
  if (gameState !== "play") return;

  const x = player2.x * TILE + TILE / 2;
  const y = player2.y * TILE - 28;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;

  // bubble
  ctx.beginPath();
  ctx.roundRect(x - 70, y - 24, 140, 30, 8);
  ctx.fill();
  ctx.stroke();

  // tail
  ctx.beginPath();
  ctx.arc(x - 6, y + 6, 3, 0, Math.PI * 2);
  ctx.arc(x - 2, y + 10, 2, 0, Math.PI * 2);
  ctx.fill();

  // text
  ctx.fillStyle = "#333";
  ctx.font = "10px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("I hope I see you soon", x, y - 4);
}

// 🎨 Draw map & furniture
function drawMap() {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      ctx.fillStyle = "#fff3c4";
      ctx.fillRect(x*TILE, y*TILE, TILE, TILE);

      const t = map[y][x];

      if (t === 1) {
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
      }

      if (t === 2) {
        ctx.fillStyle = doorUnlocked ? "#8ecae6" : "#a47148";
        ctx.fillRect(x*TILE+6, y*TILE+4, 20, 24);
      }

      if (t === 3) {
        ctx.fillStyle = "#cdb4db";
        ctx.fillRect(x*TILE+6, y*TILE+10, 20, 12);
      }

      if (t === 4) {
        ctx.fillStyle = "#b5ead7";
        ctx.fillRect(x*TILE+4, y*TILE+12, 24, 10);
        ctx.fillRect(x*TILE+6, y*TILE+8, 20, 6);
      }
    }
  }
}

// 🧍 Draw character
function drawPlayer(p) {
  const px = p.x * TILE;
  const py = p.y * TILE;

  ctx.fillStyle = p.hair;
  ctx.fillRect(px+10, py+4, 12, 6);

  ctx.fillStyle = p.skin;
  ctx.fillRect(px+10, py+10, 12, 12);

  ctx.fillStyle = p.outfit;
  ctx.fillRect(px+8, py+22, 16, 10);

  ctx.fillStyle = "#333";
  ctx.font = "10px Courier New";
  ctx.textAlign = "center";
  ctx.fillText(p.name, px + TILE/2, py - 2);
}

// 💗 Heart
function drawHeart() {
  if (gameState !== "meet") return;

  heartPulse += 0.1;
  const s = 10 + Math.sin(heartPulse) * 4;
  const x = player1.x * TILE + TILE/2;
  const y = player1.y * TILE - 10;

  ctx.fillStyle = "#ff3366";
  ctx.beginPath();
  ctx.arc(x - s/4, y, s/4, 0, Math.PI * 2);
  ctx.arc(x + s/4, y, s/4, 0, Math.PI * 2);
  ctx.lineTo(x, y + s/2);
  ctx.fill();
}

// 📱 Tap / Click
canvas.addEventListener("pointerdown", e => {
  if (gameState === "meet") {
    message.style.display = "none";
    proposal.style.display = "flex";
    gameState = "proposal";
    return;
  }

  const r = canvas.getBoundingClientRect();
  const tx = Math.floor((e.clientX - r.left) / TILE);
  const ty = Math.floor((e.clientY - r.top) / TILE);

  move(player1, tx, ty);
  move(player2, player1.x, player1.y);
});

function move(p, tx, ty) {
  const dx = tx - p.x;
  const dy = ty - p.y;
  if (Math.abs(dx) > Math.abs(dy)) tryMove(p, Math.sign(dx), 0);
  else tryMove(p, 0, Math.sign(dy));
}

function tryMove(p, dx, dy) {
  const nx = p.x + dx;
  const ny = p.y + dy;
  const t = map[ny][nx];

  if (t === 0 || (t === 2 && doorUnlocked)) {
    p.x = nx;
    p.y = ny;
    stepsTaken++;
    if (stepsTaken >= 6) doorUnlocked = true;
  }
}

// 💞 Meet check
function checkMeet() {
  if (player1.x === player2.x && player1.y === player2.y) {
    gameState = "meet";
    message.style.display = "block";
  }
}

// 🔄 Loop
function loop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawMap();
  drawRoomName();
  drawPlayer(player1);
  drawPlayer(player2);
  drawThoughtBubble(); // 💭 HERE
  checkMeet();
  drawHeart();
  requestAnimationFrame(loop);
}

loop();

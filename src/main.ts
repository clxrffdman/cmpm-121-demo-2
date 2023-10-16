import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Calex's game!";

document.title = gameName;

const header = document.createElement("h1");

const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
canvas.width = 256;
canvas.height = 256;

if (ctx) {
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, 256, 256);
}

header.innerHTML = gameName;
app.append(header);
app.append(canvas);

//drawing code from https://shoddy-paint.glitch.me/paint0.html

const cursor = { active: false, x: 0, y: 0 };

const paths = [];

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active && ctx) {
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", (e) => {
  cursor.active = false;
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  clearCanvas();
});

function clearCanvas() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, 256, 256);
  }
}

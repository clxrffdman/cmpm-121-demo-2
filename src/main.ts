import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Calex's game!";

document.title = gameName;

const changedevent = new Event("drawing-changed");

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

interface Point {
  x: number;
  y: number;
}

//starter code from https://shoddy-paint.glitch.me/paint1.html
const lines: Point[][] = [];
const redoLines: Point[][] = [];

let currentLine: Point[] = [];

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = [];
  lines.push(currentLine);
  redoLines.splice(0, redoLines.length);
  currentLine.push({ x: cursor.x, y: cursor.y });

  canvas.dispatchEvent(changedevent);
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    const newPt: Point = { x: cursor.x, y: cursor.y };
    currentLine.push(newPt);
    canvas.dispatchEvent(changedevent);
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (e) {
    cursor.active = false;
    currentLine = [];
    canvas.dispatchEvent(changedevent);
  }
});

canvas.addEventListener("drawing-changed", (e) => {
  if (e) {
    redraw();
  }
});

function redraw() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, 256, 256);
    for (const line of lines) {
      if (line.length > 1) {
        ctx.beginPath();
        const { x, y } = line[0];
        ctx.moveTo(x, y);
        for (const { x, y } of line) {
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }
}

document.body.append(document.createElement("br"));

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.splice(0, lines.length);
  canvas.dispatchEvent(changedevent);
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.append(undoButton);

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const latestLine: Point[] | undefined = lines.pop();
    if (latestLine) {
      redoLines.push(latestLine);
    }
    canvas.dispatchEvent(changedevent);
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoLines.length > 0) {
    const latestLine: Point[] | undefined = redoLines.pop();
    if (latestLine) {
      lines.push(latestLine);
    }
    canvas.dispatchEvent(changedevent);
  }
});

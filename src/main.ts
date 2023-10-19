import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "post-it";

document.title = gameName;

const bus = new EventTarget();
const canvasSize = 256;

function notify(name: string) {
  bus.dispatchEvent(new Event(name));
}

bus.addEventListener("drawing-changed", redraw);
bus.addEventListener("tool-moved", redraw);
bus.addEventListener("tool-changed", redraw);

const header = document.createElement("h1");

const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
const base = 0;
canvas.width = canvasSize;
canvas.height = canvasSize;

ctx.fillStyle = "#fca311";
ctx.fillRect(base, base, canvasSize, canvasSize);

let previewCmd: PointPreviewCommand | null = null;

//Brushes

const allBrushes: Brush[] = [
  { id: "thin", thickness: 1, text: "" },
  { id: "thick", thickness: 5, text: "" },
  { id: "🥕", thickness: 20, text: "🥕" },
  { id: "🦴", thickness: 20, text: "🦴" },
  { id: "🥔", thickness: 20, text: "🥔" },
];
const allBrushButtons: BrushButton[] = [];
let currentBrush: Brush = allBrushes[base];
let currentStyle = "black";

header.innerHTML = gameName;
app.append(header);
app.append(canvas);

interface Point {
  x: number;
  y: number;
}

interface Brush {
  id: string;
  thickness: number;
  text: string;
}

interface BrushButton {
  button: HTMLButtonElement;
  brush: Brush;
}

class PointPreviewCommand {
  point: Point;

  constructor(p: Point) {
    this.point = p;
  }

  display(ctx: CanvasRenderingContext2D) {
    if (currentBrush.text == "") {
      ctx.beginPath();
      const { x, y } = this.point;
      const tau = Math.PI + Math.PI;
      ctx.arc(x, y, currentBrush.thickness, base, tau, false);
      ctx.fillStyle = "#fca311";
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = currentStyle;
      ctx.stroke();
    } else {
      ctx.font = currentBrush.thickness + "px serif";
      ctx.strokeText(currentBrush.text, this.point?.x, this.point?.y);
    }
  }
}

class DrawCommand {
  constructor() {
    console.log("created dummy drawcmd!");
  }

  display(ctx: CanvasRenderingContext2D) {
    if (!ctx) {
      return;
    }
  }

  drag(p: Point) {
    if (!p) {
      return;
    }
  }
}

class LineCommand extends DrawCommand {
  points: Point[];
  brush: Brush | null = null;
  style = "black";

  constructor(p: Point, b: Brush = { id: "default", thickness: 4, text: "" }) {
    super();
    this.points = [p];
    this.brush = b;
    this.style = currentStyle;
  }

  display(ctx: CanvasRenderingContext2D) {
    if (!this.brush) {
      return;
    }
    ctx.strokeStyle = this.style;
    ctx.lineWidth = this.brush.thickness;
    ctx.beginPath();
    const { x, y } = this.points[base];
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  drag(p: Point) {
    this.points.push(p);
  }
}

class StickerCommand extends DrawCommand {
  point: Point | null = null;
  brush: Brush | null = null;
  style = "black";

  constructor(p: Point, b: Brush = { id: "default", thickness: 4, text: "" }) {
    super();
    this.point = p;
    this.brush = b;
    this.style = currentStyle;
  }

  display(ctx: CanvasRenderingContext2D) {
    if (!this.brush || !this.point) {
      return;
    }
    ctx.font = this.brush.thickness + "px serif";
    ctx.strokeStyle = this.style;
    ctx.strokeText(this.brush.text, this.point?.x, this.point?.y);
  }
  drag(p: Point) {
    this.point = p;
  }
}

//starter code from https://shoddy-paint.glitch.me/paint1.html + starter code from https://shoddy-paint.glitch.me/paint2.html

const lines: DrawCommand[] = [];
const redoLines: DrawCommand[] = [];
let currentLine: DrawCommand | null = null;
const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("mouseout", () => {
  previewCmd = null;
  notify("tool-moved");
});

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  if (currentBrush.text == "") {
    currentLine = new LineCommand({ x: cursor.x, y: cursor.y }, currentBrush);
  } else {
    currentLine = new StickerCommand(
      { x: cursor.x, y: cursor.y },
      currentBrush
    );
  }
  lines.push(currentLine);
  redoLines.splice(base, redoLines.length);
  currentLine.drag({ x: cursor.x, y: cursor.y });

  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active && currentLine) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    const newPt: Point = { x: cursor.x, y: cursor.y };
    currentLine.drag(newPt);
    previewCmd = null;
    notify("drawing-changed");
  } else {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    const newPt: Point = { x: cursor.x, y: cursor.y };
    previewCmd = new PointPreviewCommand(newPt);
    notify("tool-moved");
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
  notify("drawing-changed");
});

function redraw() {
  ctx.clearRect(base, base, canvas.width, canvas.height);
  ctx.fillRect(base, base, canvasSize, canvasSize);
  for (const line of lines) {
    line.display(ctx);
  }
  previewCmd?.display(ctx);
}

//Brush Buttons

const brushButtonContainer = document.createElement("div");
document.body.appendChild(brushButtonContainer);
brushButtonContainer.style.marginBottom = "5px";

allBrushes.forEach((element) => {
  addBrushButton(element);
});

function addBrushButton(b: Brush) {
  const newBrushButton: HTMLButtonElement = document.createElement("button");
  newBrushButton.innerHTML = b.id;
  newBrushButton.style.marginRight = "5px";
  const brushButton: BrushButton = { button: newBrushButton, brush: b };
  newBrushButton.addEventListener("click", () => swapBrush(b));
  brushButtonContainer.appendChild(newBrushButton);
  allBrushButtons.push(brushButton);
}

function swapBrush(b: Brush) {
  currentBrush = b;
}

//Utility Buttons

const utilityButtonContainer = document.createElement("div");
utilityButtonContainer.style.marginBottom = "10px";
const utilityButtons: HTMLButtonElement[] = [];
document.body.appendChild(utilityButtonContainer);

addUtilityButton("clear", clear);
addUtilityButton("undo", undo);
addUtilityButton("redo", redo);
addUtilityButton("custom", createCustomButton);
addUtilityButton("export", exportCanvas);

function addUtilityButton(name: string, fn: () => void) {
  const utilButton = document.createElement("button");
  utilButton.innerHTML = name;
  utilButton.addEventListener("click", () => {
    fn();
  });
  utilityButtons.push(utilButton);
}

utilityButtons.forEach((element) => {
  utilityButtonContainer.appendChild(element);
  element.style.marginRight = "5px";
});

function undo() {
  if (lines.length > base) {
    const latestLine: DrawCommand | undefined = lines.pop();
    if (latestLine) {
      redoLines.push(latestLine);
    }
    notify("drawing-changed");
  }
}

function redo() {
  if (redoLines.length > base) {
    const latestLine: DrawCommand | undefined = redoLines.pop();
    if (latestLine) {
      lines.push(latestLine);
    }
    notify("drawing-changed");
  }
}

function clear() {
  lines.splice(base, lines.length);
  notify("drawing-changed");
}

function createCustomButton() {
  const text = prompt("Custom sticker text:", "🧽")!;
  const newBrush: Brush = {
    id: text,
    thickness: 20,
    text: text,
  };
  allBrushes.push(newBrush);
  addBrushButton(newBrush);
}

function exportCanvas() {
  const tempCanvas: HTMLCanvasElement = document.createElement("canvas");
  const canvasMultiplier = 4;
  const tempCanvasSize = canvasMultiplier * canvasSize;
  tempCanvas.width = tempCanvasSize;
  tempCanvas.height = tempCanvasSize;
  const tempCtx: CanvasRenderingContext2D = tempCanvas.getContext("2d")!;

  tempCtx.scale(canvasMultiplier, canvasMultiplier);
  tempCtx.fillStyle = "#fca311";
  tempCtx.clearRect(base, base, tempCanvas.width, tempCanvas.height);
  tempCtx.fillRect(base, base, canvasSize, canvasSize);
  for (const line of lines) {
    line.display(tempCtx);
  }
  previewCmd?.display(tempCtx);

  const anchor = document.createElement("a");
  anchor.href = tempCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
}

const inputContainer = document.createElement("div");
document.body.appendChild(inputContainer);

const colorPicker = document.createElement("input");
colorPicker.style.marginRight = "20px";
colorPicker.setAttribute("type", "color");
inputContainer.appendChild(colorPicker);

colorPicker.addEventListener("input", (event) => {
  const selectedColor = (event.target as HTMLInputElement).value;
  currentStyle = selectedColor;
});

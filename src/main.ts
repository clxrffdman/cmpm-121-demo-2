import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Calex's game!";

document.title = gameName;

const bus = new EventTarget();

function notify(name: string) {
  bus.dispatchEvent(new Event(name));
}

bus.addEventListener("drawing-changed", redraw);
bus.addEventListener("tool-moved", redraw);
bus.addEventListener("tool-changed", redraw);

const header = document.createElement("h1");

const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
canvas.width = 256;
canvas.height = 256;

ctx.fillStyle = "green";
ctx.fillRect(0, 0, 256, 256);

let previewCmd: PointPreviewCommand | null = null;

//Brushes
const allBrushes: Brush[] = [
  { id: "thin", thickness: 1, style: "black", text: "" },
  { id: "thick", thickness: 5, style: "black", text: "" },
  { id: "🥕", thickness: 20, style: "black", text: "🥕" },
  { id: "🦴", thickness: 20, style: "black", text: "🦴" },
  { id: "🥔", thickness: 20, style: "black", text: "🥔" },
];
const allBrushButtons: BrushButton[] = [];
let currentBrush: Brush = allBrushes[0];

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
  style: string;
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
      ctx.arc(x, y, currentBrush.thickness, 0, 2 * Math.PI, false);
      ctx.fillStyle = "green";
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = currentBrush.style;
      ctx.stroke();
    } else {
      ctx.font = currentBrush.thickness + "px serif";
      ctx.strokeText(currentBrush.text, this.point?.x, this.point?.y);
    }
  }
}

class DrawCommand {
  constructor() {}

  display(ctx: CanvasRenderingContext2D) {
    if (!ctx) {
      return;
    }
  }

  drag(p: Point) {
    if (!p) {
      return;
    }
    console.log("yo");
  }
}

class LineCommand extends DrawCommand {
  points: Point[];
  brush: Brush | null = null;

  constructor(
    p: Point,
    b: Brush = { id: "default", thickness: 4, style: "black", text: "" }
  ) {
    super();
    this.points = [p];
    this.brush = b;
  }

  display(ctx: CanvasRenderingContext2D) {
    if (!this.brush) {
      return;
    }
    ctx.strokeStyle = this.brush.style;
    ctx.lineWidth = this.brush.thickness;
    ctx.beginPath();
    const { x, y } = this.points[0];
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

  constructor(
    p: Point,
    b: Brush = { id: "default", thickness: 4, style: "black", text: "" }
  ) {
    super();
    this.point = p;
    this.brush = b;
  }

  display(ctx: CanvasRenderingContext2D) {
    if (!this.brush || !this.point) {
      return;
    }
    ctx.font = this.brush.thickness + "px serif";
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
  redoLines.splice(0, redoLines.length);
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

canvas.addEventListener("mouseup", (e) => {
  if (e) {
    cursor.active = false;
    currentLine = null;
    notify("drawing-changed");
  }
});

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, 256, 256);
  for (const line of lines) {
    line.display(ctx);
  }
  previewCmd?.display(ctx);
}

document.body.append(document.createElement("br"));

allBrushes.forEach((element) => {
  addBrushButton(element);
});

function addBrushButton(b: Brush) {
  const newBrushButton: HTMLButtonElement = document.createElement("button");
  newBrushButton.innerHTML = b.id;
  const brushButton: BrushButton = { button: newBrushButton, brush: b };
  newBrushButton.addEventListener("click", () => swapBrush(b));
  document.body.append(newBrushButton);
  allBrushButtons.push(brushButton);
}

function swapBrush(b: Brush) {
  currentBrush = b;
}

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.splice(0, lines.length);
  notify("drawing-changed");
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.append(undoButton);

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const latestLine: DrawCommand | undefined = lines.pop();
    if (latestLine) {
      redoLines.push(latestLine);
    }
    notify("drawing-changed");
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoLines.length > 0) {
    const latestLine: DrawCommand | undefined = redoLines.pop();
    if (latestLine) {
      lines.push(latestLine);
    }
    notify("drawing-changed");
  }
});

import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Calex's game";

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

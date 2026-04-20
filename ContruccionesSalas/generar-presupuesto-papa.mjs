import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lines = [
  { text: "Detalle del Trabajo", font: "F2", size: 18, gapAfter: 10 },
  { text: "Circuito de luz interior", font: "F1", size: 12 },
  { text: "Circuito de luz exterior", font: "F1", size: 12 },
  { text: "Circuito de baños", font: "F1", size: 12 },
  { text: "Circuito de enchufes", font: "F1", size: 12 },
  { text: "Tablero eléctrico 10 puestos", font: "F1", size: 12 },
  { text: "9 luces (aprox)", font: "F1", size: 12 },
  { text: "5 enchufes (aprox)", font: "F1", size: 12, gapAfter: 16 },
  { text: "Materiales (Estimados)", font: "F2", size: 18, gapAfter: 10 },
  { text: "25 cajas metálicas", font: "F1", size: 12 },
  { text: "100 salidas de cajas metálicas", font: "F1", size: 12 },
  { text: "15 uniones", font: "F1", size: 12 },
  { text: "25 m de MT (25 mm)", font: "F1", size: 12 },
  { text: "15 curvas de MT 25 mm", font: "F1", size: 12 },
  { text: "100 abrazaderas", font: "F1", size: 12 },
  { text: "15 tiras MT (3 metros)", font: "F1", size: 12 },
  { text: "100 tarugos y tornillos 1 1/2", font: "F1", size: 12, gapAfter: 18 },
  { text: "TOTAL: $430.000", font: "F2", size: 16 },
];

const toHexWinAnsi = (value) =>
  Buffer.from(value, "latin1").toString("hex").toUpperCase();

const buildContentStream = () => {
  const marginLeft = 70;
  const startY = 780;
  let stream = "BT\n";
  stream += `1 0 0 1 ${marginLeft} ${startY} Tm\n`;

  for (const line of lines) {
    const { text, font, size, gapAfter } = line;
    stream += `/${font} ${size} Tf\n`;
    stream += `<${toHexWinAnsi(text)}> Tj\n`;
    const baseLeading = Math.max(18, size + 8);
    const extraGap = typeof gapAfter === "number" ? gapAfter : 0;
    stream += `0 ${-(baseLeading + extraGap)} Td\n`;
  }

  stream += "ET\n";
  return Buffer.from(stream, "ascii");
};

const buildPdf = () => {
  const header = Buffer.from("%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n", "binary");

  const stream = buildContentStream();

  const objects = [];
  const addObj = (objNumber, content) => {
    objects.push({
      objNumber,
      bytes: Buffer.from(`${objNumber} 0 obj\n${content}\nendobj\n`, "binary"),
    });
  };

  addObj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  addObj(
    3,
    [
      "<< /Type /Page",
      "/Parent 2 0 R",
      "/MediaBox [0 0 595 842]",
      "/Resources << /Font << /F1 4 0 R /F2 6 0 R >> >>",
      "/Contents 5 0 R",
      ">>",
    ].join(" ")
  );
  addObj(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  addObj(
    5,
    `<< /Length ${stream.length} >>\nstream\n${stream.toString("binary")}endstream`
  );
  addObj(
    6,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
  );

  const xrefObjCount = objects.length + 1;

  let offset = header.length;
  const offsets = new Map();

  for (const obj of objects) {
    offsets.set(obj.objNumber, offset);
    offset += obj.bytes.length;
  }

  const xrefOffset = offset;

  let xref = `xref\n0 ${xrefObjCount}\n0000000000 65535 f \n`;
  for (let i = 1; i < xrefObjCount; i += 1) {
    const objOffset = offsets.get(i);
    xref += `${String(objOffset).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${xrefObjCount} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const out = Buffer.concat([
    header,
    ...objects.map((o) => o.bytes),
    Buffer.from(xref, "binary"),
    Buffer.from(trailer, "binary"),
  ]);

  return out;
};

const outputPath = path.join(__dirname, "presupuesto-papa.pdf");
fs.writeFileSync(outputPath, buildPdf());
console.log(outputPath);

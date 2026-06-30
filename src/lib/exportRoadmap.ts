import { toPng } from "html-to-image";

function download(href: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  link.click();
}

export async function exportElementAsPng(el: HTMLElement, filename: string, backgroundColor = "#ffffff") {
  const dataUrl = await toPng(el, { pixelRatio: 3, backgroundColor });
  download(dataUrl, filename);
}

export async function exportElementAsPdf(el: HTMLElement, filename: string, backgroundColor = "#ffffff") {
  const { jsPDF } = await import("jspdf");
  const dataUrl = await toPng(el, { pixelRatio: 3, backgroundColor });
  const img = new Image();
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.src = dataUrl;
  });
  const orientation = img.width >= img.height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [img.width, img.height] });
  pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
  pdf.save(filename);
}

export function exportSvgElement(svg: SVGSVGElement, filename: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (!clone.getAttribute("style")?.includes("background")) {
    clone.style.background = "#ffffff";
  }
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(clone);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  download(url, filename);
  URL.revokeObjectURL(url);
}

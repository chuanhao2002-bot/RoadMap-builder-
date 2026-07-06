import { toPng } from "html-to-image";

export async function exportElementAsPptx(el: HTMLElement, filename: string, title: string, backgroundColor = "#ffffff") {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor });

  const img = new Image();
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.src = dataUrl;
  });

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "ROADMAP", width: 13.33, height: 7.5 });
  pptx.layout = "ROADMAP";

  const titleSlide = pptx.addSlide();
  titleSlide.addText(title, {
    x: 0.5,
    y: 3,
    w: 12.33,
    h: 1.5,
    fontSize: 32,
    bold: true,
    align: "center",
  });

  const slide = pptx.addSlide();
  const slideW = 13.33;
  const slideH = 7.5;
  const imgRatio = img.width / img.height;
  let w = slideW - 1;
  let h = w / imgRatio;
  if (h > slideH - 1) {
    h = slideH - 1;
    w = h * imgRatio;
  }
  slide.addImage({
    data: dataUrl,
    x: (slideW - w) / 2,
    y: (slideH - h) / 2,
    w,
    h,
  });

  await pptx.writeFile({ fileName: filename });
}

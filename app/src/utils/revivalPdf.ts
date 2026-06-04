import { type Exhibit } from "@/data/exhibits";
interface ExportRevivalPlanPdfOptions {
  element: HTMLElement;
  exhibit: Exhibit;
}

function sanitizeFileSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildFileName(exhibit: Exhibit) {
  const slug = sanitizeFileSegment(exhibit.slug || exhibit.name);
  return `museum-of-dead-dreams-revival-${slug || "plan"}.pdf`;
}

async function waitForDocumentPaint() {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
}

export async function exportRevivalPlanPdf({
  element,
  exhibit,
}: ExportRevivalPlanPdfOptions) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  await waitForDocumentPaint();

  const canvas = await html2canvas(element, {
    backgroundColor: "#090b12",
    scale: Math.max(2, Math.min(3, window.devicePixelRatio || 2)),
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
  });

  const pdf = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageData = canvas.toDataURL("image/png");
  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let heightLeft = imageHeight;
  let yOffset = 0;

  pdf.addImage(imageData, "PNG", 0, yOffset, imageWidth, imageHeight, undefined, "FAST");
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    yOffset = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, "PNG", 0, yOffset, imageWidth, imageHeight, undefined, "FAST");
    heightLeft -= pageHeight;
  }

  pdf.save(buildFileName(exhibit));
}

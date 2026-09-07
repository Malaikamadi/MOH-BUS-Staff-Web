"use client";

import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/app";
import { encodeQrPayload } from "@/lib/qr-payload";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image."));
    image.src = src;
  });
}

export function StaffQrCard({
  token,
  staffName,
  staffNumber,
}: {
  token: string;
  staffName: string;
  staffNumber: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const payload = encodeQrPayload(token);
  const slug = staffNumber.replace(/[^A-Za-z0-9-]/g, "") || "staff";

  function downloadSvg() {
    const svg = frameRef.current?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, `MOH-QR-${slug}.svg`);
  }

  async function downloadPng(kind: "qr" | "card") {
    const svg = frameRef.current?.querySelector("svg");
    if (!svg) return;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(clone.outerHTML)}`;
    const qrImage = await loadImage(svgUrl);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (kind === "qr") {
      canvas.width = 1024;
      canvas.height = 1024;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(qrImage, 64, 64, 896, 896);
      canvas.toBlob((blob) => blob && downloadBlob(blob, `MOH-QR-${slug}.png`), "image/png");
      return;
    }

    canvas.width = 1080;
    canvas.height = 1480;
    ctx.fillStyle = "#053364";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(48, 48, canvas.width - 96, canvas.height - 96);

    try {
      const seal = await loadImage("/moh-seal.png");
      ctx.drawImage(seal, 92, 88, 88, 88);
    } catch {
      /* seal is optional on the printed card */
    }

    ctx.fillStyle = "#0f172a";
    ctx.font = "600 36px system-ui, sans-serif";
    ctx.fillText(appConfig.ministry, 200, 128);
    ctx.fillStyle = "#64748b";
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Staff transport card", 200, 162);

    ctx.drawImage(qrImage, 190, 230, 700, 700);

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 40px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(staffName, canvas.width / 2, 1020);
    ctx.fillStyle = "#0d5391";
    ctx.font = "600 28px ui-monospace, monospace";
    ctx.fillText(staffNumber, canvas.width / 2, 1068);
    ctx.fillStyle = "#64748b";
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Present this code when boarding.", canvas.width / 2, 1124);
    ctx.fillText("Contains a secure token only — no identity data.", canvas.width / 2, 1160);
    ctx.textAlign = "start";

    canvas.toBlob((blob) => blob && downloadBlob(blob, `MOH-transport-card-${slug}.png`), "image/png");
  }

  return (
    <div className="flex flex-col items-center p-8">
      <div ref={frameRef} className="rounded-xl bg-white p-3">
        <QRCodeSVG value={payload} size={240} level="M" bgColor="#ffffff" fgColor="#0f172a" />
      </div>
      <p className="mt-4 max-w-[16rem] text-center font-mono text-[11px] leading-5 break-all text-foreground-muted">
        {payload}
      </p>
      <div className="mt-5 flex w-full flex-col gap-2">
        <Button onClick={() => void downloadPng("qr")} leadingIcon={<Download className="size-4" />}>
          Download QR (PNG)
        </Button>
        <Button variant="secondary" onClick={() => void downloadPng("card")}>
          Download transport card
        </Button>
        <Button variant="ghost" onClick={downloadSvg}>
          Download SVG
        </Button>
      </div>
    </div>
  );
}

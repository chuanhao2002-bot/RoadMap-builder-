"use client";

import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { exportElementAsPdf, exportElementAsPng, exportSvgElement } from "@/lib/exportRoadmap";

interface ExportMenuProps {
  containerRef: React.RefObject<HTMLElement | null>;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  filenameBase: string;
}

export function ExportMenu({ containerRef, svgRef, filenameBase }: ExportMenuProps) {
  const [open, setOpen] = useState(false);

  const run = async (action: () => void | Promise<void>) => {
    setOpen(false);
    await action();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1.5 text-sm font-medium"
      >
        <Download size={14} /> Export <ChevronDown size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 min-w-[140px] rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-1">
            <button
              onClick={() =>
                run(() => {
                  if (containerRef.current) return exportElementAsPng(containerRef.current, `${filenameBase}.png`);
                })
              }
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              PNG
            </button>
            {svgRef && (
              <button
                onClick={() =>
                  run(() => {
                    if (svgRef.current) exportSvgElement(svgRef.current, `${filenameBase}.svg`);
                  })
                }
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                SVG
              </button>
            )}
            <button
              onClick={() =>
                run(() => {
                  if (containerRef.current) return exportElementAsPdf(containerRef.current, `${filenameBase}.pdf`);
                })
              }
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

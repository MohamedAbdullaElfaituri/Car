"use client";

import { Download, MessageCircle, Printer } from "lucide-react";

export function InvoiceActions({ whatsappText }: { whatsappText: string }) {
  function downloadPdf() {
    window.print();
  }

  return (
    <div className="no-print mt-6 flex flex-wrap gap-2">
      <button onClick={() => window.print()} className="flex h-11 items-center gap-2 rounded-lg bg-brand-red px-4 font-bold text-white" type="button">
        <Printer className="h-5 w-5" />
        طباعة
      </button>
      <button onClick={downloadPdf} className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-4 font-bold" type="button">
        <Download className="h-5 w-5" />
        تحميل PDF
      </button>
      <a className="flex h-11 items-center gap-2 rounded-lg border border-emerald-200 px-4 font-bold text-emerald-700" href={`https://wa.me/?text=${whatsappText}`} target="_blank">
        <MessageCircle className="h-5 w-5" />
        واتساب
      </a>
    </div>
  );
}

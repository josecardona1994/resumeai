"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { generatePdf, generateDocx, downloadBlob } from "@/lib/api";
import { FileText, FileType, Loader2, CheckCircle } from "lucide-react";

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Dark header, two-column layout. Bold and professional.",
    preview: (
      <div className="w-full h-full bg-white rounded overflow-hidden border border-gray-100">
        <div className="h-5 w-full" style={{ background: "#2c2c2c" }} />
        <div className="flex gap-1 p-1.5 h-full">
          <div className="flex-1 flex flex-col gap-1">
            <div className="h-1 w-full bg-gray-200 rounded" />
            <div className="h-1 w-4/5 bg-gray-200 rounded" />
            <div className="h-1 w-full bg-gray-100 rounded mt-1" />
            <div className="h-1 w-full bg-gray-100 rounded" />
            <div className="h-1 w-3/4 bg-gray-100 rounded" />
          </div>
          <div className="w-10 flex flex-col gap-1" style={{ background: "#fafafa" }}>
            <div className="h-1 w-full bg-gray-200 rounded" />
            <div className="h-1 w-3/4 bg-gray-200 rounded" />
            <div className="h-1 w-full bg-gray-100 rounded mt-1" />
            <div className="h-1 w-full bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "modern",
    name: "Modern",
    description: "Navy blue sidebar with skills & contact. Clean and contemporary.",
    preview: (
      <div className="w-full h-full bg-white rounded overflow-hidden border border-gray-100 flex">
        <div className="w-10 h-full flex flex-col gap-1 p-1.5" style={{ background: "#1e3a5f" }}>
          <div className="h-1.5 w-full bg-blue-300 rounded opacity-60" />
          <div className="h-1 w-3/4 bg-blue-200 rounded opacity-40 mt-1" />
          <div className="h-1 w-full bg-blue-200 rounded opacity-40" />
          <div className="h-1 w-full bg-blue-200 rounded opacity-40" />
        </div>
        <div className="flex-1 flex flex-col gap-1 p-1.5">
          <div className="h-1 w-full bg-gray-200 rounded" />
          <div className="h-1 w-4/5 bg-gray-200 rounded" />
          <div className="h-1 w-full bg-gray-100 rounded mt-1" />
          <div className="h-1 w-full bg-gray-100 rounded" />
          <div className="h-1 w-3/4 bg-gray-100 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean single column, serif font. ATS-friendly and timeless.",
    preview: (
      <div className="w-full h-full bg-white rounded overflow-hidden border border-gray-100 p-1.5 flex flex-col gap-1">
        <div className="h-2 w-1/2 bg-gray-800 rounded" />
        <div className="h-0.5 w-full bg-gray-300 mt-0.5 mb-1" />
        <div className="h-1 w-full bg-gray-200 rounded" />
        <div className="h-1 w-4/5 bg-gray-200 rounded" />
        <div className="h-1 w-full bg-gray-100 rounded mt-1" />
        <div className="h-1 w-full bg-gray-100 rounded" />
        <div className="h-1 w-3/4 bg-gray-100 rounded" />
        <div className="h-0.5 w-full bg-gray-200 mt-1" />
        <div className="h-1 w-full bg-gray-100 rounded mt-0.5" />
        <div className="h-1 w-full bg-gray-100 rounded" />
      </div>
    ),
  },
];

export default function GeneratePage() {
  const { getToken } = useAuth();
  const [selected, setSelected] = useState("classic");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const [docxDone, setDocxDone] = useState(false);
  const [error, setError] = useState("");

  async function handlePdf() {
    setPdfLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) return;
      const blob = await generatePdf(token, selected);
      downloadBlob(blob, `resume_${selected}.pdf`);
      setPdfDone(true);
      setTimeout(() => setPdfDone(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleDocx() {
    setDocxLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) return;
      const blob = await generateDocx(token);
      downloadBlob(blob, "resume.docx");
      setDocxDone(true);
      setTimeout(() => setDocxDone(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDocxLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Generate Resume</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Choose a template, then download your resume. First generation takes ~15s while icons load.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Template selector */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Choose Template</h2>
        <div className="grid grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`text-left rounded-xl border-2 p-3 transition-all ${
                selected === t.id
                  ? "border-blue-500 shadow-md shadow-blue-100"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="h-24 mb-3">{t.preview}</div>
              <div className="font-semibold text-sm text-gray-900">{t.name}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-snug">{t.description}</div>
              {selected === t.id && (
                <div className="mt-2 text-xs font-semibold text-blue-500">Selected</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Download buttons */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-7 flex flex-col items-center gap-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <FileText size={30} className="text-red-500" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-1">PDF Resume</h3>
            <p className="text-sm text-gray-500">Pixel-perfect layout using the <span className="font-medium text-gray-700">{TEMPLATES.find(t => t.id === selected)?.name}</span> template.</p>
          </div>
          <button
            onClick={handlePdf}
            disabled={pdfLoading}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
              pdfDone ? "bg-green-500 text-white" : "bg-red-500 hover:bg-red-600 text-white"
            } disabled:opacity-60`}
          >
            {pdfLoading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> :
             pdfDone ? <><CheckCircle size={16} /> Downloaded!</> : "Download PDF"}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-7 flex flex-col items-center gap-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <FileType size={30} className="text-blue-500" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-1">Word DOCX</h3>
            <p className="text-sm text-gray-500">Editable Word document. Great for companies that require a DOCX upload.</p>
          </div>
          <button
            onClick={handleDocx}
            disabled={docxLoading}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
              docxDone ? "bg-green-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
            } disabled:opacity-60`}
          >
            {docxLoading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> :
             docxDone ? <><CheckCircle size={16} /> Downloaded!</> : "Download DOCX"}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Need to update your resume first?{" "}
        <a href="/dashboard/profile" className="text-blue-500 underline">Go to My Profile</a>
      </p>
    </div>
  );
}

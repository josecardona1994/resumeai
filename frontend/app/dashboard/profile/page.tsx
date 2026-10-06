"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { getProfile, saveProfile, importLinkedin, aiUpdate, uploadResume } from "@/lib/api";
import { Link2, Sparkles, Save, Plus, Trash2, Send, Loader2, Upload } from "lucide-react";

type Skill = { name: string; icon?: string; color?: string };
type Job = { company: string; title: string; period: string; bullets: string[] };
type Edu = { institution: string; degree: string; period: string };
type Project = { name: string; description: string; github?: string };
type Lang = { name: string; level: string };

type Profile = {
  personal: { name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string };
  profile_summary: string;
  experience: Job[];
  education: Edu[];
  skills: Skill[];
  languages: Lang[];
  certificates: string[];
  non_cert_skills: Skill[];
  projects: Project[];
};

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const cls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {multiline ? (
        <textarea className={cls} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-4 mt-8">
      {title}
    </h2>
  );
}

export default function ProfilePage() {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return;
      const data = await getProfile(token);
      setProfile(data);
    })();
  }, [getToken]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;
      await saveProfile(token, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await uploadResume(token, file);
      setProfile(res.profile);
      setAiHistory([{ role: "ai", text: "Resume parsed! Review your profile below and click Save to confirm." }]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (resumeFileRef.current) resumeFileRef.current.value = "";
    }
  }

  async function handleLinkedinImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await importLinkedin(token, file);
      setProfile(res.profile);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleAiSend() {
    if (!aiMsg.trim() || aiLoading) return;
    const msg = aiMsg.trim();
    setAiMsg("");
    setAiHistory((h) => [...h, { role: "user", text: msg }]);
    setAiLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await aiUpdate(token, msg);
      setProfile(res.profile);
      setAiHistory((h) => [...h, { role: "ai", text: "Done! Your profile has been updated. Save it to confirm." }]);
    } catch (err: any) {
      setAiHistory((h) => [...h, { role: "ai", text: `Error: ${err.message}` }]);
    } finally {
      setAiLoading(false);
    }
  }

  function upd(path: (string | number)[], val: any) {
    setProfile((prev: any) => {
      const next = { ...prev };
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) {
        cur[path[i]] = Array.isArray(cur[path[i]]) ? [...cur[path[i]]] : { ...cur[path[i]] };
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = val;
      return next;
    });
  }

  if (!profile) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-400">
        <Loader2 size={18} className="animate-spin" /> Loading profile...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => resumeFileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} className="text-purple-500" />}
            {uploading ? "Parsing..." : "Upload Resume"}
          </button>
          <input ref={resumeFileRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleResumeUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {importing ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} className="text-blue-600" />}
            {importing ? "Importing..." : "Import LinkedIn"}
          </button>
          <input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={handleLinkedinImport} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? "Saved!" : saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* AI Chat */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-gray-800">AI Update</span>
          <span className="text-xs text-gray-400 ml-1">— just tell Claude what changed</span>
        </div>
        {aiHistory.length > 0 && (
          <div className="flex flex-col gap-2 mb-3 max-h-36 overflow-y-auto">
            {aiHistory.map((m, i) => (
              <div key={i} className={`text-sm px-3 py-2 rounded-lg max-w-[85%] ${m.role === "user" ? "bg-blue-500 text-white self-end" : "bg-white text-gray-700 self-start border border-gray-100"}`}>
                {m.text}
              </div>
            ))}
            {aiLoading && (
              <div className="bg-white text-gray-400 text-sm px-3 py-2 rounded-lg self-start border border-gray-100 flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" /> Updating...
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder='e.g. "I got promoted to Senior Engineer at TELUS"'
            value={aiMsg}
            onChange={(e) => setAiMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiSend()}
          />
          <button
            onClick={handleAiSend}
            disabled={aiLoading || !aiMsg.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2 disabled:opacity-50 transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* Personal */}
      <SectionHeader title="Personal Information" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full name" value={profile.personal.name} onChange={(v) => upd(["personal", "name"], v)} />
        <Field label="Title / Role" value={profile.personal.title} onChange={(v) => upd(["personal", "title"], v)} />
        <Field label="Email" value={profile.personal.email} onChange={(v) => upd(["personal", "email"], v)} />
        <Field label="Phone" value={profile.personal.phone} onChange={(v) => upd(["personal", "phone"], v)} />
        <Field label="Location" value={profile.personal.location} onChange={(v) => upd(["personal", "location"], v)} />
        <Field label="LinkedIn URL" value={profile.personal.linkedin} onChange={(v) => upd(["personal", "linkedin"], v)} />
        <Field label="GitHub URL" value={profile.personal.github} onChange={(v) => upd(["personal", "github"], v)} />
      </div>
      <div className="mt-4">
        <Field label="Profile summary" value={profile.profile_summary} onChange={(v) => upd(["profile_summary"], v)} multiline />
      </div>

      {/* Experience */}
      <SectionHeader title="Work Experience" />
      {profile.experience.map((job, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 mb-4 relative">
          <button
            className="absolute top-4 right-4 text-gray-300 hover:text-red-400 transition-colors"
            onClick={() => upd(["experience"], profile.experience.filter((_, j) => j !== i))}
          >
            <Trash2 size={15} />
          </button>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <Field label="Company" value={job.company} onChange={(v) => upd(["experience", i, "company"], v)} />
            <Field label="Title" value={job.title} onChange={(v) => upd(["experience", i, "title"], v)} />
            <Field label="Period" value={job.period} onChange={(v) => upd(["experience", i, "period"], v)} />
          </div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bullets</label>
          {job.bullets.map((b, bi) => (
            <div key={bi} className="flex gap-2 mt-1">
              <input
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={b}
                onChange={(e) => {
                  const bullets = [...job.bullets];
                  bullets[bi] = e.target.value;
                  upd(["experience", i, "bullets"], bullets);
                }}
              />
              <button
                className="text-gray-300 hover:text-red-400"
                onClick={() => upd(["experience", i, "bullets"], job.bullets.filter((_, bj) => bj !== bi))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            className="mt-2 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
            onClick={() => upd(["experience", i, "bullets"], [...job.bullets, ""])}
          >
            <Plus size={12} /> Add bullet
          </button>
        </div>
      ))}
      <button
        className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
        onClick={() => upd(["experience"], [...profile.experience, { company: "", title: "", period: "", bullets: [] }])}
      >
        <Plus size={15} /> Add job
      </button>

      {/* Education */}
      <SectionHeader title="Education" />
      {profile.education.map((edu, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 mb-4 relative">
          <button
            className="absolute top-4 right-4 text-gray-300 hover:text-red-400 transition-colors"
            onClick={() => upd(["education"], profile.education.filter((_, j) => j !== i))}
          >
            <Trash2 size={15} />
          </button>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Institution" value={edu.institution} onChange={(v) => upd(["education", i, "institution"], v)} />
            <Field label="Degree" value={edu.degree} onChange={(v) => upd(["education", i, "degree"], v)} />
            <Field label="Period" value={edu.period} onChange={(v) => upd(["education", i, "period"], v)} />
          </div>
        </div>
      ))}
      <button
        className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
        onClick={() => upd(["education"], [...profile.education, { institution: "", degree: "", period: "" }])}
      >
        <Plus size={15} /> Add education
      </button>

      {/* Projects */}
      <SectionHeader title="Projects" />
      {profile.projects.map((proj, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 mb-4 relative">
          <button
            className="absolute top-4 right-4 text-gray-300 hover:text-red-400 transition-colors"
            onClick={() => upd(["projects"], profile.projects.filter((_, j) => j !== i))}
          >
            <Trash2 size={15} />
          </button>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <Field label="Project name" value={proj.name} onChange={(v) => upd(["projects", i, "name"], v)} />
            <Field label="GitHub URL" value={proj.github || ""} onChange={(v) => upd(["projects", i, "github"], v)} />
          </div>
          <Field label="Description" value={proj.description} onChange={(v) => upd(["projects", i, "description"], v)} multiline />
        </div>
      ))}
      <button
        className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
        onClick={() => upd(["projects"], [...profile.projects, { name: "", description: "", github: "" }])}
      >
        <Plus size={15} /> Add project
      </button>

      {/* Skills */}
      <SectionHeader title="Skills" />
      <div className="flex flex-wrap gap-2 mb-3">
        {profile.skills.map((skill, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <input
              className="w-24 text-sm focus:outline-none"
              value={skill.name}
              onChange={(e) => upd(["skills", i, "name"], e.target.value)}
              placeholder="Skill name"
            />
            <button className="text-gray-300 hover:text-red-400" onClick={() => upd(["skills"], profile.skills.filter((_, j) => j !== i))}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 border border-dashed border-blue-300 rounded-lg px-3 py-1.5"
          onClick={() => upd(["skills"], [...profile.skills, { name: "", icon: "", color: "2196f3" }])}
        >
          <Plus size={14} /> Add skill
        </button>
      </div>

      {/* Languages */}
      <SectionHeader title="Languages" />
      {profile.languages.map((lang, i) => (
        <div key={i} className="flex gap-3 items-center mb-2">
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-36"
            value={lang.name}
            onChange={(e) => upd(["languages", i, "name"], e.target.value)}
            placeholder="Language"
          />
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-36"
            value={lang.level}
            onChange={(e) => upd(["languages", i, "level"], e.target.value)}
            placeholder="Level (e.g. Fluent)"
          />
          <button className="text-gray-300 hover:text-red-400" onClick={() => upd(["languages"], profile.languages.filter((_, j) => j !== i))}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium mt-1"
        onClick={() => upd(["languages"], [...profile.languages, { name: "", level: "" }])}
      >
        <Plus size={15} /> Add language
      </button>

      {/* Certificates */}
      <SectionHeader title="Certificates" />
      {profile.certificates.map((cert, i) => (
        <div key={i} className="flex gap-2 items-center mb-2">
          <input
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={cert}
            onChange={(e) => {
              const certs = [...profile.certificates];
              certs[i] = e.target.value;
              upd(["certificates"], certs);
            }}
          />
          <button className="text-gray-300 hover:text-red-400" onClick={() => upd(["certificates"], profile.certificates.filter((_, j) => j !== i))}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium mt-1"
        onClick={() => upd(["certificates"], [...profile.certificates, ""])}
      >
        <Plus size={15} /> Add certificate
      </button>

      {/* Bottom save */}
      <div className="mt-10 pb-10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </div>
  );
}

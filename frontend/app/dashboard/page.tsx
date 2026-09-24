"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Download, User, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  const firstName = user?.firstName || "there";

  const cards = [
    {
      icon: <User size={24} className="text-blue-500" />,
      title: "Fill your profile",
      desc: "Add your experience, education, skills, and projects.",
      href: "/dashboard/profile",
      cta: "Edit profile",
    },
    {
      icon: <Download size={24} className="text-green-500" />,
      title: "Generate resume",
      desc: "Download a pixel-perfect PDF or DOCX in seconds.",
      href: "/dashboard/generate",
      cta: "Generate now",
    },
    {
      icon: <Sparkles size={24} className="text-purple-500" />,
      title: "AI update",
      desc: "Tell Claude what changed and your resume updates itself.",
      href: "/dashboard/profile",
      cta: "Open AI chat",
    },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {firstName}
        </h1>
        <p className="text-gray-500">What would you like to do today?</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
              {card.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
            </div>
            <Link
              href={card.href}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              {card.cta} <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

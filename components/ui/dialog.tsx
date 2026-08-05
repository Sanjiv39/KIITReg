"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  headerBg?: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, headerBg = "bg-slate-900", children }: DialogProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={cn("flex items-center justify-between px-6 py-4 border-b border-white/10", headerBg)}>
          <div className="flex items-center gap-2 text-lg font-bold text-white">{title}</div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

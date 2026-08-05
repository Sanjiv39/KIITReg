"use client";

import { useState } from "react";
import { MessageSquare, AlertCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export function WhatsAppModal({ isOpen, onClose, onShowToast }: WhatsAppModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    rollNumber: "",
    department: "",
    section: "",
    mobile: "",
    email: "",
    queryMessage: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // KIIT Email validation
    if (!formData.email.trim().toLowerCase().endsWith("@kiit.ac.in")) {
      setErrorMsg("Please use your official KIIT email ending with @kiit.ac.in ❌");
      return;
    }

    // Mobile validation
    const cleanMobile = formData.mobile.replace(/\D/g, "");
    if (cleanMobile.length < 10 || cleanMobile.length > 15) {
      setErrorMsg("Please enter a valid 10-15 digit mobile number ❌");
      return;
    }

    const message = `Hello K{devs} Team,

*Student Details:*
- Name: ${formData.fullName.trim()}
- Roll Number: ${formData.rollNumber.trim()}
- Department: ${formData.department}
- Section: ${formData.section.trim()}
- Mobile: ${formData.mobile.trim()}
- KIIT Email: ${formData.email.trim()}

*Query:*
${formData.queryMessage.trim()}`;

    const url = `https://wa.me/917366006363?text=${encodeURIComponent(message)}`;

    onClose();
    onShowToast("Redirecting to WhatsApp...");
    window.open(url, "_blank");
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-emerald-400">
          <MessageSquare className="w-5 h-5" /> WhatsApp Query Form
        </span>
      }
      headerBg="bg-slate-900 border-b border-emerald-500/20"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-400 mb-2">
          Fill this form and we&apos;ll redirect you to WhatsApp with your pre-filled query details.
        </p>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Full Name *</label>
            <Input
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Roll Number *</label>
            <Input
              name="rollNumber"
              required
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="e.g. 2305101"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Department *</label>
            <Select
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
            >
              <option value="" className="bg-slate-900 text-slate-400">Select Department</option>
              <option value="MCA" className="bg-slate-900">Master in Computer Application</option>
              <option value="BCA" className="bg-slate-900">Bachelor in Computer Application</option>
              <option value="Msc" className="bg-slate-900">Master in Computer Science</option>
              <option value="Bsc" className="bg-slate-900">Bachelor in Computer Science</option>
              <option value="Other" className="bg-slate-900">Other</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Section *</label>
            <Input
              name="section"
              required
              value={formData.section}
              onChange={handleChange}
              placeholder="e.g. MCA-1A"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">WhatsApp Number *</label>
            <Input
              type="tel"
              name="mobile"
              required
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Include country code (e.g. 917366006363)"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">KIIT Email ID *</label>
            <Input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="2570237@kiit.ac.in"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Query Message *</label>
          <Textarea
            name="queryMessage"
            required
            rows={3}
            value={formData.queryMessage}
            onChange={handleChange}
            placeholder="Describe your query in detail..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="whatsapp" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Continue to WhatsApp
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

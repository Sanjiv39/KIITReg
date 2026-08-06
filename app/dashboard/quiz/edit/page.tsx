"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  ArrowLeft,
  X,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  text: string;
  options: string[];
  correct_answer: number;
}

export default function AdminEditQuizPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form states
  const [formText, setFormText] = useState("");
  const [formOptions, setFormOptions] = useState(["", "", "", ""]);
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          
          // Verify user role
          const userRes = await fetch("/api/users/me", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.user?.role?.toUpperCase() === "ADMIN") {
              // Load all questions
              await fetchQuestions(idToken);
            } else {
              router.replace("/dashboard");
            }
          } else {
            router.replace("/dashboard");
          }
        } catch (err) {
          console.error("Authorization check failed:", err);
          router.replace("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchQuestions = async (token: string) => {
    try {
      const response = await fetch("/api/admin/quiz", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormText("");
    setFormOptions(["", "", "", ""]);
    setFormCorrectIndex(0);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormText(q.text);
    setFormOptions([...q.options]);
    setFormCorrectIndex(q.correct_answer);
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) return alert("Question text is required.");
    if (formOptions.some((o) => !o.trim())) return alert("All four options must be filled.");

    setIsSaving(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;

      const payload = {
        id: editingQuestion?.id,
        text: formText.trim(),
        options: formOptions.map((o) => o.trim()),
        correct_answer: formCorrectIndex,
      };

      const response = await fetch("/api/admin/quiz", {
        method: editingQuestion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchQuestions(idToken);
        setIsEditorOpen(false);
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to save question.");
      }
    } catch (err) {
      console.error("Failed to save question:", err);
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;

      const response = await fetch(`/api/admin/quiz?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        await fetchQuestions(idToken);
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to delete question.");
      }
    } catch (err) {
      console.error("Failed to delete question:", err);
      alert("An error occurred while deleting.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#00f2fe]/30 border-t-[#00f2fe] animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Verifying privileges & loading questions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/events"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
        <span className="text-xs font-semibold text-[#00f2fe] uppercase tracking-wider">
          Admin Mode
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Quiz Questions Manager</h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure the 10-question evaluation quiz database and options.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)]"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Question
        </Button>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 border border-white/10 rounded-2xl">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No questions found</h3>
            <p className="text-xs text-slate-400">Click the button above to add a new question.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row justify-between gap-4 md:items-start"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-extrabold text-[#00f2fe] shrink-0 mt-0.5">
                    Q{idx + 1}.
                  </span>
                  <h4 className="text-sm font-semibold text-white leading-relaxed truncate-3-lines">
                    {q.text}
                  </h4>
                </div>

                {/* Render options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correct_answer === oIdx;
                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          isCorrect
                            ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300 font-medium"
                            : "border-white/5 bg-white/5 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-4 h-4 rounded-full border text-[10px] flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? "border-emerald-400 bg-emerald-500 text-slate-950 font-bold"
                                : "border-slate-500 text-slate-500"
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-0.5 shrink-0 ml-2">
                            <CheckCircle2 className="w-3 h-3" /> Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 md:self-start md:mt-1 border-t border-white/5 pt-4 md:pt-0 md:border-0 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(q)}
                  className="px-3 text-xs border-white/10 hover:bg-white/5 text-slate-300 hover:text-white"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(q.id)}
                  className="px-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/40">
              <h3 className="font-bold text-white text-base">
                {editingQuestion ? "Edit Quiz Question" : "Add Quiz Question"}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Question Text</label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Enter the question text..."
                  rows={3}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe] resize-none"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 block mb-1">Answer Options</label>
                {formOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-slate-500 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...formOptions];
                        next[idx] = e.target.value;
                        setFormOptions(next);
                      }}
                      placeholder={`Enter Option ${String.fromCharCode(65 + idx)}`}
                      required
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe]"
                    />
                    <button
                      type="button"
                      onClick={() => setFormCorrectIndex(idx)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        formCorrectIndex === idx
                          ? "bg-emerald-500 text-slate-950 hover:bg-emerald-600"
                          : "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {formCorrectIndex === idx ? "Correct" : "Mark Correct"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-white/5 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)] px-5"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {isSaving ? "Saving..." : "Save Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

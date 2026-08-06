"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  HelpCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  text: string;
  options: string[];
  correct_answer?: number;
}

interface ResultData {
  id: string;
  score: number;
  completed_at: string;
}

export default function QuizPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    score: number;
    totalQuestions: number;
    passed: boolean;
  } | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchQuizData(firebaseUser);
      } else {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchQuizData = async (firebaseUser: any) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch("/api/quiz", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.completed) {
          setQuizCompleted(true);
          const totalQ = data.totalQuestions || 10;
          setScoreResult({
            score: data.result.score,
            totalQuestions: totalQ,
            passed: data.result.score >= Math.ceil(totalQ * 0.6),
          });
        } else {
          setQuestions(data.questions || []);
        }
      }
    } catch (err) {
      console.error("Failed to load quiz:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate that all questions are answered
    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      alert("Please answer all questions before submitting!");
      return;
    }

    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        const data = await response.json();
        setScoreResult({
          score: data.score,
          totalQuestions: data.totalQuestions,
          passed: data.passed,
        });
        setQuizCompleted(true);
      } else {
        const errData = await response.json();
        alert(errData.error || "Submission failed");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#00f2fe]/30 border-t-[#00f2fe] animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Loading quiz questions...</p>
      </div>
    );
  }

  // --- RENDERING STATE: COMPLETED ---
  if (quizCompleted && scoreResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/events"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-white/5 border border-white/10">
            {scoreResult.passed ? (
              <Trophy className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-white">Quiz Completed</h1>
            <p className="text-slate-400 text-sm mt-1.5">
              {scoreResult.passed
                ? "Congratulations! You have successfully passed the quiz."
                : "You did not meet the passing threshold (60%+)."}
            </p>
          </div>

          {/* Score Counter */}
          <div className="py-5 px-6 rounded-xl bg-white/5 border border-white/10 max-w-xs mx-auto">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Your Score</div>
            <div className="text-4xl font-extrabold text-white">
              <span className={scoreResult.passed ? "text-emerald-400" : "text-red-400"}>
                {scoreResult.score}
              </span>{" "}
              / {scoreResult.totalQuestions}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Passing requirement: {Math.ceil(scoreResult.totalQuestions * 0.6)} / {scoreResult.totalQuestions} questions
            </div>
          </div>

          {/* Certificate Download */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm max-w-md mx-auto space-y-3">
            <div className="flex items-center gap-2 justify-center font-bold">
              <Award className="w-5 h-5" />
              <span>Certificate Available!</span>
            </div>
            <p className="text-xs text-emerald-300/80">
              You can now download your digital certificate of completion.
            </p>
            <Button size="sm" variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6">
              Download Certificate (PDF)
            </Button>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="px-6 border-[#00f2fe]/20 text-[#00f2fe] hover:bg-[#00f2fe]/10">
              <Link href="/dashboard/results">Detailed Question Review</Link>
            </Button>
            <Button asChild variant="secondary" className="px-6">
              <Link href="/dashboard/events">Return to Events</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING STATE: ACTIVE QUIZ ---
  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? ((currentIdx + 1) / totalQuestions) * 100 : 0;

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900/60 border border-white/10 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No questions available</h2>
        <p className="text-slate-400 text-sm">Please contact support or try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/events"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quit Quiz
        </Link>
        <span className="text-xs font-semibold text-[#00f2fe] uppercase tracking-wider">
          Quiz Attempt
        </span>
      </div>

      {/* Main Quiz Wizard */}
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Question {currentIdx + 1} of {totalQuestions}</span>
            <span>{Math.round(progressPercent)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-[#00f2fe] shrink-0 mt-0.5" />
            <h2 className="text-lg font-bold text-white leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 gap-3 pt-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQuestion.id, idx)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-[#00f2fe]/10 border-[#00f2fe] text-white"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                        isSelected
                          ? "border-[#00f2fe] bg-[#00f2fe] text-slate-950 font-bold"
                          : "border-slate-500 text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentIdx === 0 || isSubmitting}
            className="gap-1 px-4"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          {currentIdx === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || answers[currentQuestion.id] === undefined}
              className="px-6 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)]"
            >
              {isSubmitting ? "Evaluating..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion.id] === undefined || isSubmitting}
              className="gap-1 px-4"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

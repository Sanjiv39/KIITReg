"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import {
  Bell,
  Shield,
  User,
  LogOut,
  Save,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Globe,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    events: true,
    announcements: false,
    newsletter: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setIsLoading(false);
        return;
      }
      setDisplayName(firebaseUser.displayName || "");
      setEmail(firebaseUser.email || "");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      if (displayName !== firebaseUser.displayName) {
        await updateProfile(firebaseUser, { displayName: displayName.trim() });
      }

      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveError("Failed to save settings. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#00f2fe]/30 border-t-[#00f2fe] animate-spin" />
          <p className="text-slate-400 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your account preferences and notifications
        </p>
      </div>

      {/* Save Messages */}
      {saveMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {saveMessage}
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {saveError}
        </div>
      )}

      {/* Profile Settings */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <User className="w-5 h-5 text-[#00f2fe]" />
          <h2 className="font-bold text-white">Profile Settings</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="max-w-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative max-w-md">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={email}
                disabled
                className="pl-10 opacity-60 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Email cannot be changed. Contact support for assistance.
            </p>
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#00f2fe]" />
          <h2 className="font-bold text-white">Notification Preferences</h2>
        </div>
        <div className="divide-y divide-white/5">
          {[
            {
              key: "email" as const,
              title: "Email Notifications",
              description: "Receive important updates via email",
              icon: Mail,
            },
            {
              key: "events" as const,
              title: "Event Reminders",
              description: "Get notified about upcoming events and deadlines",
              icon: Globe,
            },
            {
              key: "announcements" as const,
              title: "Announcements",
              description: "Receive club announcements and news",
              icon: Bell,
            },
            {
              key: "newsletter" as const,
              title: "Newsletter",
              description: "Monthly newsletter with tips and resources",
              icon: Smartphone,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications[item.key]
                      ? "bg-[#00f2fe]"
                      : "bg-slate-700"
                  }`}
                  aria-label={`Toggle ${item.title}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      notifications[item.key] ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#00f2fe]" />
          <h2 className="font-bold text-white">Security</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Account Security</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Your account is protected with Google authentication
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Secure
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Email Verification</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Your @kiit.ac.in email is verified
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl bg-red-500/5 border border-red-500/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-500/20 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h2 className="font-bold text-red-400">Danger Zone</h2>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Sign Out</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Sign out of your account on this device
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
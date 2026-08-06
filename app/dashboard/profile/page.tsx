"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { auth } from "@/lib/firebase/config";
import { format } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import {
  User,
  Mail,
  ShieldCheck,
  Clock,
  CalendarDays,
  BadgeCheck,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  lastLoginAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setIsLoading(false);
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        const response = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
          setDisplayName(data.user.displayName || "");
        } else {
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Member",
            photoURL: firebaseUser.photoURL || "",
            emailVerified: firebaseUser.emailVerified,
            role: "member",
            createdAt: "",
            lastLoginAt: "",
            updatedAt: "",
          });
          setDisplayName(firebaseUser.displayName || "");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      const idToken = await firebaseUser.getIdToken();
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setIsEditing(false);
        setSaveMessage("Profile updated successfully!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setSaveMessage("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#00f2fe]/30 border-t-[#00f2fe] animate-spin" />
          <p className="text-slate-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#00f2fe]/30 via-[#4facfe]/20 to-transparent relative">
          <div className="absolute inset-0 bg-[url('/Kdevs.png')] bg-cover bg-center opacity-10" />
        </div>

        <div className="px-6 sm:px-8 pb-8">
          {/* Avatar + Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 border-4 border-slate-900 shadow-xl">
                {userData?.photoURL ? (
                  <Image
                    src={userData.photoURL}
                    alt={userData.displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#00f2fe]">
                    {userData?.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {userData?.displayName}
                  </h2>
                  {userData?.emailVerified && (
                    <BadgeCheck className="w-5 h-5 text-[#00f2fe]" />
                  )}
                </div>
                <p className="text-sm text-slate-400">{userData?.email}</p>
              </div>
            </div>

            {!isEditing ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="mt-4 sm:mt-0"
              >
                <Pencil className="w-4 h-4" /> Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(userData?.displayName || "");
                  }}
                >
                  <X className="w-4 h-4" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !displayName.trim()}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              {saveMessage}
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <div className="mb-8 p-5 rounded-xl bg-white/5 border border-white/10">
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
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </div>
              <p className="text-sm font-medium text-white break-all">{userData?.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Role
              </div>
              <p className="text-sm font-medium text-white capitalize">{userData?.role || "Member"}</p>
            </div>
            {/* <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <BadgeCheck className="w-3.5 h-3.5" /> Verification Status
              </div>
              <p className={`text-sm font-medium ${userData?.emailVerified ? "text-emerald-400" : "text-amber-400"}`}>
                {userData?.emailVerified ? "Verified" : "Pending Verification"}
              </p>
            </div> */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <CalendarDays className="w-3.5 h-3.5" /> Member Since
              </div>
              <p className="text-sm font-medium text-white">{formatDate(userData?.createdAt || "")}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Clock className="w-3.5 h-3.5" /> Last Login
              </div>
              <p className="text-sm font-medium text-white">{userData?.lastLoginAt && !isNaN(new Date(userData.lastLoginAt).getTime()) ? format(new Date(userData.lastLoginAt), "PPP p") : "N/A"}</p>
            </div>
            {/* <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <User className="w-3.5 h-3.5" /> User ID
              </div>
              <p className="text-sm font-medium text-white font-mono text-xs truncate">{userData?.uid}</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
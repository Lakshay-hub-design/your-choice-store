"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Mail,
  Phone,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import useAuthStore from "@/store/authStore";
import { getCurrentUser, updateCustomerProfile } from "@/features/auth/services/authService";

import Avatar, { getInitials } from "@/components/account/Avatar";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [isLoading, setIsLoading] = useState(!user);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  // Load profile if Zustand does not contain the user.
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        if (isMounted && response.success) {
          setUser(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Unable to load your profile.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user, setUser]);

  // Populate form fields when user data becomes available.
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  // Create and clean up the local image preview URL.
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again later.
    event.target.value = "";

    if (!file) return;

    setError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must not exceed 5 MB.");
      return;
    }

    setSelectedFile(file);
    setRemoveAvatar(false);
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setRemoveAvatar(true);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelImageChange = () => {
    setSelectedFile(null);
    setRemoveAvatar(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError("Name must be between 2 and 50 characters.");
      return;
    }

    if (trimmedPhone && !/^[6-9]\d{9}$/.test(trimmedPhone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    const payload = {
      fullName: trimmedName,
      phone: trimmedPhone,
      ...(selectedFile && { avatar: selectedFile }),
      ...(removeAvatar && { removeAvatar: true }),
    };

    try {
      setIsSaving(true);

      const response = await updateCustomerProfile(payload);

      if (!response.success) {
        throw new Error(response.message || "Profile update failed.");
      }

      setUser(response.data);

      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to update your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarUrl = removeAvatar ? "" : previewUrl || user?.avatar?.url || "";

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#EDE9E6] bg-white p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="mt-6 h-12 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-12 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#FF5A5F]"
          >
            <ArrowLeft size={17} />
            Back to Account
          </Link>
        </div>

        <div className="rounded-2xl border border-[#EDE9E6] bg-white p-6 shadow-sm sm:p-8">
          <div className="border-b border-[#EDE9E6] pb-5">
            <h1 className="text-xl font-bold text-[#242424]">Edit Profile</h1>

            <p className="mt-2 text-sm text-[#6B7280]">Update your personal information.</p>
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col gap-4 border-b border-[#EDE9E6] py-6 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 shrink-0">
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt="Profile picture"
                  className="h-20 w-20 rounded-full border border-[#EDE9E6] object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#EDE9E6] bg-[#FFF0ED]">
                  <Avatar initials={getInitials(fullName)} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#242424]">{fullName || "Customer"}</p>

              <p className="mt-1 text-xs text-[#6B7280]">
                JPG, PNG or WEBP. Maximum file size: 5 MB.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isSaving}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#EDE9E6] px-3 py-2 text-xs font-semibold text-[#242424] transition hover:border-[#FF5A5F] hover:text-[#FF5A5F] disabled:opacity-50"
                >
                  <Camera size={15} />
                  {currentAvatarUrl ? "Change Photo" : "Upload Photo"}
                </button>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleCancelImageChange}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#242424]"
                  >
                    <X size={14} />
                    Cancel selection
                  </button>
                )}

                {!selectedFile && user?.avatar?.url && !removeAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-500 transition hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Remove Photo
                  </button>
                )}

                {removeAvatar && (
                  <button
                    type="button"
                    onClick={() => setRemoveAvatar(false)}
                    disabled={isSaving}
                    className="text-xs font-medium text-[#FF5A5F] hover:underline"
                  >
                    Undo removal
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 pt-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-[#242424]">
                Full Name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]"
                />

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  maxLength={50}
                  required
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#EDE9E6] bg-white py-3 pr-4 pl-11 text-sm text-[#242424] transition outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#242424]">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]"
                />

                <input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-[#EDE9E6] bg-[#F9F9F9] py-3 pr-4 pl-11 text-sm text-[#77716D]"
                />
              </div>

              <p className="mt-2 text-xs text-[#8B817D]">
                Email changes require a separate verification process.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#242424]">
                Mobile Number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]"
                />

                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  autoComplete="tel-national"
                  placeholder="Enter your 10-digit mobile number"
                  className="w-full rounded-xl border border-[#EDE9E6] bg-white py-3 pr-4 pl-11 text-sm text-[#242424] transition outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/10"
                />
              </div>

              <p className="mt-2 text-xs text-[#8B817D]">
                Leave empty if you want to remove your mobile number.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#EDE9E6] pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/account"
                className="rounded-xl border border-[#EDE9E6] px-6 py-3 text-center text-sm font-semibold text-[#6B7280] transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#F44850] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

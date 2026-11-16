"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

import useAuthStore from "@/store/authStore";
import { changeCustomerPassword } from "@/features/auth/services/authService";
import MobileAccountMenu from "@/components/account/MobileAccountMenu";

export default function PasswordManagerPage() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordLengthValid = newPassword.length >= 8 && newPassword.length <= 50;

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!passwordLengthValid) {
      setError("New password must be between 8 and 50 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("Your new password must be different from your current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await changeCustomerPassword({
        currentPassword,
        newPassword,
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to change password.");
      }

      // Backend has invalidated the refresh token.
      // Clear local authentication state as well.
      clearAuth();

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to change your password. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderPasswordField = ({
    id,
    label,
    value,
    onChange,
    visible,
    setVisible,
    placeholder,
    autoComplete,
  }) => (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#242424]">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={18}
          className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]"
        />

        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          className="w-full rounded-xl border border-[#EDE9E6] bg-white py-3 pr-12 pl-11 text-sm text-[#242424] transition outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/10"
        />

        <button
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-[#9CA3AF] transition hover:text-[#242424]"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <MobileAccountMenu />

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
          <div className="flex items-center gap-3 border-b border-[#EDE9E6] pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7C5CFC]/10 text-[#7C5CFC]">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#242424]">Password Manager</h1>

              <p className="mt-1 text-sm text-[#6B7280]">Manage your account security.</p>
            </div>
          </div>

          {success ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 size={34} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#242424]">
                Password Changed Successfully
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#6B7280]">
                Your password has been updated. Please log in again using your new password.
              </p>

              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="mt-6 rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#F44850]"
              >
                Continue to Login
              </button>
            </div>
          ) : (
            <>
              <div className="py-6">
                <h2 className="font-semibold text-[#242424]">Change Password</h2>

                <p className="mt-1 text-sm text-[#6B7280]">
                  Choose a new password to keep your account secure.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {renderPasswordField({
                  id: "currentPassword",
                  label: "Current Password",
                  value: currentPassword,
                  onChange: setCurrentPassword,
                  visible: showCurrentPassword,
                  setVisible: setShowCurrentPassword,
                  placeholder: "Enter your current password",
                  autoComplete: "current-password",
                })}

                {renderPasswordField({
                  id: "newPassword",
                  label: "New Password",
                  value: newPassword,
                  onChange: setNewPassword,
                  visible: showNewPassword,
                  setVisible: setShowNewPassword,
                  placeholder: "Enter your new password",
                  autoComplete: "new-password",
                })}

                {renderPasswordField({
                  id: "confirmPassword",
                  label: "Confirm New Password",
                  value: confirmPassword,
                  onChange: setConfirmPassword,
                  visible: showConfirmPassword,
                  setVisible: setShowConfirmPassword,
                  placeholder: "Confirm your new password",
                  autoComplete: "new-password",
                })}

                {/* Password Requirements */}
                <div className="rounded-xl bg-[#FFF9F5] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-[#242424]">
                    Password Requirements
                  </h3>

                  <div className="space-y-2 text-xs">
                    <p
                      className={
                        newPassword.length === 0 || passwordLengthValid
                          ? "text-[#6B7280]"
                          : "text-red-500"
                      }
                    >
                      {passwordLengthValid ? "✓" : "•"} Between 8 and 50 characters
                    </p>

                    <p className="text-[#6B7280]">• Must be different from your current password</p>

                    <p
                      className={
                        !confirmPassword || passwordsMatch ? "text-[#6B7280]" : "text-red-500"
                      }
                    >
                      {passwordsMatch ? "✓" : "•"} Both new passwords must match
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#EDE9E6] pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/forgot-password"
                    className="text-center text-sm font-medium text-[#7C5CFC] transition hover:text-[#FF5A5F] sm:text-left"
                  >
                    Forgot your current password?
                  </Link>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#F44850] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Updating Password..." : "Update Password"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

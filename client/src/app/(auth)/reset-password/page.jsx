"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ArrowLeft, CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Poppins } from "next/font/google";

import { resetPasswordSchema } from "@/features/auth/schemas/resetPasswordSchema";
import { resetPassword } from "@/features/auth/services/authService";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [passwordReset, setPasswordReset] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),

    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    if (!token) {
      setError("root", {
        type: "server",
        message: "Reset password link is invalid or missing.",
      });

      return;
    }

    try {
      await resetPassword(token, data.password);

      setPasswordReset(true);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to reset password. The link may be invalid or expired.";

      setError("root", {
        type: "server",
        message,
      });
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* SVG Curve */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="rightPanelCurve" clipPathUnits="objectBoundingBox">
            <path
              d="
                M 0,0
                L 1,0
                L 1,1
                L 0.14,1
                C 0.07,0.92 0.02,0.84 0.02,0.72
                C 0.02,0.58 0.11,0.45 0.11,0.30
                C 0.11,0.18 0.07,0.08 0,0
                Z
              "
            />
          </clipPath>
        </defs>
      </svg>

      <div className="mx-auto grid min-h-screen overflow-hidden bg-white lg:grid-cols-[1.25fr_0.75fr]">
        {/* LEFT SECTION */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-[520px]">
            {/* Logo */}
            <div className="flex justify-center">
              <Link href="/" className="mb-10 inline-flex items-center">
                <Image src="/images/logo.png" alt="YC Gifts & Toys" width={70} height={70} />

                <div>
                  <div className="flex items-center gap-1 text-xl font-bold tracking-tight text-[#242424]">
                    <span className="text-3xl text-[#FF5A5F]">YC</span>
                    GIFTS & TOYS
                  </div>

                  <p className="text-xs text-[#6B7280]">Making Moments Special</p>
                </div>
              </Link>
            </div>

            {!passwordReset ? (
              /* ==========================
                 RESET PASSWORD FORM
              =========================== */
              <div>
                {/* Icon */}
                <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF5A5F] to-[#7C5CFC] shadow-[0_15px_35px_rgba(124,92,252,0.2)]">
                  <LockKeyhole size={35} strokeWidth={1.8} className="text-white" />
                </div>

                {/* Heading */}
                <div className="text-center">
                  <h1 className="text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
                    Create new password
                  </h1>

                  <p className="mx-auto mt-3 max-w-md leading-7 text-[#6B7280]">
                    Your new password must be different from your previously used password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
                  {/* New Password */}
                  <PasswordField
                    placeholder="New Password"
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    error={errors.password?.message}
                    {...register("password")}
                  />

                  {/* Confirm Password */}
                  <PasswordField
                    placeholder="Confirm New Password"
                    showPassword={showConfirmPassword}
                    setShowPassword={setShowConfirmPassword}
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />

                  {/* Password Hint */}
                  <div className="rounded-xl bg-[#FFF9F5] px-4 py-3">
                    <p className="text-xs leading-5 text-[#6B7280]">
                      Your password must contain at least 8 characters.
                    </p>
                  </div>

                  {/* Server Error */}
                  {errors.root && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                      <p className="text-sm text-red-600">{errors.root.message}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] font-semibold text-white shadow-[0_10px_25px_rgba(255,90,95,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#f24d52] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <LockKeyhole size={17} />
                      </>
                    )}
                  </button>
                </form>

                {/* Back */}
                <div className="mt-7 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#FF5A5F]"
                  >
                    <ArrowLeft size={16} />
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              /* ==========================
                 SUCCESS STATE
              =========================== */
              <div className="text-center">
                {/* Success Icon */}
                <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#FF5A5F]/10" />

                  <div className="absolute inset-3 rounded-full bg-[#7C5CFC]/10" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF5A5F] to-[#7C5CFC] shadow-[0_15px_35px_rgba(124,92,252,0.25)]">
                    <CheckCircle2 size={42} strokeWidth={1.8} className="text-white" />

                    <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#FFC83D]">
                      <CheckCircle2 size={17} className="text-[#242424]" />
                    </div>
                  </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
                  Password reset!
                </h1>

                <p className="mx-auto mt-4 max-w-md leading-7 text-[#6B7280]">
                  Your password has been reset successfully. You can now sign in using your new
                  password.
                </p>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-[#FF5A5F] font-semibold text-white shadow-[0_10px_25px_rgba(255,90,95,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#f24d52]"
                >
                  Continue to Sign In →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT BRAND PANEL */}
        <section
          className="relative hidden overflow-hidden bg-[linear-gradient(155deg,#FF7A65_0%,#FF686B_24%,#EC5B91_50%,#C653C4_72%,#8B4DE8_100%)] lg:flex"
          style={{
            clipPath: "url(#rightPanelCurve)",
          }}
        >
          {/* Background Glow */}
          <div className="absolute top-[10%] left-[8%] h-20 w-20 rounded-full bg-[#FFC83D]/20 blur-xl" />

          <div className="absolute top-[15%] right-[8%] h-36 w-36 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute bottom-[10%] left-[5%] h-40 w-40 rounded-full bg-[#7C5CFC]/30 blur-3xl" />

          <div className="relative z-10 flex h-full w-full flex-col px-14 py-16 xl:px-20">
            {/* Brand Message */}
            <div className={`${poppins.className} max-w-lg`}>
              <h2 className="pl-10 text-4xl leading-[1.1] font-medium tracking-tight text-white xl:text-5xl">
                A Fresh Start
                <br />
                Awaits You.
              </h2>

              <p className="mt-6 pl-10 text-base leading-8 font-medium text-white/85">
                Create a new password and get back
                <br />
                to discovering thoughtful gifts,
                <br />
                toys, and special surprises.
              </p>
            </div>

            {/* Decorations */}
            <div className="pointer-events-none absolute inset-0 z-[5]">
              <Image
                src="/images/decor/heart.svg"
                alt=""
                width={42}
                height={42}
                className="absolute top-[10%] right-[27%] w-[36px] rotate-40 xl:w-[42px]"
              />

              <Image
                src="/images/decor/paper-plane.svg"
                alt=""
                width={150}
                height={90}
                className="absolute top-[38%] left-[14%] w-[130px] xl:w-[160px]"
              />

              <Image
                src="/images/decor/star.svg"
                alt=""
                width={22}
                height={22}
                className="absolute top-[55%] left-[15%] w-[20px]"
              />

              <Image
                src="/images/decor/jingle.svg"
                alt=""
                width={35}
                height={35}
                className="absolute top-[70%] left-[8%] w-[30px] rotate-[-20deg]"
              />
            </div>

            {/* Hero Image */}
            <div className="absolute right-[-120px] bottom-5 z-10 w-[145%]">
              <Image
                src="/images/hero.png"
                alt="Teddy bear with gifts and balloons"
                width={900}
                height={900}
                priority
                className="h-auto w-full object-contain object-bottom"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =============================
   PASSWORD FIELD
============================= */

function PasswordField({ placeholder, showPassword, setShowPassword, error, ...props }) {
  return (
    <div>
      <div
        className={`group flex h-12 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-4 ${
          error
            ? "border-red-500 focus-within:ring-red-500/10"
            : "border-[#EDE9E6] focus-within:border-[#FF5A5F] focus-within:ring-[#FF5A5F]/10"
        }`}
      >
        <LockKeyhole
          size={20}
          className="text-[#6B7280] transition group-focus-within:text-[#FF5A5F]"
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          {...props}
          className="h-full flex-1 bg-transparent text-sm text-[#242424] outline-none placeholder:text-[#9CA3AF]"
        />

        <button
          type="button"
          onClick={() => setShowPassword((previous) => !previous)}
          className="text-[#6B7280] transition hover:text-[#242424]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

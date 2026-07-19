"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole, Mail, Send } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Poppins } from "next/font/google";

import { forgotPasswordSchema } from "@/features/auth/schemas/forgotPasswordSchema";
import { forgotPassword } from "@/features/auth/services/authService";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),

    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email);

      setSubmittedEmail(data.email);
      setEmailSent(true);
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to send reset email. Please try again.";

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
        {/* LEFT */}
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

            {!emailSent ? (
              /* =========================
                 EMAIL FORM
              ========================== */
              <div>
                {/* Icon */}
                <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF5A5F] to-[#7C5CFC] shadow-[0_15px_35px_rgba(124,92,252,0.2)]">
                  <LockKeyhole size={35} strokeWidth={1.8} className="text-white" />
                </div>

                {/* Heading */}
                <div className="text-center">
                  <h1 className="text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
                    Forgot your password?
                  </h1>

                  <p className="mx-auto mt-3 max-w-md leading-7 text-[#6B7280]">
                    No worries! Enter the email address associated with your account and we&apos;ll
                    send you a link to reset your password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
                  <div>
                    <div
                      className={`group flex h-12 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-4 ${
                        errors.email
                          ? "border-red-500 focus-within:ring-red-500/10"
                          : "border-[#EDE9E6] focus-within:border-[#FF5A5F] focus-within:ring-[#FF5A5F]/10"
                      }`}
                    >
                      <Mail
                        size={20}
                        className="text-[#6B7280] transition group-focus-within:text-[#FF5A5F]"
                      />

                      <input
                        type="email"
                        placeholder="Email Address"
                        {...register("email")}
                        className="h-full flex-1 bg-transparent text-sm text-[#242424] outline-none placeholder:text-[#9CA3AF]"
                      />
                    </div>

                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
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
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <Send size={17} />
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
              /* =========================
                 EMAIL SENT
              ========================== */
              <div className="text-center">
                {/* Success Icon */}
                <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#FF5A5F]/10" />

                  <div className="absolute inset-3 rounded-full bg-[#7C5CFC]/10" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF5A5F] to-[#7C5CFC] shadow-[0_15px_35px_rgba(124,92,252,0.25)]">
                    <Mail size={38} strokeWidth={1.8} className="text-white" />

                    <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#FFC83D]">
                      <CheckCircle2 size={17} className="text-[#242424]" />
                    </div>
                  </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
                  Check your inbox!
                </h1>

                <p className="mt-4 text-[#6B7280]">We&apos;ve sent a password reset link to</p>

                <p className="mt-1 font-semibold text-[#242424]">{submittedEmail}</p>

                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#6B7280]">
                  Click the link in the email to create a new password. The link may expire after a
                  limited time for security reasons.
                </p>

                {/* Info */}
                <div className="mt-8 rounded-2xl border border-[#EDE9E6] bg-[#FFF9F5] px-5 py-4 text-left">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFC83D]/20">
                      <Mail size={18} className="text-[#FF5A5F]" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#242424]">
                        Didn&apos;t receive the email?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                        Check your spam or junk folder, or try submitting your email again.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Try Again */}
                <button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="mt-5 h-12 w-full rounded-xl border border-[#EDE9E6] bg-white font-semibold text-[#242424] transition hover:border-[#FF5A5F] hover:text-[#FF5A5F]"
                >
                  Try Another Email
                </button>

                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#FF5A5F]"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
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
          {/* Glow */}
          <div className="absolute top-[10%] left-[8%] h-20 w-20 rounded-full bg-[#FFC83D]/20 blur-xl" />

          <div className="absolute top-[15%] right-[8%] h-36 w-36 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute bottom-[10%] left-[5%] h-40 w-40 rounded-full bg-[#7C5CFC]/30 blur-3xl" />

          {/* Text */}
          <div className="relative z-10 flex h-full w-full flex-col px-14 py-16 xl:px-20">
            <div className={`${poppins.className} max-w-lg`}>
              <h2 className="pl-10 text-4xl leading-[1.1] font-medium tracking-tight text-white xl:text-5xl">
                Don&apos;t Worry,
                <br />
                We&apos;ve Got You.
              </h2>

              <p className="mt-6 pl-10 text-base leading-8 font-medium text-white/85">
                A forgotten password shouldn&apos;t stop
                <br />
                you from finding the perfect gift.
                <br />
                You&apos;ll be back in no time.
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

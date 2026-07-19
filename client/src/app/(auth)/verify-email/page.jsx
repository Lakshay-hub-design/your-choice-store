"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AlertCircle, ArrowLeft, CheckCircle2, LoaderCircle, Mail, RefreshCw } from "lucide-react";

import { verifyEmail, resendVerificationEmail } from "@/features/auth/services/authService";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function EmailIcon() {
  return (
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
  );
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState(token ? "verifying" : "pending");

  const [message, setMessage] = useState("");

  const [isResending, setIsResending] = useState(false);

  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    const handleVerification = async () => {
      try {
        setStatus("verifying");

        const response = await verifyEmail(token);

        setMessage(response.message || "Your email has been verified successfully.");

        setStatus("success");
      } catch (error) {
        setMessage(
          error.response?.data?.message || "The verification link is invalid or has expired."
        );

        setStatus("error");
      }
    };

    handleVerification();
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      setResendMessage("Email address is missing. Please register again.");

      return;
    }

    try {
      setIsResending(true);
      setResendMessage("");

      const response = await resendVerificationEmail(email);

      setResendMessage(response.message || "Verification email sent successfully.");
    } catch (error) {
      setResendMessage(error.response?.data?.message || "Unable to resend verification email.");
    } finally {
      setIsResending(false);
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
        {/* Left Section */}
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

            {/* Verification Content */}
            <div className="text-center">
              {/* PENDING — Check Inbox */}

              {status === "pending" && (
                <>
                  <EmailIcon />

                  <h1 className="text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
                    Check your inbox!
                  </h1>

                  <p className="mx-auto mt-4 max-w-md leading-7 text-[#6B7280]">
                    We&apos;ve sent a verification link to
                  </p>

                  {email && <p className="mt-1 font-semibold text-[#242424]">{email}</p>}

                  <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#6B7280]">
                    Click the link in the email to verify your account and start discovering
                    something special.
                  </p>

                  {/* Information */}
                  <div className="mt-8 rounded-2xl border border-[#EDE9E6] bg-[#FFF9F5] px-5 py-4 text-left">
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFC83D]/20">
                        <Mail size={18} className="text-[#FF5A5F]" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#242424]">
                          Didn&apos;t receive the email?
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                          Check your spam or junk folder. You can also request a new verification
                          email below.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resend Message */}

                  {resendMessage && <p className="mt-4 text-sm text-[#6B7280]">{resendMessage}</p>}

                  {/* Resend Button */}

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] font-semibold text-white shadow-[0_10px_25px_rgba(255,90,95,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#f24d52] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw size={17} className={isResending ? "animate-spin" : ""} />

                    {isResending ? "Sending..." : "Resend Verification Email"}
                  </button>

                  <p className="mt-6 text-sm text-[#6B7280]">
                    Already verified your email?{" "}
                    <Link href="/login" className="font-semibold text-[#FF5A5F] hover:underline">
                      Sign In
                    </Link>
                  </p>
                </>
              )}

              {/* VERIFYING */}

              {status === "verifying" && (
                <>
                  <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#FF5A5F]/10">
                    <LoaderCircle size={52} className="animate-spin text-[#FF5A5F]" />
                  </div>

                  <h1 className="text-3xl font-bold text-[#242424] sm:text-4xl">
                    Verifying your email...
                  </h1>

                  <p className="mx-auto mt-4 max-w-md leading-7 text-[#6B7280]">
                    Just a moment while we verify your account.
                  </p>
                </>
              )}

              {/* SUCCESS */}

              {status === "success" && (
                <>
                  <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle2 size={58} className="text-green-500" />
                  </div>

                  <h1 className="text-3xl font-bold text-[#242424] sm:text-4xl">Email verified!</h1>

                  <p className="mx-auto mt-4 max-w-md leading-7 text-[#6B7280]">{message}</p>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                    Your account is ready. Sign in and start discovering something special.
                  </p>

                  <Link
                    href="/login"
                    className="mt-8 flex h-11 w-full items-center justify-center rounded-xl bg-[#FF5A5F] font-semibold text-white shadow-[0_10px_25px_rgba(255,90,95,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#f24d52]"
                  >
                    Continue to Sign In →
                  </Link>
                </>
              )}

              {/* ERROR */}

              {status === "error" && (
                <>
                  <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-red-50">
                    <AlertCircle size={58} className="text-red-500" />
                  </div>

                  <h1 className="text-3xl font-bold text-[#242424] sm:text-4xl">
                    Verification failed
                  </h1>

                  <p className="mx-auto mt-4 max-w-md leading-7 text-[#6B7280]">{message}</p>

                  {email && (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] font-semibold text-white transition hover:bg-[#f24d52] disabled:opacity-60"
                    >
                      <RefreshCw size={17} className={isResending ? "animate-spin" : ""} />

                      {isResending ? "Sending..." : "Send New Verification Link"}
                    </button>
                  )}

                  {resendMessage && <p className="mt-4 text-sm text-[#6B7280]">{resendMessage}</p>}

                  <Link
                    href="/register"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#242424]"
                  >
                    <ArrowLeft size={16} />
                    Back to registration
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Right Brand Panel */}
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

          {/* Content */}
          <div className="relative z-10 flex h-full w-full flex-col px-14 py-16 xl:px-20">
            {/* Heading */}
            <div className={`${poppins.className} max-w-lg`}>
              <h2 className="pl-10 text-4xl leading-[1.1] font-medium tracking-tight text-white xl:text-5xl">
                Just One
                <br />
                More Step.
              </h2>

              <p className="mt-6 pl-10 text-base leading-8 font-medium text-white/85">
                Verify your email and unlock a world
                <br />
                of thoughtful gifts, fun toys, and
                <br />
                special surprises.
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
                src="/images/decor/star.svg"
                alt=""
                width={22}
                height={22}
                className="absolute top-[57%] left-[45%] w-[20px]"
              />

              <Image
                src="/images/decor/jingle.svg"
                alt=""
                width={35}
                height={35}
                className="absolute top-[70%] left-[8%] w-[30px] rotate-[-20deg]"
              />

              <Image
                src="/images/decor/jingle.svg"
                alt=""
                width={35}
                height={35}
                className="absolute top-[67%] right-[7%] w-[32px] rotate-[20deg]"
              />
            </div>

            {/* Gift Illustration */}
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

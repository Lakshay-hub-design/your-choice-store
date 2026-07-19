"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema } from "@/features/auth/schemas/registerSchema";
import { registerCustomer } from "@/features/auth/services/authService";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RegisterPage() {
  const [registerWith, setRegisterWith] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      terms: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      };

      if (data.phone) {
        payload.phone = data.phone;
      }

      await registerCustomer(payload);

      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed. Please try again.";

      setError("root", {
        type: "server",
        message,
      });
    }
  };

  return (
    <main className="">
      {/* SVG clip path for right panel curve */}
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
        {/* Registration Form */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-[520px]">
            {/* Logo */}
            <div classname="flex items-center justify-center">
              <Link href="/" className="mb-4 inline-flex items-center sm:mb-10">
                <div className="flex items-center justify-center rounded-xl text-white">
                  <Image src="/images/logo.png" alt="logo" width={70} height={70} />
                </div>

                <div>
                  <div className="flex items-center gap-1 text-xl font-bold tracking-tight text-[#242424]">
                    <span className="text-3xl text-[#FF5A5F]">YC</span> GIFTS & TOYS
                  </div>

                  <p className="text-xs text-[#6B7280]">Making Moments Special</p>
                </div>
              </Link>
            </div>

            {/* Mobile Illustration */}
            <div className="mb-8 lg:hidden">
              <div className="text-center">
                <Image
                  src="/images/mobile.png"
                  alt=""
                  width={300}
                  height={300}
                  classname="h-auto w-full object-contain object-bottom"
                />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-4 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
                Create your account <span className="inline-block"></span>
              </h1>

              <p className="mt-3 max-w-md leading-7 text-[#6B7280]">
                Join YC Gifts & Toys and make every celebration more special.
              </p>
            </div>

            {/* Email / Mobile Toggle */}
            <div className="mb-4 grid grid-cols-2 rounded-2xl bg-[#F8F6F4] p-1">
              <button
                type="button"
                onClick={() => setRegisterWith("email")}
                className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all ${
                  registerWith === "email"
                    ? "bg-white text-[#FF5A5F] shadow-sm ring-1 ring-[#FF5A5F]/30"
                    : "text-[#6B7280]"
                }`}
              >
                <Mail size={18} />
                Email
              </button>

              <button
                type="button"
                onClick={() => setRegisterWith("mobile")}
                className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all ${
                  registerWith === "mobile"
                    ? "bg-white text-[#FF5A5F] shadow-sm ring-1 ring-[#FF5A5F]/30"
                    : "text-[#6B7280]"
                }`}
              >
                <Phone size={18} />
                Mobile
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                icon={<UserRound size={20} />}
                type="text"
                placeholder="Full Name"
                {...register("fullName")}
                error={errors.fullName?.message}
              />

              {registerWith === "email" ? (
                <>
                  <InputField
                    icon={<Mail size={20} />}
                    type="email"
                    placeholder="Email Address"
                    {...register("email")}
                    error={errors.email?.message}
                  />

                  <InputField
                    icon={<Phone size={20} />}
                    type="tel"
                    placeholder="Mobile Number (Optional)"
                  />
                </>
              ) : (
                <>
                  <InputField
                    icon={<Phone size={20} />}
                    type="tel"
                    placeholder="Mobile Number"
                    {...register("phone")}
                    error={errors.phone?.message}
                  />

                  <InputField
                    icon={<Mail size={20} />}
                    type="email"
                    placeholder="Email Address (Optional)"
                  />
                </>
              )}

              {/* Password */}
              <PasswordField
                placeholder="Password"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                {...register("password")}
                error={errors.password?.message}
              />

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  {...register("terms")}
                  className="mt-1 h-4 w-4 accent-[#FF5A5F]"
                />

                <span className="text-sm leading-6 text-[#6B7280]">
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-[#FF5A5F] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-[#FF5A5F] hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {errors.root && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-11 w-full rounded-xl bg-[#FF5A5F] font-semibold text-white shadow-[0_10px_25px_rgba(255,90,95,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#f24d52] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating Account..." : "Create Account →"}
              </button>
            </form>

            {/* Sign In */}
            <p className="mt-7 text-center text-sm text-[#6B7280]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#FF5A5F] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </section>

        {/* Brand Visual */}
        <section
          className="relative hidden overflow-hidden bg-[linear-gradient(155deg,#FF7A65_0%,#FF686B_24%,#EC5B91_50%,#C653C4_72%,#8B4DE8_100%)] lg:flex lg:items-center lg:justify-center"
          style={{
            clipPath: "url(#rightPanelCurve)",
          }}
        >
          {/* Decorations */}
          <div className="absolute top-[10%] left-[8%] h-20 w-20 rounded-full bg-[#FFC83D]/20 blur-xl" />
          <div className="absolute top-[15%] right-[8%] h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-[10%] left-[5%] h-40 w-40 rounded-full bg-[#7C5CFC]/30 blur-3xl" />

          <div className="relative z-10 flex h-full w-full flex-col px-14 py-16 xl:px-20">
            {/* Brand Message */}
            <div className={`${poppins.className} max-w-lg`}>
              <h2 className="pl-10 text-4xl leading-[1.1] font-medium tracking-tight text-white xl:text-5xl">
                Make Every
                <br />
                Moment a Gift.
              </h2>

              <p className="text-md mt-6 pl-10 leading-8 font-medium text-white/85">
                Discover thoughtful gifts, fun toys, <br /> and personalized surprises for <br />{" "}
                the people you love.
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="pointer-events-none absolute inset-0 z-[5]">
              {/* Yellow Outline Heart */}
              <Image
                src="/images/decor/heart.svg"
                alt=""
                width={42}
                height={42}
                className="absolute top-[10%] right-[27%] w-[36px] rotate-40 xl:w-[42px]"
              />

              {/* Paper Plane + Dotted Trail */}
              <Image
                src="/images/decor/paper-plane.svg"
                alt=""
                width={150}
                height={90}
                className="absolute top-[38%] left-[14%] w-[130px] xl:w-[160px]"
              />

              {/* Star 1 */}
              <Image
                src="/images/decor/star.svg"
                alt=""
                width={22}
                height={22}
                className="absolute top-[55%] left-[15%] w-[20px]"
              />

              {/* Star 2 */}
              <Image
                src="/images/decor/star.svg"
                alt=""
                width={22}
                height={22}
                className="absolute top-[57%] left-[45%] w-[20px]"
              />

              {/* Yellow Jingle - Left */}
              <Image
                src="/images/decor/jingle.svg"
                alt=""
                width={35}
                height={35}
                className="absolute top-[70%] left-[8%] w-[30px] rotate-[-20deg]"
              />

              {/* Yellow Jingle - Right */}
              <Image
                src="/images/decor/jingle.svg"
                alt=""
                width={35}
                height={35}
                className="absolute top-[67%] right-[7%] w-[32px] rotate-[20deg]"
              />
            </div>

            {/* Teddy + Gifts Illustration */}
            <div className="absolute right-[-120] bottom-5 z-10 w-[145%]">
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

function InputField({ icon, type, placeholder, error, ...props }) {
  return (
    <div>
      <div
        className={`group flex h-11 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-4 ${
          error
            ? "border-red-500 focus-within:ring-red-500/10"
            : "border-[#EDE9E6] focus-within:border-[#FF5A5F] focus-within:ring-[#FF5A5F]/10"
        }`}
      >
        <span className="text-[#6B7280] transition group-focus-within:text-[#FF5A5F]">{icon}</span>

        <input
          type={type}
          placeholder={placeholder}
          {...props}
          className="h-full flex-1 bg-transparent text-sm text-[#242424] outline-none placeholder:text-[#9CA3AF]"
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function PasswordField({ placeholder, showPassword, setShowPassword, error, ...props }) {
  return (
    <div>
      <div
        className={`group flex h-11 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-4 ${
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
          className="text-[#6B7280]"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

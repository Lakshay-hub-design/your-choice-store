"use client";

import Link from "next/link";

import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#FF5A5F]/10 bg-gradient-to-r from-[#FFF1EA] via-[#FFF5F1] to-[#FFE9E2]">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-16 h-52 w-52 rounded-full bg-[#FFC83D]/10 blur-3xl" />

      <div className="absolute top-0 right-[15%] h-72 w-72 rounded-full bg-[#FF5A5F]/10 blur-3xl" />

      {/* Desktop previous */}
      <button
        type="button"
        aria-label="Previous banner"
        className="absolute top-1/2 left-3 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#EDE9E6] bg-white text-[#6B7280] shadow-sm transition hover:text-[#FF5A5F] md:flex"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Desktop next */}
      <button
        type="button"
        aria-label="Next banner"
        className="absolute top-1/2 right-3 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#EDE9E6] bg-white text-[#6B7280] shadow-sm transition hover:text-[#FF5A5F] md:flex"
      >
        <ChevronRight size={18} />
      </button>

      <div className="relative grid min-h-[360px] md:grid-cols-[0.9fr_1.1fr] lg:min-h-[390px]">
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-6 py-9 sm:px-9 md:px-14 lg:px-16">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#FFC83D]/30 px-3 py-1.5 text-[10px] font-semibold text-[#5f4a00]">
            <Sparkles size={12} />
            Special Collection
          </div>

          <h1 className="mt-5 max-w-lg text-[32px] leading-[1.08] font-extrabold tracking-tight text-[#242424] sm:text-4xl lg:text-5xl">
            Thoughtful Gifts
            <span className="mt-1 block text-[#FF5A5F]">For Every Moment</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-[#6B7280] sm:text-[15px]">
            Discover unique gifts and premium toys that bring joy to the people you love.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-[#FF5A5F] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(255,90,95,0.2)] transition hover:-translate-y-0.5 hover:bg-[#f1494e]"
          >
            Shop Now
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Visual */}
        <div className="relative min-h-[280px] overflow-hidden md:min-h-0">
          <div className="absolute right-[-60px] bottom-[-90px] h-[350px] w-[350px] rounded-full bg-[#FF5A5F]/8 sm:right-[2%] md:bottom-[-100px] md:h-[440px] md:w-[440px]" />

          <div className="absolute top-[12%] right-[12%] h-20 w-20 rounded-full bg-[#7C5CFC]/10 blur-xl" />

          <HeroVisual />
        </div>
      </div>

      {/* Slider dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 md:bottom-5">
        <span className="h-2 w-2 rounded-full bg-[#FF5A5F]" />
        <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
        <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
        <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="absolute inset-0 flex items-end justify-center px-6 pb-7 md:justify-end md:px-10">
      <div className="relative flex h-[250px] w-full max-w-[520px] items-end justify-center">
        {/* Gift */}
        <div className="absolute bottom-7 left-[5%] z-10 flex h-28 w-28 items-center justify-center rounded-2xl bg-[#FF5A5F] text-6xl shadow-xl sm:left-[10%]">
          🎁
        </div>

        {/* Teddy */}
        <div className="relative z-20 mb-3 text-[150px] leading-none drop-shadow-xl sm:text-[180px]">
          🧸
        </div>

        {/* Mug */}
        <div className="absolute right-[4%] bottom-5 z-30 flex h-28 w-28 items-center justify-center rounded-2xl bg-white text-6xl shadow-xl sm:right-[8%]">
          ☕
        </div>

        {/* Decorative elements */}
        <div className="absolute top-5 right-[3%] text-5xl">🎈</div>

        <div className="absolute top-8 left-[8%] text-3xl">✨</div>

        <div className="absolute top-0 right-[25%] text-2xl">💝</div>
      </div>
    </div>
  );
}

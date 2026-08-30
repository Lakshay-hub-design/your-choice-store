"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const banners = [
  {
    badge: "Special Collection",
    title: "Thoughtful Gifts",
    highlight: "For Every Moment",
    description: "Discover unique gifts and premium toys that bring joy to the people you love.",
    buttonText: "Shop Now",
    href: "/products",
    image: "/images/hero/hero-gifts-desktop.png",
    alt: "Thoughtful gifts for every moment",
    background: "from-[#FFF1EA] via-[#FFF5F1] to-[#FFE9E2]",
    badgeBackground: "bg-[#FFC83D]/30",
    badgeText: "text-[#5f4a00]",
    imageSize: "lg", // unchanged, this one is already correct
  },

  {
    badge: "Fun & Play",
    title: "Make Every Day",
    highlight: "More Playful",
    description:
      "Explore exciting toys and games for kids of every age. Find their next favorite toy today.",
    buttonText: "Explore Toys",
    href: "/products?category=toys-games",
    image: "/images/hero/hero-toys-desktop.png",
    alt: "Toys and games collection",
    background: "from-[#EEF5FF] via-[#F5F7FF] to-[#EAEFFF]",
    badgeBackground: "bg-[#7C5CFC]/15",
    badgeText: "text-[#5941C7]",
    imageSize: "sm", // smaller image
  },

  {
    badge: "Special Offers",
    title: "Little Things",
    highlight: "Big Smiles",
    description:
      "Find beautiful gifts at prices you'll love. Perfect for birthdays, celebrations and special moments.",
    buttonText: "View Offers",
    href: "/products?sort=discount",
    image: "/images/hero/hero-offers-desktop.png",
    alt: "Special gifts and offers",
    background: "from-[#FFF8DD] via-[#FFF8EC] to-[#FFF0D6]",
    badgeBackground: "bg-[#FFC83D]/30",
    badgeText: "text-[#6B4E00]",
    imageSize: "sm", // smaller image
  },
];

export default function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  const [isPaused, setIsPaused] = useState(false);

  const activeBanner = banners[activeIndex];

  /*
   * Auto slide
   */
  useEffect(() => {
    if (isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrevious = () => {
    setActiveIndex((current) => (current - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % banners.length);
  };

  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-[#FF5A5F]/10 bg-gradient-to-r ${activeBanner.background}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative blobs */}

      <div className="absolute -top-20 -left-16 h-52 w-52 rounded-full bg-[#FFC83D]/10 blur-3xl" />

      <div className="absolute top-0 right-[15%] h-72 w-72 rounded-full bg-[#FF5A5F]/10 blur-3xl" />

      {/* Previous */}

      <button
        type="button"
        aria-label="Previous banner"
        onClick={handlePrevious}
        className="absolute top-1/2 left-3 z-30 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#EDE9E6] bg-white text-[#6B7280] shadow-sm transition hover:text-[#FF5A5F] md:flex"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Next */}

      <button
        type="button"
        aria-label="Next banner"
        onClick={handleNext}
        className="absolute top-1/2 right-3 z-30 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#EDE9E6] bg-white text-[#6B7280] shadow-sm transition hover:text-[#FF5A5F] md:flex"
      >
        <ChevronRight size={18} />
      </button>

      {/* Slides */}

      <div className="relative grid min-h-[650px] md:min-h-[440px] md:grid-cols-[0.9fr_1.1fr] lg:min-h-[430px]">
        {/* Content */}

        <div
          key={`content-${activeIndex}`}
          className="relative z-20 flex flex-col justify-center px-6 pt-10 pb-2 sm:px-9 md:px-12 md:py-10 lg:px-16"
        >
          <div
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold ${activeBanner.badgeBackground} ${activeBanner.badgeText}`}
          >
            <Sparkles size={12} />

            {activeBanner.badge}
          </div>

          <h1 className="mt-5 max-w-lg text-[32px] leading-[1.08] font-extrabold tracking-tight text-[#242424] sm:text-4xl lg:text-5xl">
            {activeBanner.title}

            <span className="mt-1 block text-[#FF5A5F]">{activeBanner.highlight}</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-[#6B7280] sm:text-[15px]">
            {activeBanner.description}
          </p>

          <Link
            href={activeBanner.href}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-[#FF5A5F] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(255,90,95,0.2)] transition hover:-translate-y-0.5 hover:bg-[#f1494e]"
          >
            {activeBanner.buttonText}

            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Visual */}

        <div className="relative min-h-[300px] overflow-visible md:min-h-0">
          <HeroVisual
            key={activeIndex}
            image={activeBanner.image}
            alt={activeBanner.alt}
            size={activeBanner.imageSize}
          />
        </div>
      </div>

      {/* Slider dots */}

      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 md:bottom-5">
        {banners.map((banner, index) => (
          <button
            key={banner.badge}
            type="button"
            aria-label={`Go to banner ${index + 1}`}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === index ? "w-6 bg-[#FF5A5F]" : "w-2 bg-white shadow-sm"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function HeroVisual({ image, alt, size = "lg" }) {
  // "lg" = original (banner 1, already correct)
  // "sm" = smaller, still right-aligned (banners 2 & 3)
  const sizeClasses =
    size === "sm"
      ? `
          w-[600px]
          -translate-x-[25%]
          -translate-y-1/2

          sm:w-[650px]

          md:left-0
          md:w-[650px]
          md:translate-x-[15%]
          md:-translate-y-1/2

          lg:w-[650px]
          lg:translate-x-[5%]
        `
      : `
          w-[820px]
          -translate-x-[45%]
          -translate-y-1/2

          sm:w-[900px]

          md:left-0
          md:w-[900px]
          md:-translate-x-[10%]
          md:-translate-y-1/2

          lg:w-[900px]
          lg:-translate-x-[23%]
        `;

  return (
    <div className="absolute inset-0 overflow-visible">
      <Image
        src={image}
        alt={alt}
        width={1664}
        height={920}
        priority
        sizes="(max-width: 767px) 100vw, (max-width: 1024px) 60vw, 52vw"
        className={`absolute top-1/2 left-1/2 max-w-none object-contain ${sizeClasses}`}
      />
    </div>
  );
}

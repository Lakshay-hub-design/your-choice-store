"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Truck, X } from "lucide-react";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="announcement"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 40, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.3 },
          }}
          className="overflow-hidden bg-[#FFF1EE]"
        >
          <div className="relative mx-auto flex h-10 max-w-7xl items-center justify-center gap-5 px-10 text-[12px] font-medium text-[#242424]">
            <div className="flex items-center gap-2">
              <Truck size={15} className="shrink-0 text-[#FF5A5F]" />
              <span>
                Free Delivery on orders above <strong>₹1499</strong>
              </span>
            </div>

            <span className="hidden h-4 w-px bg-[#E8CFC9] sm:block" />

            <div className="hidden items-center gap-2 sm:flex">
              <Gift size={15} className="shrink-0 text-[#FF5A5F]" />
              <span>Special Gifts for Every Occasion</span>
            </div>

            <button
              type="button"
              onClick={() => setIsVisible(false)}
              aria-label="Close announcement"
              className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#6B625F] transition-colors hover:bg-[#FF5A5F]/10 hover:text-[#FF5A5F]"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

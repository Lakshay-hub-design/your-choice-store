"use client";

import { useEffect } from "react";

import useRecentlyViewedStore from "@/store/recentlyViewedStore";

export default function RecentlyViewedTracker({ product }) {
  useEffect(() => {
    if (!product?._id) return;

    useRecentlyViewedStore.getState().addRecentlyViewed(product);
  }, [product]);

  return null;
}

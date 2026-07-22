"use client";

import Script from "next/script";

export default function GoogleMapsProvider({ children }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <>
      <Script
        id="google-maps-script"
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`}
        strategy="afterInteractive"
      />

      {children}
    </>
  );
}

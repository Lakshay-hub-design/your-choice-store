"use client";

import { useEffect, useRef, useState } from "react";

import { Loader2, Search } from "lucide-react";

export default function GoogleAddressAutocomplete({ onAddressSelect }) {
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let autocompleteElement;

    const initializeAutocomplete = async () => {
      try {
        // Wait until Google Maps script loads
        while (!window.google?.maps) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");

        autocompleteElement = new PlaceAutocompleteElement({
          includedRegionCodes: ["in"],
        });

        autocompleteElement.placeholder = "Search area, street or location";

        autocompleteElement.style.width = "100%";

        autocompleteElement.addEventListener("gmp-select", async (event) => {
          try {
            const place = event.placePrediction.toPlace();

            await place.fetchFields({
              fields: ["formattedAddress", "location", "addressComponents"],
            });

            const components = extractAddressComponents(place.addressComponents);

            onAddressSelect({
              formattedAddress: place.formattedAddress || "",

              city: components.city,

              state: components.state,

              postalCode: components.postalCode,

              latitude: place.location?.lat() ?? null,

              longitude: place.location?.lng() ?? null,
            });
          } catch (error) {
            console.error("Place selection error:", error);

            setError("Unable to get address details.");
          }
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = "";

          containerRef.current.appendChild(autocompleteElement);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Google Places error:", error);

        setError("Unable to load address search.");

        setIsLoading(false);
      }
    };

    initializeAutocomplete();

    return () => {
      autocompleteElement?.remove();
    };
  }, [onAddressSelect]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Search size={16} className="text-[#FF5A5F]" />

        <label className="text-sm font-semibold text-[#242424]">Search your address</label>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EDE9E6] px-4 py-3 text-sm text-[#6B7280]">
          <Loader2 size={17} className="animate-spin" />
          Loading address search...
        </div>
      )}

      <div ref={containerRef} className={isLoading ? "hidden" : "w-full"} />

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function extractAddressComponents(addressComponents = []) {
  let city = "";
  let state = "";
  let postalCode = "";

  addressComponents.forEach((component) => {
    const types = component.types || [];

    if (types.includes("locality")) {
      city = component.longText || "";
    }

    if (!city && types.includes("administrative_area_level_2")) {
      city = component.longText || "";
    }

    if (types.includes("administrative_area_level_1")) {
      state = component.longText || "";
    }

    if (types.includes("postal_code")) {
      postalCode = component.longText || "";
    }
  });

  return {
    city,
    state,
    postalCode,
  };
}

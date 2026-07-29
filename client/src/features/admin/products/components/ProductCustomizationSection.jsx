import FormCard from "@/components/ui/form/FormCard";
import FormField from "@/components/ui/form/FormField";
import ToggleRow from "@/components/ui/form/ToggleRow";

import { inputClass } from "@/components/ui/form/NumberInput";

export default function ProductCustomizationSection({ customization, updateCustomization }) {
  return (
    <FormCard
      title="Customization"
      description="Configure personalization options for this product."
    >
      <ToggleRow
        title="Personalizable Product"
        description="Allow customers to personalize this product."
        checked={customization.enabled}
        onChange={(checked) => updateCustomization("enabled", checked)}
      />

      {customization.enabled && (
        <div className="mt-5 space-y-5 border-t border-[#E5E7EB] pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleRow
              title="Allow Text"
              description="Customer can provide custom text."
              checked={customization.allowText}
              onChange={(checked) => updateCustomization("allowText", checked)}
            />

            <ToggleRow
              title="Allow Image"
              description="Customer can upload an image."
              checked={customization.allowImage}
              onChange={(checked) => updateCustomization("allowImage", checked)}
            />
          </div>

          {customization.allowImage && (
            <FormField label="Maximum Customer Images">
              <input
                type="number"
                min="1"
                value={customization.maxImages}
                onChange={(event) => updateCustomization("maxImages", event.target.value)}
                className={`${inputClass} max-w-xs`}
              />
            </FormField>
          )}

          <FormField label="Customization Instructions">
            <textarea
              rows={4}
              value={customization.instructions}
              onChange={(event) => updateCustomization("instructions", event.target.value)}
              placeholder="e.g. Upload a clear front-facing photo..."
              className={`${inputClass} resize-y py-3`}
            />
          </FormField>
        </div>
      )}
    </FormCard>
  );
}

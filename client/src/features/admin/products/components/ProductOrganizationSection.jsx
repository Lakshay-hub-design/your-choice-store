import FormCard from "@/components/ui/form/FormCard";
import FormField from "@/components/ui/form/FormField";

import { inputClass } from "@/components/ui/form/NumberInput";

export default function ProductOrganizationSection({ form, updateField }) {
  return (
    <FormCard title="Organization" description="Classify and organize your products.">
      <div className="space-y-5">
        <FormField label="Product Type">
          <select
            value={form.productType || ""}
            onChange={(event) => updateField("productType", event.target.value)}
            className={inputClass}
            required
          >
            <option value="" disabled>
              Select product type
            </option>
            <option value="gift">Gift</option>
            <option value="toy">Toy</option>
          </select>

          <p className="mt-1.5 text-xs text-[#9CA3AF]">
            Choose whether this product belongs to Gifts or Toys.
          </p>
        </FormField>

        <FormField label="Tags">
          <input
            type="text"
            value={form.tags || ""}
            onChange={(event) => updateField("tags", event.target.value)}
            placeholder="gift, birthday, personalized, mug"
            className={inputClass}
          />

          <p className="mt-1.5 text-xs text-[#9CA3AF]">Separate tags using commas.</p>
        </FormField>
      </div>
    </FormCard>
  );
}

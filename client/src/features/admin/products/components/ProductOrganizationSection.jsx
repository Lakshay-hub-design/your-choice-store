import FormCard from "@/components/ui/form/FormCard";
import FormField from "@/components/ui/form/FormField";

import { inputClass } from "@/components/ui/form/NumberInput";

export default function ProductOrganizationSection({ form, updateField }) {
  return (
    <FormCard title="Organization" description="Tags help organize and search products.">
      <FormField label="Tags">
        <input
          type="text"
          value={form.tags}
          onChange={(event) => updateField("tags", event.target.value)}
          placeholder="gift, birthday, personalized, mug"
          className={inputClass}
        />

        <p className="mt-1.5 text-xs text-[#9CA3AF]">Separate tags using commas.</p>
      </FormField>
    </FormCard>
  );
}

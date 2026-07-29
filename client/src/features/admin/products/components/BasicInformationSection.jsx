import FormCard from "@/components/ui/form/FormCard";
import FormField from "@/components/ui/form/FormField";
import CharacterCount from "@/components/ui/form/CharacterCount";

import { inputClass } from "@/components/ui/form/NumberInput";

export default function BasicInformationSection({
  form,
  categories,
  isLoadingCategories,
  updateField,
}) {
  return (
    <FormCard title="Basic Information" description="Product name, category and description.">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Product Name" required className="sm:col-span-2">
          <input
            type="text"
            maxLength={150}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="e.g. Personalized Magic Mug"
            className={inputClass}
          />
        </FormField>

        <FormField label="Category" required>
          <select
            value={form.category}
            disabled={isLoadingCategories}
            onChange={(event) => updateField("category", event.target.value)}
            className={inputClass}
          >
            <option value="">
              {isLoadingCategories ? "Loading categories..." : "Select category"}
            </option>

            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="SKU" required>
          <input
            type="text"
            value={form.sku}
            onChange={(event) => updateField("sku", event.target.value.toUpperCase())}
            placeholder="e.g. MUG-001"
            className={inputClass}
          />
        </FormField>

        <FormField label="Short Description" className="sm:col-span-2">
          <textarea
            rows={2}
            maxLength={250}
            value={form.shortDescription}
            onChange={(event) => updateField("shortDescription", event.target.value)}
            placeholder="Short summary shown around the store..."
            className={`${inputClass} resize-none py-3`}
          />

          <CharacterCount current={form.shortDescription.length} max={250} />
        </FormField>

        <FormField label="Description" required className="sm:col-span-2">
          <textarea
            rows={7}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Describe the product, features, materials, usage, etc."
            className={`${inputClass} resize-y py-3`}
          />
        </FormField>
      </div>
    </FormCard>
  );
}

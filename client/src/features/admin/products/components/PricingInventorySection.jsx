import FormCard from "@/components/ui/form/FormCard";
import FormField from "@/components/ui/form/FormField";

import NumberInput, { inputClass } from "@/components/ui/form/NumberInput";

export default function PricingInventorySection({ form, updateField }) {
  return (
    <FormCard title="Pricing & Inventory" description="Configure pricing and available stock.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Price" required>
          <NumberInput
            value={form.price}
            onChange={(value) => updateField("price", value)}
            placeholder="0"
          />
        </FormField>

        <FormField label="Compare Price">
          <NumberInput
            value={form.comparePrice}
            onChange={(value) => updateField("comparePrice", value)}
            placeholder="0"
          />
        </FormField>

        <FormField label="Stock" required>
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(event) => updateField("stock", event.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </FormField>

        <FormField label="Low Stock Alert">
          <input
            type="number"
            min="0"
            step="1"
            value={form.lowStockThreshold}
            onChange={(event) => updateField("lowStockThreshold", event.target.value)}
            className={inputClass}
          />
        </FormField>
      </div>
    </FormCard>
  );
}

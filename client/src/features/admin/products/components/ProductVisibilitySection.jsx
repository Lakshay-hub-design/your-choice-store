import FormCard from "@/components/ui/form/FormCard";
import ToggleRow from "@/components/ui/form/ToggleRow";

export default function ProductVisibilitySection({ form, updateField }) {
  return (
    <FormCard
      title="Product Visibility"
      description="Control where this product appears in the store."
    >
      <div className="divide-y divide-[#E5E7EB]">
        <ToggleRow
          title="Active"
          description="Customers can view and purchase this product."
          checked={form.isActive}
          onChange={(checked) => updateField("isActive", checked)}
        />

        <div className="py-4">
          <ToggleRow
            title="Featured Product"
            description="Show this product in featured sections."
            checked={form.isFeatured}
            onChange={(checked) => updateField("isFeatured", checked)}
          />
        </div>

        <div className="pt-4">
          <ToggleRow
            title="Best Seller"
            description="Mark this product as a best seller."
            checked={form.isBestSeller}
            onChange={(checked) => updateField("isBestSeller", checked)}
          />
        </div>
      </div>
    </FormCard>
  );
}

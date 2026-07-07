import RateMasterManager from "@/components/commonPages/PricingEngine/RateMasterManager";
import { PRICING_MASTERS } from "@/components/commonPages/PricingEngine/configs";

const page = async ({ params }) => {
  const { master } = await params;
  const cfg = PRICING_MASTERS[master];
  if (!cfg) return <div className="p-6">Unknown pricing master: {master}</div>;
  return (
    <RateMasterManager
      title={cfg.title}
      description={cfg.description}
      resource={master}
      columns={cfg.columns}
      fields={cfg.fields}
    />
  );
};

export default page;

import EntityManager from "@/components/commonPages/Enterprise/EntityManager";
import { ENTERPRISE_RESOURCES } from "@/components/commonPages/Enterprise/configs";

const page = async ({ params }) => {
  const { resource } = await params;
  const cfg = ENTERPRISE_RESOURCES[resource];
  if (!cfg) return <div className="p-6 text-gray-500 dark:text-muted-foreground">Unknown resource: {resource}</div>;
  return <EntityManager cfg={cfg} />;
};

export default page;

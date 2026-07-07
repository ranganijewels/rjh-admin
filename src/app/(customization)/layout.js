import { Sidebar } from "@/components/Sidebar/Sidebar";
import { THEME_CUSTOMIZATION_MENU } from "@/services/constant";

export default function CustomizationLayout({ children }) {
  return (
    <div className="flex h-screen">
      <div className="lg:w-[280px]">
        <Sidebar sideBarMenus={THEME_CUSTOMIZATION_MENU} />
      </div>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}

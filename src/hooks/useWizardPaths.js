import { FORM_WIZARD_MENU } from "@/services/constant";

const { usePathname } = require("next/navigation");

export const useWizardPaths = () => {
  const pathname = usePathname();
  const index = FORM_WIZARD_MENU.findIndex((item) =>
    pathname.endsWith(item.path)
  );

  return {
    current: FORM_WIZARD_MENU[index],
    previous: FORM_WIZARD_MENU[index - 1] ?? null,
    next: FORM_WIZARD_MENU[index + 1] ?? null,
  };
};

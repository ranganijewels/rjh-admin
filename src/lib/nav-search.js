import { MENU_SIDEBAR } from "@/config/menu.config";
import { flattenMenu, searchMenu } from "@/lib/menu-search";

/** Every page in the sidebar, flattened and ready to search. */
export const SEARCHABLE_MENU = flattenMenu(MENU_SIDEBAR);

/** Search the sidebar, honouring the current role's permissions. */
export function searchSidebar(term, canAccess) {
  return searchMenu(term, canAccess, SEARCHABLE_MENU);
}

export { flattenMenu, searchMenu };

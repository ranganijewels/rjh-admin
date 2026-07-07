// Shared permission-module definitions used across the Users/Roles pages
// (AllUserList, PermissionDialog, Roles). Keep this as the single source of
// truth so module names/defaults don't drift between the two usages.

export const PERMISSION_MODULES = [
  {
    module: "Workspace Settings",
    view: false,
    modify: false,
    publish: false,
    configure: false,
  },
  {
    module: "Billing Management",
    view: false,
    modify: false,
    publish: false,
    configure: false,
  },
  {
    module: "Integration Setup",
    view: false,
    modify: false,
    publish: false,
    configure: false,
  },
  {
    module: "Map Creation",
    view: false,
    modify: false,
    publish: false,
    configure: false,
  },
  {
    module: "Data Export",
    view: false,
    modify: false,
    publish: false,
    configure: false,
  },
  {
    module: "User Roles",
    view: false,
    modify: false,
    publish: false,
    configure: false,
  },
  {
    module: "Security Settings",
    view: false,
    modify: false,
    publish: false,
    configure: false,
  },
  {
    module: "Insights Access",
    view: false,
    modify: false,
    publish: false,
    configure: false,
  },
  {
    module: "Merchant List",
    view: false,
    modify: false,
    publish: false,
    configure: false,
  },
];

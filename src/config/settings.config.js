export const APP_SETTINGS = {
  layout: '',
  container: 'fixed',
  theme: {
    // Overwritten on first visit by the OS preference (see SettingsProvider);
    // any explicit toggle after that always wins.
    mode: 'light',
  },
  layouts: {
    demo1: {
      sidebarCollapse: false,
      sidebarTheme: 'light',
    },
    demo2: {
      headerSticky: true,
      headerStickyOffset: 200,
    },
    demo5: {
      headerSticky: true,
      headerStickyOffset: 200,
    },
    demo7: {
      headerSticky: true,
      headerStickyOffset: 200,
    },
    demo9: {
      headerSticky: true,
      headerStickyOffset: 200,
    },
  },
};

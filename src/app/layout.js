import "./globals.css";
import { DM_Sans } from "next/font/google";
import Providers from "@/components/Providers";

// DM Sans is the admin panel's typeface: a geometric grotesque that stays
// legible at the small sizes a dense data table is full of, and that keeps
// its character in the headings without competing with the wordmark.
//
// The variable font is used, so the whole weight range comes down in a
// single file. Montserrat and Cormorant used to be loaded here but nothing
// referenced them — two wasted downloads at build time.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata = {
  title: "Rangani Jewelry House — Admin",
  description: "Rangani Jewelry House business management platform.",
};

// Runs before paint so the page never flashes light-then-dark (or vice
// versa) while React hydrates — SettingsProvider takes over from here.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('app_settings_theme.mode');
    var mode = stored ? JSON.parse(stored) : null;
    if (!mode) {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (mode === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    // `suppressHydrationWarning` is required here: the theme init script
    // below (and the SettingsProvider) toggle the `dark` class on <html>
    // before React hydrates, so the class in the DOM never matches the
    // server-rendered markup. This is the standard way to opt out of that
    // one attribute mismatch — it does not silence mismatches in children.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${dmSans.variable} antialiased`}>
        {" "}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

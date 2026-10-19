import "./globals.css";
import { Inter, Montserrat, Cormorant_Garamond } from "next/font/google";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      <body className={`${inter.variable} ${montserrat.variable} ${cormorant.variable} antialiased`}>
        {" "}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

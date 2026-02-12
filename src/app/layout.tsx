import "leaflet/dist/leaflet.css";
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Natural Events Explainer",
  description: "EONET + RAG Agent (DigitalOcean Gradient AI)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {/* Background decoration */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-zinc-950" />
          <div className="absolute -top-24 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-[30%] left-[-120px] h-[420px] w-[420px] rounded-full bg-white/4 blur-3xl" />
          <div className="absolute bottom-[-160px] right-[-160px] h-[520px] w-[520px] rounded-full bg-white/4 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        <Providers>
          <div className="mx-auto min-h-screen max-w-6xl px-6">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

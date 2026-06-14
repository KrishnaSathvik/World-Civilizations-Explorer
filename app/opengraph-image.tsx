import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo/site";

// Default Open Graph / social-share image, generated at build/request time.
export const alt = `${siteConfig.name} — 10,000 Years of Human Civilization`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1b3a5c 0%, #0f2238 100%)",
          color: "#f7f3ec",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 4, opacity: 0.8 }}>
          WORLD CIVILIZATIONS EXPLORER
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 24 }}>
          10,000 Years of Human History
        </div>
        <div style={{ fontSize: 30, marginTop: 32, opacity: 0.85, maxWidth: 900 }}>
          Civilizations, figures, topics, maps & timelines — source-grounded from
          Wikipedia, museums & the Library of Congress.
        </div>
      </div>
    ),
    { ...size },
  );
}

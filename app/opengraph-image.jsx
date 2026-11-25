import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Inertia Creations — Website Design & Development Studio";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F5F4F0",
          color: "#151515",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 20, height: 20, background: "#FFDB09" }} />
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>
            INERTIA CREATIONS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -6,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            GOOD BUSINESSES
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -6,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            DESERVE BETTER WEBSITES.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#777777" }}>
          Independent digital studio — design, development, e-commerce.
        </div>
      </div>
    ),
    size
  );
}

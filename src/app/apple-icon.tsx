import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9f9f7",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 104,
            height: 104,
            display: "flex",
          }}
        >
          <div
            style={{
              width: 104,
              height: 104,
              background: "linear-gradient(135deg, #3fc23f 0%, #0ca30c 55%, #086e08 100%)",
              borderRadius: "0 100% 0 100%",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -4,
              top: -4,
              width: 14,
              height: 6,
              background: "#6b4423",
              borderRadius: 3,
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}

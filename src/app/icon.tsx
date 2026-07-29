import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            background: "linear-gradient(135deg, #3fc23f 0%, #0ca30c 55%, #086e08 100%)",
            borderRadius: "0 100% 0 100%",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}

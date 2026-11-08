import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<Mark size={180} />, size);
}

function Mark({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size, display: "flex", background: "#C8FF3D", }}>
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M8 22.5 L14 16.5 L18 19.5 L24.5 11" stroke="#0A0D02" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="5.5" y="20" width="4" height="6" rx="1.2" transform="rotate(-45 7.5 23)" fill="#0A0D02" />
        <rect x="22.5" y="7.5" width="4" height="6" rx="1.2" transform="rotate(-45 24.5 10.5)" fill="#0A0D02" />
      </svg>
    </div>
  );
}

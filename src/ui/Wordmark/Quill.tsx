import type { SVGProps } from "react";

export function Quill(props: Omit<SVGProps<SVGSVGElement>, "viewBox" | "preserveAspectRatio">) {
  return (
    <svg {...props} viewBox="15 0 79 144" preserveAspectRatio="none" aria-hidden focusable="false">
      <path
        d="M50 144 C48 118 47 100 48 84
           C34 93 22 89 15 78 C28 77 39 69 45 57
           C33 61 23 55 19 44 C32 45 43 38 49 28
           C52 15 59 6 70 0
           C75 15 75 30 71 43
           C79 39 88 40 94 45 C86 56 75 62 64 63
           C73 64 81 69 85 76 C74 84 63 85 54 82
           C54 100 53 120 54 144 Z"
        fill="var(--brand)"
      />
    </svg>
  );
}

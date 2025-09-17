import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { className?: string };

export default function FormacionMateria({ className, ...props }: Props) {
  return (
    <svg
      viewBox="36 28 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* paths from your SVG (example from previous step) */}
      <path
        d="M38 66.125C38 64.8321 38.5136 63.5921 39.4279 62.6779C40.3421 61.7636 41.5821 61.25 42.875 61.25H69.2M38 66.125C38 67.4179 38.5136 68.6579 39.4279 69.5721C40.3421 70.4864 41.5821 71 42.875 71H69.2V32H42.875C41.5821 32 40.3421 32.5136 39.4279 33.4279C38.5136 34.3421 38 35.5821 38 36.875V66.125Z"
        stroke="currentColor"
        strokeWidth={3.61644}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M46.7153 47.6073L52.0778 42.2448L46.7153 36.8823M53.8653 49.3948H61.0153"
        stroke="currentColor"
        strokeWidth={3.61644}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}




import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { className?: string };

/** Hogar (Home) icon — uses currentColor and Tailwind sizing */
export default function HogarIcon({ className, ...props }: Props) {
  return (
    <svg
      viewBox="32 25 44 48"
      /* adjust if you see cropping; try "0 0 90 90" as an alternative */
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M48.3333 69V49H60.6667V69M36 43L54.5 29L73 43V65C73 66.0609 72.5669 67.0783 71.7959 67.8284C71.0249 68.5786 69.9792 69 68.8889 69H40.1111C39.0208 69 37.9751 68.5786 37.2041 67.8284C36.4331 67.0783 36 66.0609 36 65V43Z"
        stroke="currentColor"
        strokeWidth={3.61644}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

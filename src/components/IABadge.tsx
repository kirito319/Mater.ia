import React from 'react';
import { cn } from '@/lib/utils';

type IABadgeProps = {
  label?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function IABadge({ label = 'IA', active, onClick, className }: IABadgeProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative grid place-items-center select-none pointer-events-auto",
        "transition-transform duration-150 will-change-transform",
        active ? "scale-[0.98]" : "hover:opacity-100 active:scale-95",
        className
      )}
      style={{
        // Width drives everything; height is computed from width so the bottom stays a *true semicircle*
        width: "var(--ia-badge-width)",
        height: "calc(var(--ia-badge-top) + (var(--ia-badge-width) / 2))",
      }}
    >
      {/* Shape: top rectangle + bottom semicircle */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top rectangle */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: 0,
            height: "var(--ia-badge-top)",
            background: "var(--ia-badge-bg)",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
          }}
        />
        {/* Bottom semicircle */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "var(--ia-badge-top)",
            height: "calc(var(--ia-badge-width) / 2)",   // guarantees a perfect half-circle
            background: "var(--ia-badge-bg)",
            borderBottomLeftRadius: "9999px",
            borderBottomRightRadius: "9999px",
          }}
        />
        {/* Soft shadow */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "var(--ia-badge-top)",
            height: "calc(var(--ia-badge-width) / 2)",
            filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.35))",
          }}
        />
      </div>

      {/* Label */}
      <span
        className="relative z-10 font-extrabold tracking-tight"
        style={{
          color: "var(--ia-badge-fg)",
          fontSize: "calc(var(--ia-badge-width) * 0.50)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </span>
    </button>
  );
}

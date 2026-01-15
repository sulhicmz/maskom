"use client";

import { memo } from "react";

interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  animation?: "pulse" | "wave" | "none";
}

const Skeleton = memo(({
  variant = "text",
  width,
  height,
  className = "",
  count = 1,
  animation = "pulse"
}: SkeletonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "circular":
        return "skeleton-circular";
      case "rectangular":
        return "skeleton-rectangular";
      case "rounded":
        return "skeleton-rounded";
      case "text":
      default:
        return "skeleton-text";
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case "wave":
        return "skeleton-wave";
      case "none":
        return "skeleton-no-animation";
      case "pulse":
      default:
        return "skeleton-pulse";
    }
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height) style.height = typeof height === "number" ? `${height}px` : height;
    return style;
  };

  const renderSkeleton = () => (
    <div
      className={`skeleton ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={getStyle()}
      aria-hidden="true"
      role="presentation"
    />
  );

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{renderSkeleton()}</div>
        ))}
      </>
    );
  }

  return renderSkeleton();
});

Skeleton.displayName = "Skeleton";

export default Skeleton;

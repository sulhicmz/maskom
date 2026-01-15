"use client";

import Link from "next/link";

const SkipToMainContent = () => {
  return (
    <Link
      href="#main-content"
      className="skip-to-main-content"
      aria-label="Lewati ke konten utama"
    >
      Lewati ke konten utama
    </Link>
  );
};

SkipToMainContent.displayName = "SkipToMainContent";

export default SkipToMainContent;

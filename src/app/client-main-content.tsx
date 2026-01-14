"use client";

import dynamic from "next/dynamic";

export const ClientMainContent = dynamic(
  () => import("./main-content").then(mod => ({ default: mod.MainContent })),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-600">Loading...</div>
      </div>
    ),
  }
);

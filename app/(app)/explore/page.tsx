"use client";

import "ol/ol.css";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/app/components/map"), { ssr: false });

export default function ExplorePage() {
  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col">
      <DynamicMap />
    </div>
  );
}


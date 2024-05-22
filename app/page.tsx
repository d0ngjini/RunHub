"use client"

import React from 'react';
import 'ol/ol.css';
import dynamic from "next/dynamic";
import {NextUIProvider} from '@nextui-org/system';

const DynamicMainMap = dynamic(() => import('@/app/components/map'), {
    ssr: false,
})

export default function Home() {
  return (
      <NextUIProvider>
          <DynamicMainMap />
      </NextUIProvider>
  );
}

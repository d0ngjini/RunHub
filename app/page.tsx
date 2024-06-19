"use client"

import React from 'react';
import 'ol/ol.css';
import dynamic from "next/dynamic";
import {NextUIProvider} from '@nextui-org/system';
import type {Viewport} from "next";

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
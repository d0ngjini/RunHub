"use client"

import React from 'react';
import {fromLonLat} from 'ol/proj';
import {Point} from 'ol/geom';
import 'ol/ol.css';

import {RMap, ROSM, RLayerVector, RFeature, ROverlay, RStyle} from 'rlayers';
import dynamic from "next/dynamic";
import { NextUIProvider } from '@nextui-org/system';
import { SessionProvider } from "next-auth/react"

const DynamicMainMap = dynamic(() => import('@/app/components/mainmap'), {
    ssr: false,
})

export default function Home() {
  return (
      <NextUIProvider>
          <DynamicMainMap />
      </NextUIProvider>
  );
}

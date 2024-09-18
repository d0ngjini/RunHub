"use client"

import React from 'react';
import 'ol/ol.css';
import dynamic from "next/dynamic";
import {NextUIProvider} from '@nextui-org/system';
import type {Viewport} from "next";
import {Toaster} from "react-hot-toast";
import dayjs from "dayjs";
import {SWRConfig} from "swr";

const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

const DynamicMainMap = dynamic(() => import('@/app/components/map'), {
    ssr: false,
})

export default function Home() {
  return (
      <NextUIProvider>
          { /* SWR 전역설정 */ }
          <SWRConfig
              value={{
                  refreshInterval: 20_000,
                  fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
              }}
          >
            <DynamicMainMap/>
          </SWRConfig>
          <div><Toaster/></div>
      </NextUIProvider>
  );
}
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { DataTable, type OpsColumn } from "./data-table";
import { InputField } from "./input-field";
import { Panel } from "./panel";
import { StatusBadge } from "./status-badge";

type NodeRow = {
  id: string;
  type: string;
  latency: number;
  records: number;
  status: "Active" | "Degraded" | "Critical";
};

const tableColumns: OpsColumn<NodeRow>[] = [
  { header: "NODE_ID", accessor: "id" },
  { header: "TYPE", accessor: "type" },
  { header: "LATENCY (ms)", accessor: "latency" },
  { header: "TOTAL_RECORDS", accessor: "records" },
  {
    header: "STATUS",
    accessor: "status",
    render: (val) => (
      <StatusBadge
        status={val === "Active" ? "success" : val === "Degraded" ? "warning" : "critical"}
      >
        {val}
      </StatusBadge>
    ),
  },
];

const tableData: NodeRow[] = [
  { id: "pg-gis-master-01", type: "PostGIS", latency: 12.4, records: 14_502_930, status: "Active" },
  { id: "pg-gis-replica-01", type: "PostGIS", latency: 45.2, records: 14_502_910, status: "Degraded" },
  { id: "geo-server-node-3", type: "GeoServer", latency: 150.8, records: 0, status: "Critical" },
  { id: "vector-tile-cache", type: "Redis", latency: 1.2, records: 840_192, status: "Active" },
];

export function OpsDashboardLayout() {
  return (
    <div className="min-h-0 bg-background p-3 font-sans text-foreground selection:bg-primary/20 sm:p-4">
      <header className="mb-0 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-semibold tracking-tight">Infrastructure Overview</h1>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="info">ENV: PRODUCTION</StatusBadge>
        </div>
      </header>
      <Separator className="mb-4" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Panel title="Query Configuration">
            <div className="flex flex-col gap-4">
              <InputField label="Target SRID" placeholder="e.g. 4326" defaultValue="5179" />
              <InputField label="Bounding Box (BBOX)" placeholder="xmin, ymin, xmax, ymax" />
              <Button type="button" variant="secondary" className="mt-2 w-full rounded-[3px] text-xs font-medium">
                Execute Spatial Query
              </Button>
            </div>
          </Panel>

          <Panel title="System Metrics">
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between border-b border-border/50 pb-1">
                <span className="text-muted-foreground">CPU Usage</span>
                <span className="text-emerald-200">24.5%</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-1">
                <span className="text-muted-foreground">Memory</span>
                <span className="text-amber-200">12.8 / 16.0 GB</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">Active Connections</span>
                <span className="text-foreground">142</span>
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex min-h-0 flex-col lg:col-span-2">
          <Panel title="Active Nodes & Databases" className="min-h-[320px] flex-1 lg:min-h-0">
            <DataTable columns={tableColumns} data={tableData} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

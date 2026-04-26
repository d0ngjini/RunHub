import * as React from "react";

import { cn } from "@/lib/utils";

export type InputFieldProps = Omit<React.ComponentProps<"input">, "size"> & {
  label?: string;
};

export function InputField({ label, className, id, ...props }: InputFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-1">
      {label ? (
        <label
          htmlFor={inputId}
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        data-slot="ops-input"
        className={cn(
          "rounded-[2px] border border-border/80 bg-background/45 px-2.5 py-1.5 font-mono text-[13px] text-foreground shadow-inner shadow-black/20 transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/60",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

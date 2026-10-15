"use client";

import { useState } from "react";
import Popover from "@mui/material/Popover";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { format, parseISO } from "date-fns";
import { Input } from "@/atoms/input";

interface DateRangeFieldProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  startError?: string;
  endError?: string;
}

const toDate = (s: string) => (s ? parseISO(s) : undefined);
const toStr = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : "");
const show = (d?: Date) => (d ? format(d, "dd MMM yyyy") : "...");

export function DateRangeField({
  startDate,
  endDate,
  onChange,
  startError,
  endError,
}: DateRangeFieldProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const range: DateRange = { from: toDate(startDate), to: toDate(endDate) };

  return (
    <>
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <Input
          label="Start date"
          required
          value={range.from ? show(range.from) : ""}
          error={!!startError}
          helperText={startError}
          slotProps={{ htmlInput: { readOnly: true } }}
        />
        <Input
          label="End date"
          required
          value={range.to ? show(range.to) : ""}
          error={!!endError}
          helperText={endError}
          slotProps={{ htmlInput: { readOnly: true } }}
        />
      </div>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div className="p-3 [--rdp-accent-color:#3a3a3a]">
          <DayPicker
            mode="range"
            min={1}
            numberOfMonths={2}
            selected={range}
            defaultMonth={range.from}
            onSelect={(r) => onChange(toStr(r?.from), toStr(r?.to))}
          />
        </div>
      </Popover>
    </>
  );
}

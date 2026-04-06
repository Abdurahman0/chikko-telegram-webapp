"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}

export function DualRangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
}: DualRangeSliderProps) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Update internal state if props change (from manual typing in parent)
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
    minValRef.current = value[0];
    maxValRef.current = value[1];
  }, [value]);

  return (
    <div className={cn("relative flex h-10 w-full items-center justify-center", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={(event) => {
          const newValue = Math.min(Number(event.target.value), maxVal - step);
          setMinVal(newValue);
          minValRef.current = newValue;
          onChange([newValue, maxVal]);
        }}
        className={cn(
          "thumb thumb--left pointer-events-none absolute z-[3] h-0 w-full outline-none",
          minVal > max - 100 && "z-[5]"
        )}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={(event) => {
          const newValue = Math.max(Number(event.target.value), minVal + step);
          setMaxVal(newValue);
          maxValRef.current = newValue;
          onChange([minVal, newValue]);
        }}
        className="thumb thumb--right pointer-events-none absolute z-[4] h-0 w-full outline-none"
      />

      <div className="relative w-full">
        <div className="absolute z-[1] h-1.5 w-full rounded-full bg-surface-accent/40" />
        <div
          ref={range}
          className="absolute z-[2] h-1.5 rounded-full bg-brand"
        />
      </div>

      <style jsx>{`
        .thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
        }

        .thumb::-webkit-slider-thumb {
          background-color: #fff;
          border: 2px solid #ff7e8b; /* brand color border */
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          height: 24px;
          width: 24px;
          margin-top: 4px;
          pointer-events: all;
          position: relative;
          -webkit-appearance: none;
        }

        .thumb::-moz-range-thumb {
          background-color: #fff;
          border: 2px solid #ff7e8b;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          height: 24px;
          width: 24px;
          pointer-events: all;
          position: relative;
        }
      `}</style>
    </div>
  );
}

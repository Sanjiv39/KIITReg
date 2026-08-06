"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      disabled={{ before: new Date() }}
      className={cn(
        "p-3 bg-slate-950 rounded-xl border border-white/10",
        className,
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",

        month_caption: "flex justify-between pt-1 relative items-center px-8",
        caption_label: "text-sm font-semibold text-white",

        nav: "flex items-center gap-1",

        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-white/5 border-white/10 text-white",
        ),

        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-white/5 border-white/10 text-white",
        ),

        chevron: "h-4 w-4",

        month_grid: "w-full border-collapse",

        weekdays: "flex mt-2 justify-between",

        weekday:
          "text-slate-400 rounded-md w-9 font-normal text-[0.8rem] text-center",

        week: "flex w-full mt-2 justify-between",

        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal hover:bg-white/5 hover:text-white aria-selected:opacity-100",
        ),

        day_button: "h-9 w-9 rounded-lg",

        range_end: "day-range-end",

        selected:
          "bg-[#00f2fe] text-slate-950 hover:bg-[#00f2fe] hover:text-slate-950 focus:bg-[#00f2fe] focus:text-slate-950 font-bold rounded-lg",

        today: "bg-white/10 text-white font-semibold rounded-lg",

        outside:
          "text-slate-600 aria-selected:bg-slate-800/50 aria-selected:text-slate-400 aria-selected:opacity-30",

        disabled: "text-slate-600 opacity-50",

        range_middle: "aria-selected:bg-slate-800 aria-selected:text-white",

        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...props }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", className)} {...props} />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

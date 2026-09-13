import React from "react";

export type NodeState = "complete" | "current" | "locked";
export type IndicatorVariant = "sm" | "rail" | "full";

export interface RouteIndicatorProps {
  state: NodeState;
  variant?: IndicatorVariant;
  label?: string;
  sublabel?: string;
  stepNumber?: number | string;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
}

export function RouteIndicator({
  state,
  variant = "sm",
  label,
  sublabel,
  stepNumber,
  isFirst = false,
  isLast = false,
  className = "",
}: RouteIndicatorProps) {
  // 1. VARIANT: SM (Compact Micro-Waypoint)
  if (variant === "sm") {
    if (state === "complete") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ${className}`}
        >
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-600 text-white">
            <svg className="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span>{label || "Complete"}</span>
        </span>
      );
    }

    if (state === "current") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          <span>{label || "In Progress"}</span>
        </span>
      );
    }

    // Locked
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 ${className}`}
      >
        <svg className="h-2.5 w-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>{label || "Upcoming"}</span>
      </span>
    );
  }

  // 2. VARIANT: RAIL (Vertical Path Spine Component)
  if (variant === "rail") {
    let nodeClasses = "";
    let icon = null;

    if (state === "complete") {
      nodeClasses = "border-emerald-600 bg-emerald-600 text-white shadow-xs";
      icon = (
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (state === "current") {
      nodeClasses = "border-amber-500 bg-white ring-4 ring-amber-100 shadow-xs";
      icon = <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />;
    } else {
      // Locked
      nodeClasses = "border-slate-300 bg-slate-50 text-slate-400";
      icon = (
        <span className="font-mono-code text-[10px] font-semibold text-slate-400">
          {stepNumber ?? "•"}
        </span>
      );
    }

    return (
      <div className={`relative flex flex-col items-center self-stretch ${className}`}>
        {/* Top Connecting Spine Line */}
        {!isFirst && (
          <div
            className={`w-0.5 flex-1 transition-colors ${
              state === "complete" ? "bg-emerald-400" : "bg-slate-200"
            }`}
          />
        )}
        {isFirst && <div className="h-4 w-0.5 bg-transparent" />}

        {/* Central Waypoint Node */}
        <div
          className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${nodeClasses}`}
        >
          {icon}
        </div>

        {/* Bottom Connecting Spine Line */}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 transition-colors ${
              state === "complete" ? "bg-emerald-400" : "bg-slate-200"
            }`}
          />
        )}
        {isLast && <div className="h-4 w-0.5 bg-transparent" />}
      </div>
    );
  }

  // 3. VARIANT: FULL (Complete Waypoint Card / Milestone Banner)
  let statusBadge = null;
  let borderClasses = "border-slate-200 bg-white";

  if (state === "complete") {
    borderClasses = "border-emerald-200 bg-emerald-50/30";
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 text-white">
          <svg className="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        Milestone Complete
      </span>
    );
  } else if (state === "current") {
    borderClasses = "border-amber-200 bg-amber-50/20 ring-1 ring-amber-100";
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        Current Waypoint
      </span>
    );
  } else {
    // Locked
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Upcoming Milestone
      </span>
    );
  }

  return (
    <div className={`rounded-xl border p-4 shadow-xs transition-all ${borderClasses} ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {stepNumber !== undefined && (
            <span className="font-mono-code text-xs font-semibold text-slate-400">
              #{stepNumber}
            </span>
          )}
          <h4 className="font-serif-heading text-base font-bold text-slate-900">{label}</h4>
        </div>
        {statusBadge}
      </div>
      {sublabel && (
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
          {sublabel}
        </p>
      )}
    </div>
  );
}

/**
 * Micro trail for Path Cards showing path progression across waypoints
 */
export function RouteTrail({
  completedCount,
  totalCount,
}: {
  completedCount: number;
  totalCount: number;
}) {
  const steps = 4;
  const fraction = totalCount > 0 ? completedCount / totalCount : 0;
  const completedSteps = Math.round(fraction * steps);

  return (
    <div className="flex items-center gap-1" title={`${completedCount} of ${totalCount} milestones completed`}>
      {Array.from({ length: steps }).map((_, i) => {
        const isCompleted = i < completedSteps;
        const isCurrent = i === completedSteps && completedCount > 0 && completedCount < totalCount;

        let dotColor = "bg-slate-200";
        if (isCompleted) dotColor = "bg-emerald-500";
        else if (isCurrent) dotColor = "bg-amber-500 animate-pulse";

        return (
          <React.Fragment key={i}>
            <span className={`h-2 w-2 rounded-full transition-colors ${dotColor}`} />
            {i < steps - 1 && (
              <span
                className={`h-0.5 w-2 transition-colors ${
                  isCompleted ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

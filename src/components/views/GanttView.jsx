import React, { useState, useMemo } from "react";
import { Users, User, CheckCircle2 } from "lucide-react";

export const GanttView = ({
  data,
  selectedYear,
  selectedMonth,
  months,
  quarters,
  onEdit
}) => {

  const [viewMode, setViewMode] = useState("month");

  const tasks = useMemo(() => {
    return data
      .filter(i => i.gantt)
      .map(i => ({
        id: i.id,
        name: i.description,
        assignee: i.assignee,
		startPlanned: i.startPlanned,
		endPlanned: i.endPlanned,
		startReal: i.startReal,
		endReal: i.endReal,
        teamSize: i.teamSize || 1,
        progress: i.progress || 0
      }))
      .filter(t => t.startPlanned && t.endPlanned);
  }, [data]);

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();

  const getWeekNumber = (dateStr, yearContext) => {
    const date = new Date(dateStr);
    const firstDayOfYear = new Date(yearContext, 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getQuarterWeeks = (q, year) => {
    const qMonths = quarters[q].months;
    const startMonth = qMonths[0];
    const endMonth = qMonths[2];

    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, endMonth + 1, 0);

    const startWeek = getWeekNumber(startDate.toISOString().split("T")[0], year);
    const endWeek = getWeekNumber(endDate.toISOString().split("T")[0], year);

    const weeks = [];
    for (let i = startWeek; i <= endWeek; i++) {
      weeks.push(i);
    }

    return weeks;
  };

  const quarterIndex = Math.floor(selectedMonth / 3);

  const currentQuarterWeeks = useMemo(
    () => getQuarterWeeks(quarterIndex, selectedYear),
    [quarterIndex, selectedYear]
  );

  const colCount =
    viewMode === "year"
      ? 52
      : viewMode === "quarter"
      ? currentQuarterWeeks.length
      : getDaysInMonth(selectedMonth, selectedYear);

  const colWidth =
    viewMode === "year"
      ? 60
      : viewMode === "quarter"
      ? 140
      : 50;

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.startPlanned) - new Date(b.startPlanned));
  }, [tasks]);

  const generateTaskColors = (id) => {

  const hue = (id * 137) % 360;

   return {
    real: `hsl(${hue},65%,45%)`,
    plan: `hsl(${hue},65%,65%)`,
    progress: `hsl(${hue},65%,30%)`
   };

  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">

      {/* HEADER */}
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Diagram Gantta</h2>

        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        >
          <option value="year">Widok roczny</option>
          <option value="quarter">Widok kwartalny</option>
          <option value="month">Widok miesięczny</option>
        </select>
      </div>

      {/* KONTENER */}
      <div className="overflow-x-auto relative">

        <div className="min-w-max">

          {/* OŚ CZASU */}
          <div className="flex h-16 bg-slate-50 border-b-2 border-slate-200 sticky top-0 z-40">

            <div className="w-[300px] min-w-[300px] sticky left-0 bg-slate-50 border-r border-slate-300 z-50 px-6 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">

              {viewMode === "year"
                ? `Harmonogram ${selectedYear}`
                : viewMode === "quarter"
                ? `${quarters[quarterIndex].name} ${selectedYear}`
                : `${months[selectedMonth]} ${selectedYear}`}

            </div>

            {Array.from({ length: colCount }, (_, i) => {

              let label, subLabel;

              if (viewMode === "year") {
                label = `T${i + 1}`;
                subLabel = months[new Date(selectedYear, 0, i * 7 + 1).getMonth()].substring(0, 3);
              }

              else if (viewMode === "quarter") {
                const weekNum = currentQuarterWeeks[i];
                label = `T${weekNum}`;
                subLabel = months[new Date(selectedYear, 0, (weekNum - 1) * 7 + 1).getMonth()].substring(0, 3);
              }

              else {
                label = i + 1;
                subLabel = "Dzień";
              }

              return (
                <div
                  key={i}
                  className="flex-shrink-0 border-r border-slate-200 flex flex-col items-center justify-center font-semibold text-slate-600 text-[11px]"
                  style={{ width: colWidth }}
                >
                  <span className="opacity-40 text-[9px] mb-1">{subLabel}</span>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>

          {/* ZADANIA */}
          {sortedTasks.map(task => {

			const colors = generateTaskColors(task.id);

            const planStart = new Date(task.startPlanned);
			const planEnd = new Date(task.endPlanned);
	
			const realStart = task.startReal ? new Date(task.startReal) : null;
			const realEnd = task.endReal ? new Date(task.endReal) : null;

            let viewStart, viewEnd;

            if (viewMode === "year") {
              viewStart = new Date(selectedYear, 0, 1);
              viewEnd = new Date(selectedYear, 11, 31);
            }

            else if (viewMode === "quarter") {
              const qMonths = quarters[quarterIndex].months;
              viewStart = new Date(selectedYear, qMonths[0], 1);
              viewEnd = new Date(selectedYear, qMonths[2] + 1, 0);
            }

            else {
              viewStart = new Date(selectedYear, selectedMonth, 1);
              viewEnd = new Date(selectedYear, selectedMonth + 1, 0);
            }

			if (planStart > viewEnd || planEnd < viewStart) return null;

			const effectiveStart = new Date(Math.max(planStart, viewStart));
			const effectiveEnd = new Date(Math.min(planEnd, viewEnd));

            let leftPlan, widthPlan;
			let leftReal, widthReal;

            const planDurationDays =
			  Math.round((planEnd - planStart) / 86400000) + 1;

			const realDurationDays =
			  realStart && realEnd
				? Math.round((realEnd - realStart) / 86400000) + 1
				: null;

const calcBar = (start, end) => {

  const s = new Date(Math.max(start, viewStart));
  const e = new Date(Math.min(end, viewEnd));

  const diffStart = (s - viewStart) / 86400000;
  const duration = (e - s) / 86400000 + 1;

  if (viewMode === "year" || viewMode === "quarter") {
    return {
      left: (diffStart / 7) * colWidth,
      width: (duration / 7) * colWidth
    };
  }

  return {
    left: diffStart * colWidth,
    width: duration * colWidth
  };

};

const planBar = calcBar(planStart, planEnd);

const realBar =
  realStart && realEnd
    ? calcBar(realStart, realEnd)
    : null;

leftPlan = planBar.left;
widthPlan = planBar.width;

if (realBar) {
  leftReal = realBar.left;
  widthReal = realBar.width;
}

            return (

              <div key={task.id} className="flex h-12 border-b border-slate-100">

                <div className="w-[300px] min-w-[300px] px-5 flex items-center bg-white border-r-2 border-slate-200 sticky left-0 z-30">

                  <div className="flex-grow truncate pr-2">

                    <div className="font-bold text-sm text-slate-700">
                      {task.name}
                    </div>

                    <div className="text-[10px] text-indigo-500 font-bold flex items-center gap-1">
                      <User size={10} /> {task.assignee || "—"}
                    </div>

                  </div>

                </div>

                <div
                  className="relative flex-grow flex items-center"
                  style={{ width: colCount * colWidth }}
                >

{/* PLAN */}
<div
  onClick={() => onEdit(task.id)}
  className="absolute h-[16px] rounded cursor-pointer hover:brightness-110"
  style={{
	left: leftPlan,
	width: widthPlan,
	top: 4,
	backgroundColor: colors.plan
  }}
/>

{/* PLAN TEKST */}
<div
  className="absolute text-[11px] font-bold flex items-center gap-2 text-white px-2 pointer-events-none"
  style={{
    left: leftPlan,
    top: 0
  }}
>

  <span className="bg-black/20 rounded px-1.5 py-0.5">
    {planDurationDays}d
  </span>

</div>

{/* REAL */}
{realBar && (
  <div
    onClick={() => onEdit(task.id)}
	className="absolute h-[16px] rounded overflow-hidden cursor-pointer hover:brightness-110"
	style={{
	  left: leftReal,
	  width: widthReal,
	  top: 20,
	  backgroundColor: colors.real
	}}
  >

{/* PROGRESS */}
<div
  className="absolute left-0 top-0 bottom-0"
  style={{
	width: `${task.progress}%`,
	backgroundColor: colors.progress
  }}
/>

{/* TEKST */}
<div className="relative z-10 text-[11px] font-bold flex items-center gap-2 text-white px-2 h-full">

  {/* progress */}
  <span className="flex items-center gap-1 bg-white text-slate-900 rounded-full px-2 py-0.5">
    <CheckCircle2 size={10}/> {task.progress}%
  </span>

  {/* czas */}
  <span className="bg-black/20 rounded px-1.5 py-0.5">
    {realDurationDays ?? planDurationDays}d
  </span>

  {/* zespół */}
  <span className="flex items-center gap-1 bg-black/20 rounded px-1.5 py-0.5">
    <Users size={9}/> {task.teamSize}
  </span>

</div>

  </div>
)}

              </div>

			 </div>

            );

          })}

        </div>

      </div>

    </div>
  );

};
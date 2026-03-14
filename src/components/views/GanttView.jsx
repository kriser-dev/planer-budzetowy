import React from "react";

export const GanttView = ({
  data,
  ganttMode,
  setGanttMode
}) => {

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold">
          Diagram Gantta
        </h2>

        <select
          value={ganttMode}
          onChange={(e)=>setGanttMode(e.target.value)}
          className="p-2 border rounded-lg text-sm font-semibold bg-slate-50"
        >

          <option value="month">
            Widok miesięczny
          </option>

          <option value="quarter">
            Widok kwartalny
          </option>

          <option value="year">
            Widok roczny
          </option>

        </select>

      </div>

      {/* INFORMACJA O TRYBIE */}
      <div className="text-xs text-slate-500 mb-4">

        Aktualny widok:
        <span className="font-bold ml-1">

          {ganttMode === "month" && "Miesięczny"}
          {ganttMode === "quarter" && "Kwartalny"}
          {ganttMode === "year" && "Roczny"}

        </span>

      </div>

      {/* LISTA ZADAŃ */}
      <div className="space-y-3">

        {data.length === 0 && (
          <div className="text-sm text-slate-400 italic">
            Brak zadań oznaczonych do diagramu Gantta.
          </div>
        )}

        {data.map(task => (

          <div
            key={task.id}
            className="p-3 border rounded-xl bg-slate-50"
          >

            <div className="font-bold text-sm">
              {task.description}
            </div>

            <div className="text-xs text-slate-500 mt-1">

              Plan:
              {" "}
              {task.startPlanned || "—"}
              {" → "}
              {task.endPlanned || "—"}

            </div>

            <div className="text-xs text-slate-500">

              Real:
              {" "}
              {task.startReal || "—"}
              {" → "}
              {task.endReal || "—"}

            </div>

            {task.teamSize && (
              <div className="text-xs text-slate-400 mt-1">

                Zespół: {task.teamSize}

              </div>
            )}

          </div>

        ))}

      </div>

    </div>
  );

};
import { Play, Zap, GitBranch } from "lucide-react";

interface EdgeDropMenuProps {
  position: { x: number; y: number };
  onSelect: (type: "start" | "api" | "condition") => void;
  onClose: () => void;
}

const options = [
  { type: "start" as const, label: "Start", icon: Play, colorClass: "text-node-start", bgClass: "hover:bg-node-start-bg" },
  { type: "api" as const, label: "API Call", icon: Zap, colorClass: "text-node-api", bgClass: "hover:bg-node-api-bg" },
  { type: "condition" as const, label: "Condition", icon: GitBranch, colorClass: "text-node-condition", bgClass: "hover:bg-node-condition-bg" },
];

export function EdgeDropMenu({ position, onSelect, onClose }: EdgeDropMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      {/* Menu */}
      <div
        className="fixed z-50 w-44 rounded-xl bg-card border border-border shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150"
        style={{ left: position.x, top: position.y }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
          Add Node
        </p>
        {options.map(({ type, label, icon: Icon, colorClass, bgClass }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground ${bgClass} transition-colors cursor-pointer`}
          >
            <Icon className={`h-4 w-4 ${colorClass}`} />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

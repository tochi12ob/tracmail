import clsx from "clsx";

interface PriorityBadgeProps {
  score: number;
}

export default function PriorityBadge({ score }: PriorityBadgeProps) {
  const getStyle = () => {
    if (score >= 80) return "text-red-600 bg-red-50";
    if (score >= 60) return "text-orange-600 bg-orange-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    if (score >= 20) return "text-green-600 bg-green-50";
    return "text-gray-500 bg-gray-100";
  };

  return (
    <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded transition-all duration-200 hover:scale-110", getStyle())}>
      {score}
    </span>
  );
}

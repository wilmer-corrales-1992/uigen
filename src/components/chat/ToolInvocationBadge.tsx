import { Loader2 } from "lucide-react";
import { formatToolMessage } from "@/lib/format-tool-message";

interface ToolInvocationBadgeProps {
  toolInvocation: {
    toolName: string;
    args: Record<string, any>;
    state: 'partial-call' | 'call' | 'result';
    result?: any;
  };
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const message = formatToolMessage(toolInvocation);
  const isComplete = toolInvocation.state === 'result';

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" aria-label="Completed" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" aria-label="In progress" />
      )}
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}

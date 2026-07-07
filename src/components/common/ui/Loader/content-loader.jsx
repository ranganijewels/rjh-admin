import { cn } from "@/lib/utils";
import { Spinner } from "../spinners";

export function ContentLoader({ className }) {
  return (
    <div className={cn("flex justify-center h-full w-full")}>
      <div className="flex items-center gap-2.5">
        <Spinner className="animate-spin text-muted-foreground opacity-50" />
        <span className="text-muted-foreground font-medium text-sm">
          Loading...
        </span>
      </div>
    </div>
  );
}

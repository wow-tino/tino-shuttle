import { Loader2 } from "lucide-react";

import { cn } from "../utils";

export function Spinner({ className, ...props }: React.ComponentProps<typeof Loader2>) {
  return <Loader2 className={cn("text-primary animate-spin", className)} {...props} />;
}

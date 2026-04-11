import { Spinner } from "./spinner";
import { cn } from "../utils";

interface LoadingProps {
  containerClassName?: string;
  title: string;
}

const STUDENT_TINO = "/assets/student-tino.webp";

export function Loading({ containerClassName, title }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", containerClassName)}>
      <img src={STUDENT_TINO} alt="티노 학생" className="size-50" />
      <div className="flex items-center gap-2">
        <Spinner />
        <h1 className="text-foreground text-lg font-semibold text-pretty">{title}</h1>
      </div>
    </div>
  );
}

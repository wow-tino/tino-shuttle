import { Link, useLocation } from "@tanstack/react-router";

import { Clock, Home } from "lucide-react";

import { cn } from "../utils/utils";

const ROUTES = [
  {
    path: "/",
    icon: Home,
    label: "홈",
  },
  {
    path: "/timetable",
    icon: Clock,
    label: "시간표",
  },
] as const;

export function BottomNavigation() {
  const { pathname } = useLocation();

  return (
    <div className="max-w-mobile fixed right-0 bottom-0 left-0 mx-auto bg-white pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-sm">
      <div className="flex text-xs">
        {ROUTES.map((route) => (
          <Link
            key={route.path}
            className="flex flex-1 flex-col items-center justify-center gap-1"
            to={route.path}
            aria-label={`${route.label} 탭으로 이동`}
            aria-current={pathname === route.path ? "page" : undefined}
          >
            <route.icon
              className={cn(pathname === route.path ? "text-primary" : "text-gray-400")}
            />
            <p className={cn(pathname === route.path ? "text-primary" : "text-gray-400")}>
              {route.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

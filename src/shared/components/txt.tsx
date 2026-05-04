import { cva } from "class-variance-authority";

import { cn } from "../utils";

type TxtProps<T extends React.ElementType = "p"> = {
  typography?: "h1-title" | "p" | "p-bold" | "headline" | "body" | "body-bold" | "caption";
  as?: T;
} & React.ComponentPropsWithoutRef<T>;

const txtVariants = cva("text-black", {
  variants: {
    typography: {
      "h1-title": "text-[26px] font-bold",
      p: "text-[15px] font-light",
      "p-bold": "text-base font-bold",
      headline: "text-[18px] font-medium",
      body: "text-[15px] font-medium",
      "body-bold": "text-[18px] font-bold",
      caption: "text-sm font-light",
    },
  },
});

export function Txt<T extends React.ElementType = "p">({
  typography = "body",
  as,
  className,
  ...props
}: TxtProps<T>) {
  const Comp = as || "p";

  return <Comp className={cn(txtVariants({ typography }), className)} {...props} />;
}

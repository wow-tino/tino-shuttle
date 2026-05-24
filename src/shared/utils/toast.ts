import { toast } from "sonner";

export const success = (message: string) => {
  toast.success(message, {
    style: {
      backgroundColor: "var(--color-green-600)",
      color: "var(--color-white)",
      border: "1px solid var(--color-green-600)",
    },
  });
};

export const warning = (message: string) => {
  toast.info(message, {
    style: {
      backgroundColor: "var(--color-amber-50)",
      color: "var(--color-amber-800)",
      border: "1px solid var(--color-amber-200)",
    },
  });
};

export const error = (message: string) => {
  toast.error(message, {
    style: {
      backgroundColor: "var(--color-red-400)",
      color: "var(--color-white)",
      border: "1px solid var(--color-red-400)",
    },
  });
};

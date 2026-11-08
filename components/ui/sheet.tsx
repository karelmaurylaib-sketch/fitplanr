"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function useIsPhone() {
  const [phone, setPhone] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 640px)");
    const on = () => setPhone(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return phone;
}

/**
 * A sheet over the page. Phone: full screen (variant "full") or bottom sheet with a grab handle (variant "bottom").
 * Computer: a centered card (480px by default).
 */
export function Sheet({
  open,
  onClose,
  children,
  variant = "full",
  width = 480,
  label,
  closeSide = "left",
  z = 60,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: "full" | "bottom";
  width?: number;
  label: string;
  closeSide?: "left" | "right";
  z?: number;
  className?: string;
}) {
  const phone = useIsPhone();
  const drag = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const bottom = phone && variant === "bottom";
  const full = phone && variant === "full";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0" style={{ zIndex: z }} role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "absolute flex flex-col overflow-hidden border-line bg-[#0b0c09]",
              full && "inset-0",
              bottom && "inset-x-0 bottom-0 max-h-[94dvh] rounded-t-[24px] border-t",
              !phone && "left-1/2 top-1/2 max-h-[92dvh] rounded-[24px] border shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)]",
              className,
            )}
            style={!phone ? { width, x: "-50%", y: "-50%" } : undefined}
            initial={phone ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            animate={phone ? { y: 0 } : { opacity: 1, scale: 1 }}
            exit={phone ? { y: "100%" } : { opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            drag={bottom ? "y" : false}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            {bottom && (
              <div className="flex shrink-0 cursor-grab justify-center pb-1 pt-3 touch-none" onPointerDown={(e) => drag.start(e)}>
                <span className="h-1.5 w-11 rounded-full bg-white/20" />
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "press absolute top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-fg hover:bg-white/[0.12]",
                closeSide === "left" ? "left-3" : "right-3",
                bottom && "top-4",
              )}
            >
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

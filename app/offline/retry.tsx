"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflineRetry() {
  useEffect(() => {
    const on = () => location.reload();
    window.addEventListener("online", on);
    return () => window.removeEventListener("online", on);
  }, []);
  return (
    <Button className="mt-8" onClick={() => location.reload()}>
      <RefreshCw size={16} /> Try again
    </Button>
  );
}

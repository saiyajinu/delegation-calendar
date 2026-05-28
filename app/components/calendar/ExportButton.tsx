"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { exportLast30Days } from "@/app/actions/export";
import { Button } from "@/app/components/ui/Button";

function downloadTextFile(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExportButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    setError(null);
    startTransition(async () => {
      const result = await exportLast30Days();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      downloadTextFile(result.text, result.filename);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="secondary"
        isLoading={isPending}
        onClick={handleExport}
        className="gap-2"
        aria-label="Export last 30 days as text file"
      >
        <Download className="h-4 w-4" aria-hidden />
        Export last 30 days
      </Button>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

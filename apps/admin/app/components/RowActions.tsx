"use client";

import { useState } from "react";
import type { ComponentState } from "@/lib/design-state";
import { GenerateButton } from "./GenerateButton";
import { DeleteButton } from "./DeleteButton";

/** Per-row action cell: Generate/Regenerate + Delete. Owns the delete-confirm
 *  state so the Generate button is hidden while the confirm prompt is open
 *  (keeps the cell from overflowing with both at once). Delete is offered on
 *  every row except `pending` (which has an in-flight codegen PR). */
export function RowActions({ c }: { c: ComponentState }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      {!confirming && (
        <GenerateButton slug={c.slug} label={c.status === "never" ? "Generate" : "Regenerate"} />
      )}
      {c.status !== "pending" && (
        <DeleteButton
          slug={c.slug}
          name={c.name}
          deletePrUrl={c.deletePrUrl}
          confirming={confirming}
          onConfirmingChange={setConfirming}
        />
      )}
    </>
  );
}

export function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const message = "message" in error ? String((error as { message?: string }).message ?? "") : "";
  const code = "code" in error ? String((error as { code?: string }).code ?? "") : "";

  return (
    code === "42P01" ||
    message.includes("relation") && message.includes("does not exist") ||
    message.includes("Could not find the table") ||
    message.includes("does not exist")
  );
}

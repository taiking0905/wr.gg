export function createOptions(
  list: (string | undefined)[],
  format?: (v: string) => string
) {
  return Array.from(new Set(list))
    .filter(Boolean)
    .map((v) => ({
      label: format ? format(v as string) : (v as string),
      value: v as string,
    }));
}

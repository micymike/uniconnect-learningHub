/**
 * Utility to conditionally join classNames together.
 * Usage: cn("a", cond && "b", "c") => "a b c"
 */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

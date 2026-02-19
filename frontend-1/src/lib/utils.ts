/**
 * Utility to conditionally join classNames together.
 * Usage: cn("a", cond && "b", "c") => "a b c"
 */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Fetch wrapper that redirects to /login on 401 Unauthorized.
 */
export async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    window.location.href = "/login";
    // Optionally, throw to prevent further processing
    throw new Error("Unauthorized: Redirecting to login");
  }
  return res;
}

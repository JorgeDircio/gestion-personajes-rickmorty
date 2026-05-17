export async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (typeof res.text === "function") {
    const text = await res.text();
    if (!text.trim()) {
      throw new SyntaxError("Empty JSON response");
    }
    return JSON.parse(text) as T;
  }
  return res.json() as Promise<T>;
}

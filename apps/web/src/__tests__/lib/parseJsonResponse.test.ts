import { parseJsonResponse } from "@/lib/parseJsonResponse";

describe("parseJsonResponse", () => {
  it("parses and returns JSON from the response text", async () => {
    const res = {
      text: async () => JSON.stringify({ id: 1, name: "Rick" }),
    } as unknown as Response;

    const result = await parseJsonResponse<{ id: number; name: string }>(res);
    expect(result).toEqual({ id: 1, name: "Rick" });
  });

  it("throws SyntaxError when the body is empty", async () => {
    const res = { text: async () => "   " } as unknown as Response;

    await expect(parseJsonResponse(res)).rejects.toThrow(SyntaxError);
    await expect(parseJsonResponse(res)).rejects.toThrow("Empty JSON response");
  });

  it("falls back to res.json() when text method is not available", async () => {
    const data = [{ id: 2 }];
    const res = { json: async () => data } as unknown as Response;

    const result = await parseJsonResponse<typeof data>(res);
    expect(result).toEqual(data);
  });
});

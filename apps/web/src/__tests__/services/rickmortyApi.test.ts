import { fetchCharacters, fetchCharacterById } from "@/services/rickmortyApi";
import { ENV } from "@/lib/env";
import { Character, CharactersResponse } from "@/types";

const BASE = ENV.RICK_MORTY_API_URL;

const mockCharacter: Character = {
  id: 1,
  name: "Rick Sanchez",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  origin: { name: "Earth", url: "" },
  location: { name: "Earth", url: "" },
  image: "",
  episode: [],
  url: "",
  created: "",
};

const mockResponse: CharactersResponse = {
  info: { count: 1, pages: 1, next: null, prev: null },
  results: [mockCharacter],
};

describe("rickmortyApi", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  describe("fetchCharacters", () => {
    it("fetches without filters", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchCharacters();

      expect(fetch).toHaveBeenCalledWith(
        `${BASE}/character?`,
        expect.objectContaining({ cache: "no-store" })
      );
      expect(result).toEqual(mockResponse);
    });

    it("appends name filter to query string", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchCharacters({ name: "Rick" });

      const url = (fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain("name=Rick");
    });

    it("appends page filter to query string", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchCharacters({ page: 2 });

      const url = (fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain("page=2");
    });

    it("appends multiple filters at once", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchCharacters({ name: "Morty", page: 3 });

      const url = (fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain("name=Morty");
      expect(url).toContain("page=3");
    });

    it("throws when response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

      await expect(fetchCharacters()).rejects.toThrow(
        "Failed to fetch characters"
      );
    });

    it("does not include status param when status is empty string", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchCharacters({ status: "" });

      const url = (fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).not.toContain("status=");
    });
  });

  describe("fetchCharacterById", () => {
    it("fetches character by id", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCharacter,
      });

      const result = await fetchCharacterById(1);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE}/character/1`,
        expect.objectContaining({ cache: "no-store" })
      );
      expect(result).toEqual(mockCharacter);
    });

    it("throws when character is not found", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

      await expect(fetchCharacterById(999)).rejects.toThrow(
        "Character 999 not found"
      );
    });
  });
});

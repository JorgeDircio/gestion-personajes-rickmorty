import { renderHook, waitFor, act } from "@testing-library/react";
import { useCharacterScene } from "@/hooks/useCharacterScene";
import * as rickmortyApi from "@/services/rickmortyApi";
import * as isMobileHook from "@/hooks/useIsMobile";
import { CharactersResponse } from "@/types";

jest.mock("@/services/rickmortyApi");
jest.mock("@/hooks/useIsMobile");

const mockResponse: CharactersResponse = {
  info: { count: 2, pages: 1, next: null, prev: null },
  results: [
    {
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
    },
    {
      id: 2,
      name: "Morty Smith",
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
    },
  ],
};

async function waitForSceneLoaded(
  result: { current: ReturnType<typeof useCharacterScene> }
) {
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
}

describe("useCharacterScene", () => {
  beforeEach(() => {
    jest.spyOn(isMobileHook, "useIsMobile").mockReturnValue(false);
    jest.spyOn(rickmortyApi, "fetchCharacters").mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("starts with loading=true", async () => {
    jest.spyOn(rickmortyApi, "fetchCharacters").mockImplementation(
      () => new Promise(() => {})
    );

    const { result, unmount } = renderHook(() => useCharacterScene());

    expect(result.current.loading).toBe(true);

    unmount();
  });

  it("loads characters and selects the first one after fetch", async () => {
    const { result } = renderHook(() => useCharacterScene());
    await waitForSceneLoaded(result);
    expect(result.current.results).toHaveLength(2);
    expect(result.current.selectedCharacter?.id).toBe(1);
  });

  it("exposes error message when fetch fails", async () => {
    jest
      .spyOn(rickmortyApi, "fetchCharacters")
      .mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useCharacterScene());
    await waitForSceneLoaded(result);
    expect(result.current.error).toBe("No se encontraron personajes.");
    expect(result.current.results).toHaveLength(0);
  });

  it("selectCharacter updates selectedCharacter", async () => {
    const { result } = renderHook(() => useCharacterScene());
    await waitForSceneLoaded(result);

    act(() => {
      result.current.selectCharacter(2);
    });

    expect(result.current.selectedCharacter?.id).toBe(2);
  });

  it("handleSearch triggers a new fetch with the name filter", async () => {
    const { result } = renderHook(() => useCharacterScene());
    await waitForSceneLoaded(result);

    await act(async () => {
      result.current.handleSearch("Morty");
    });

    await waitForSceneLoaded(result);

    expect(rickmortyApi.fetchCharacters).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "Morty", page: 1 })
    );
  });

  it("canScrollDown is false when all results fit in the grid and there is no next page", async () => {
    const { result } = renderHook(() => useCharacterScene());
    await waitForSceneLoaded(result);
    expect(result.current.canScrollDown).toBe(false);
  });
});

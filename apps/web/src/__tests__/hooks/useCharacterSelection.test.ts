import { renderHook, act } from "@testing-library/react";
import { useCharacterSelection } from "@/hooks/characterScene/useCharacterSelection";
import { Character, CharactersResponse } from "@/types";

function makeChar(id: number): Character {
  return {
    id,
    name: `Character ${id}`,
    status: "Alive",
    species: "Human",
    type: "",
    gender: "Male",
    origin: { name: "", url: "" },
    location: { name: "", url: "" },
    image: "",
    episode: [],
    url: "",
    created: "",
  };
}

const threeChars = [1, 2, 3].map(makeChar);

function makeParams(overrides: Partial<Parameters<typeof useCharacterSelection>[0]> = {}) {
  return {
    results: threeChars,
    visibleCharacters: threeChars,
    selectedId: 1 as number | null,
    setSelectedId: jest.fn(),
    setData: jest.fn(),
    alignGridToCharacter: jest.fn(),
    resetGrid: jest.fn(),
    hasPrevPage: false,
    onRequestPrevPage: jest.fn(),
    ...overrides,
  };
}

describe("useCharacterSelection", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("selectedCharacter", () => {
    it("returns the character matching selectedId", () => {
      const { result } = renderHook(() => useCharacterSelection(makeParams({ selectedId: 2 })));
      expect(result.current.selectedCharacter?.id).toBe(2);
    });

    it("falls back to the first visible character when selectedId is null", () => {
      const { result } = renderHook(() =>
        useCharacterSelection(makeParams({ selectedId: null }))
      );
      expect(result.current.selectedCharacter?.id).toBe(1);
    });

    it("returns null when results and visibleCharacters are empty", () => {
      const { result } = renderHook(() =>
        useCharacterSelection(
          makeParams({ results: [], visibleCharacters: [], selectedId: null })
        )
      );
      expect(result.current.selectedCharacter).toBeNull();
    });
  });

  describe("canCarouselPrev / canCarouselNext", () => {
    it("canCarouselPrev is false when first character is selected and no prev page", () => {
      const { result } = renderHook(() => useCharacterSelection(makeParams({ selectedId: 1 })));
      expect(result.current.canCarouselPrev).toBe(false);
    });

    it("canCarouselPrev is true on first character when hasPrevPage", () => {
      const { result } = renderHook(() =>
        useCharacterSelection(makeParams({ selectedId: 1, hasPrevPage: true }))
      );
      expect(result.current.canCarouselPrev).toBe(true);
    });

    it("canCarouselPrev is true when not on the first character", () => {
      const { result } = renderHook(() => useCharacterSelection(makeParams({ selectedId: 2 })));
      expect(result.current.canCarouselPrev).toBe(true);
    });

    it("canCarouselNext is true when not on the last character", () => {
      const { result } = renderHook(() => useCharacterSelection(makeParams({ selectedId: 1 })));
      expect(result.current.canCarouselNext).toBe(true);
    });

    it("canCarouselNext is false when last character is selected", () => {
      const { result } = renderHook(() => useCharacterSelection(makeParams({ selectedId: 3 })));
      expect(result.current.canCarouselNext).toBe(false);
    });
  });

  describe("selectCharacter", () => {
    it("calls alignGridToCharacter and setSelectedId", () => {
      const setSelectedId = jest.fn();
      const alignGridToCharacter = jest.fn();
      const { result } = renderHook(() =>
        useCharacterSelection(makeParams({ setSelectedId, alignGridToCharacter }))
      );
      act(() => { result.current.selectCharacter(3); });
      expect(alignGridToCharacter).toHaveBeenCalledWith(3);
      expect(setSelectedId).toHaveBeenCalledWith(3);
    });
  });

  describe("handleCarouselPrev", () => {
    it("moves to the previous character", () => {
      const setSelectedId = jest.fn();
      const { result } = renderHook(() =>
        useCharacterSelection(makeParams({ selectedId: 2, setSelectedId }))
      );
      act(() => { result.current.handleCarouselPrev(); });
      expect(setSelectedId).toHaveBeenCalledWith(1);
    });

    it("does nothing when on the first character without prev page", () => {
      const setSelectedId = jest.fn();
      const onRequestPrevPage = jest.fn();
      const { result } = renderHook(() =>
        useCharacterSelection(
          makeParams({ selectedId: 1, setSelectedId, onRequestPrevPage })
        )
      );
      act(() => { result.current.handleCarouselPrev(); });
      expect(setSelectedId).not.toHaveBeenCalled();
      expect(onRequestPrevPage).not.toHaveBeenCalled();
    });

    it("requests prev page when on the first character and hasPrevPage", () => {
      const onRequestPrevPage = jest.fn();
      const { result } = renderHook(() =>
        useCharacterSelection(
          makeParams({ selectedId: 1, hasPrevPage: true, onRequestPrevPage })
        )
      );
      act(() => { result.current.handleCarouselPrev(); });
      expect(onRequestPrevPage).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleCarouselNext", () => {
    it("moves to the next character", () => {
      const setSelectedId = jest.fn();
      const onRequestNextPage = jest.fn();
      const { result } = renderHook(() =>
        useCharacterSelection(makeParams({ selectedId: 1, setSelectedId }))
      );
      act(() => { result.current.handleCarouselNext(onRequestNextPage); });
      expect(setSelectedId).toHaveBeenCalledWith(2);
      expect(onRequestNextPage).not.toHaveBeenCalled();
    });

    it("calls onRequestNextPage when on the last character", () => {
      const setSelectedId = jest.fn();
      const onRequestNextPage = jest.fn();
      const { result } = renderHook(() =>
        useCharacterSelection(makeParams({ selectedId: 3, setSelectedId }))
      );
      act(() => { result.current.handleCarouselNext(onRequestNextPage); });
      expect(onRequestNextPage).toHaveBeenCalledTimes(1);
      expect(setSelectedId).not.toHaveBeenCalled();
    });
  });

  describe("showCharacterPreview", () => {
    it("replaces data with a single-character response", () => {
      const setData = jest.fn();
      const resetGrid = jest.fn();
      const setSelectedId = jest.fn();
      const { result } = renderHook(() =>
        useCharacterSelection(makeParams({ setData, resetGrid, setSelectedId }))
      );
      const previewChar = makeChar(99);
      act(() => { result.current.showCharacterPreview(previewChar); });

      expect(setData).toHaveBeenCalledWith<[CharactersResponse]>({
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [previewChar],
      });
      expect(resetGrid).toHaveBeenCalledTimes(1);
      expect(setSelectedId).toHaveBeenCalledWith(99);
    });
  });
});

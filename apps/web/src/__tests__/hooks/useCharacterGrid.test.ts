import { renderHook, act } from "@testing-library/react";
import { useCharacterGrid } from "@/hooks/characterScene/useCharacterGrid";
import { Character } from "@/types";

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

const eightChars = [1, 2, 3, 4, 5, 6, 7, 8].map(makeChar);

function makeParams(overrides: Partial<Parameters<typeof useCharacterGrid>[0]> = {}) {
  return {
    results: eightChars,
    gridSize: 4,
    selectedId: 1 as number | null,
    setSelectedId: jest.fn(),
    isMobile: false,
    hasNextPage: false,
    hasPrevPage: false,
    onRequestNextPage: jest.fn(),
    onRequestPrevPage: jest.fn(),
    ...overrides,
  };
}

describe("useCharacterGrid", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("initial state", () => {
    it("shows the first gridSize characters", () => {
      const { result } = renderHook(() => useCharacterGrid(makeParams()));
      expect(result.current.visibleCharacters.map((c) => c.id)).toEqual([1, 2, 3, 4]);
    });

    it("canScrollUp is false at start", () => {
      const { result } = renderHook(() => useCharacterGrid(makeParams()));
      expect(result.current.canScrollUp).toBe(false);
    });

    it("canScrollDown is true when results exceed gridSize", () => {
      const { result } = renderHook(() => useCharacterGrid(makeParams()));
      expect(result.current.canScrollDown).toBe(true);
    });

    it("canScrollDown is false when all results fit in one page", () => {
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ results: eightChars.slice(0, 4) }))
      );
      expect(result.current.canScrollDown).toBe(false);
    });
  });

  describe("handleScrollDown", () => {
    it("advances to the next page of results", () => {
      const { result } = renderHook(() => useCharacterGrid(makeParams()));
      act(() => { result.current.handleScrollDown(); });
      expect(result.current.visibleCharacters.map((c) => c.id)).toEqual([5, 6, 7, 8]);
    });

    it("enables canScrollUp after scrolling down", () => {
      const { result } = renderHook(() => useCharacterGrid(makeParams()));
      act(() => { result.current.handleScrollDown(); });
      expect(result.current.canScrollUp).toBe(true);
    });

    it("disables canScrollDown on the last page without next API page", () => {
      const { result } = renderHook(() => useCharacterGrid(makeParams()));
      act(() => { result.current.handleScrollDown(); });
      expect(result.current.canScrollDown).toBe(false);
    });

    it("canScrollDown stays true on last page when hasNextPage", () => {
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ hasNextPage: true }))
      );
      act(() => { result.current.handleScrollDown(); });
      expect(result.current.canScrollDown).toBe(true);
    });

    it("calls onRequestNextPage when at the end and hasNextPage is true", () => {
      const onRequestNextPage = jest.fn();
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ hasNextPage: true, onRequestNextPage }))
      );
      act(() => { result.current.handleScrollDown(); }); // page 2
      act(() => { result.current.handleScrollDown(); }); // end → next page request
      expect(onRequestNextPage).toHaveBeenCalledTimes(1);
    });

    it("does not call onRequestNextPage at the end without hasNextPage", () => {
      const onRequestNextPage = jest.fn();
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ onRequestNextPage }))
      );
      act(() => { result.current.handleScrollDown(); });
      act(() => { result.current.handleScrollDown(); });
      expect(onRequestNextPage).not.toHaveBeenCalled();
    });

    it("calls setSelectedId with first visible char when selection leaves view", () => {
      const setSelectedId = jest.fn();
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ setSelectedId, selectedId: 1 }))
      );
      act(() => { result.current.handleScrollDown(); });
      expect(setSelectedId).toHaveBeenCalledWith(5);
    });

    it("does not call setSelectedId when selected character stays in view", () => {
      const setSelectedId = jest.fn();
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ setSelectedId, selectedId: 5 }))
      );
      act(() => { result.current.handleScrollDown(); });
      expect(setSelectedId).not.toHaveBeenCalled();
    });
  });

  describe("handleScrollUp", () => {
    it("returns to the previous page", () => {
      const { result } = renderHook(() => useCharacterGrid(makeParams()));
      act(() => { result.current.handleScrollDown(); });
      act(() => { result.current.handleScrollUp(); });
      expect(result.current.visibleCharacters.map((c) => c.id)).toEqual([1, 2, 3, 4]);
    });

    it("disables canScrollUp after returning to the first page", () => {
      const { result } = renderHook(() => useCharacterGrid(makeParams()));
      act(() => { result.current.handleScrollDown(); });
      act(() => { result.current.handleScrollUp(); });
      expect(result.current.canScrollUp).toBe(false);
    });

    it("does not go below offset 0", () => {
      const { result } = renderHook(() => useCharacterGrid(makeParams()));
      act(() => { result.current.handleScrollUp(); });
      expect(result.current.visibleCharacters.map((c) => c.id)).toEqual([1, 2, 3, 4]);
    });

    it("calls onRequestPrevPage when at top and hasPrevPage", () => {
      const onRequestPrevPage = jest.fn();
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ hasPrevPage: true, onRequestPrevPage }))
      );
      act(() => { result.current.handleScrollUp(); });
      expect(onRequestPrevPage).toHaveBeenCalledTimes(1);
    });

    it("canScrollUp is true at offset 0 when hasPrevPage", () => {
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ hasPrevPage: true }))
      );
      expect(result.current.canScrollUp).toBe(true);
    });
  });

  describe("resetGrid", () => {
    it("resets offset to 0 after scrolling", () => {
      const { result } = renderHook(() => useCharacterGrid(makeParams()));
      act(() => { result.current.handleScrollDown(); });
      act(() => { result.current.resetGrid(); });
      expect(result.current.visibleCharacters.map((c) => c.id)).toEqual([1, 2, 3, 4]);
    });
  });

  describe("alignGridToCharacter", () => {
    it("does nothing on desktop (isMobile=false)", () => {
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ isMobile: false }))
      );
      act(() => { result.current.alignGridToCharacter(6); });
      expect(result.current.visibleCharacters[0].id).toBe(1);
    });

    it("aligns grid offset to the character row on mobile", () => {
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ isMobile: true, gridSize: 2 }))
      );
      act(() => { result.current.alignGridToCharacter(5); });
      expect(result.current.visibleCharacters[0].id).toBe(5);
    });

    it("does nothing when characterId is not found", () => {
      const { result } = renderHook(() =>
        useCharacterGrid(makeParams({ isMobile: true, gridSize: 2 }))
      );
      act(() => { result.current.alignGridToCharacter(999); });
      expect(result.current.visibleCharacters[0].id).toBe(1);
    });
  });
});

import type { Dispatch, SetStateAction } from "react";
import { Character, CharactersResponse } from "@/types";

export interface CharacterSceneNavigation {
  results: Character[];
  selectCharacter: (id: number) => void;
  showCharacterPreview: (character: Character) => void;
  reload: () => void;
}

export type PageNavigation = "initial" | "forward" | "backward";

export interface CharactersQueryState {
  data: CharactersResponse | null;
  loading: boolean;
  error: string | null;
  results: Character[];
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  searchPending: boolean;
  handleSearch: (name: string) => void;
  reload: () => void;
  setData: Dispatch<SetStateAction<CharactersResponse | null>>;
  requestNextPage: () => void;
  requestPrevPage: () => void;
  consumePageNavigation: () => PageNavigation;
}

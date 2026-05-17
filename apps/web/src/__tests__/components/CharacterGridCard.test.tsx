import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CharacterGridCard from "@/components/CharacterGridCard";
import { Character } from "@/types";

const mockCharacter: Character = {
  id: 1,
  name: "Rick Sanchez",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  origin: { name: "Earth", url: "" },
  location: { name: "Earth", url: "" },
  image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  episode: [],
  url: "",
  created: "",
};

const defaultProps = {
  character: mockCharacter,
  isSelected: false,
  isFavorite: false,
  onSelect: jest.fn(),
  onToggleFavorite: jest.fn(),
};

describe("CharacterGridCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the first word of the name uppercased", () => {
    render(<CharacterGridCard {...defaultProps} />);
    expect(screen.getByText("RICK")).toBeInTheDocument();
  });

  it("shows 'Agregar a favoritos' aria-label when not a favorite", () => {
    render(<CharacterGridCard {...defaultProps} isFavorite={false} />);
    expect(screen.getByRole("button", { name: "Agregar a favoritos" })).toBeInTheDocument();
  });

  it("shows 'Quitar de favoritos' aria-label when it is a favorite", () => {
    render(<CharacterGridCard {...defaultProps} isFavorite={true} />);
    expect(screen.getByRole("button", { name: "Quitar de favoritos" })).toBeInTheDocument();
  });

  it("calls onSelect when the card is clicked", async () => {
    const user = userEvent.setup();
    render(<CharacterGridCard {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Seleccionar Rick Sanchez/i }));
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it("calls onToggleFavorite but not onSelect when the like button is clicked", async () => {
    const user = userEvent.setup();
    render(<CharacterGridCard {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Agregar a favoritos" }));
    expect(defaultProps.onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it("disables the like button when disabled prop is true", () => {
    render(<CharacterGridCard {...defaultProps} disabled={true} />);
    expect(screen.getByRole("button", { name: "Agregar a favoritos" })).toBeDisabled();
  });

  it("sets aria-pressed to true when isSelected", () => {
    render(<CharacterGridCard {...defaultProps} isSelected={true} />);
    expect(screen.getByRole("button", { name: /Seleccionar Rick Sanchez/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("activates onSelect via Enter key", async () => {
    const user = userEvent.setup();
    render(<CharacterGridCard {...defaultProps} />);
    screen.getByRole("button", { name: /Seleccionar Rick Sanchez/i }).focus();
    await user.keyboard("{Enter}");
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });
});

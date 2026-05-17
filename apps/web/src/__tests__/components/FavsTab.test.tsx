import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FavsTab from "@/components/FavsTab";
import { Favorite } from "@/types";

const mockFavorites: Favorite[] = [
  { id: 1, characterId: 42, name: "Rick Sanchez", image: "", status: "Alive", species: "Human" },
  { id: 2, characterId: 2, name: "Morty Smith", image: "", status: "Alive", species: "Human" },
];

const defaultProps = {
  favorites: mockFavorites,
  onSelectFavorite: jest.fn(),
  onRemoveFavorite: jest.fn(),
};

describe("FavsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the FAVS toggle button", () => {
    render(<FavsTab {...defaultProps} />);
    expect(screen.getByRole("button", { name: /FAVS/i })).toBeInTheDocument();
  });

  it("dropdown is hidden by default", () => {
    render(<FavsTab {...defaultProps} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens the dropdown when button is clicked", async () => {
    const user = userEvent.setup();
    render(<FavsTab {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /FAVS/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows all favorites when open", async () => {
    const user = userEvent.setup();
    render(<FavsTab {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /FAVS/i }));
    expect(screen.getByText("RICK")).toBeInTheDocument();
    expect(screen.getByText("MORTY")).toBeInTheDocument();
  });

  it("shows 'Sin favoritos' when the list is empty", async () => {
    const user = userEvent.setup();
    render(<FavsTab {...defaultProps} favorites={[]} />);
    await user.click(screen.getByRole("button", { name: /FAVS/i }));
    expect(screen.getByText("Sin favoritos")).toBeInTheDocument();
  });

  it("calls onSelectFavorite and closes dropdown when a favorite is clicked", async () => {
    const user = userEvent.setup();
    render(<FavsTab {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /FAVS/i }));
    await user.click(screen.getByText("RICK"));
    expect(defaultProps.onSelectFavorite).toHaveBeenCalledWith(mockFavorites[0]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("calls onRemoveFavorite with characterId when remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<FavsTab {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /FAVS/i }));
    await user.click(screen.getByRole("button", { name: "Eliminar Rick Sanchez" }));
    expect(defaultProps.onRemoveFavorite).toHaveBeenCalledWith(42);
  });

  it("remove button click does not close the dropdown", async () => {
    const user = userEvent.setup();
    render(<FavsTab {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /FAVS/i }));
    await user.click(screen.getByRole("button", { name: "Eliminar Rick Sanchez" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("closes the dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <FavsTab {...defaultProps} />
        <div data-testid="outside">Outside</div>
      </div>
    );
    await user.click(screen.getByRole("button", { name: /FAVS/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

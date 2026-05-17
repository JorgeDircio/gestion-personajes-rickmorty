import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "@/components/SearchBar";

describe("SearchBar", () => {
  it("calls onSearch with trimmed value on submit", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByLabelText("Buscar personaje");
    await user.type(input, "  Morty  ");
    await user.keyboard("{Enter}");

    expect(onSearch).toHaveBeenCalledWith("Morty");
  });

  it("disables input and sets aria-busy when pending", () => {
    const { container } = render(<SearchBar onSearch={jest.fn()} pending />);

    expect(screen.getByLabelText("Buscar personaje")).toBeDisabled();
    expect(container.querySelector("form")).toHaveAttribute("aria-busy", "true");
  });
});

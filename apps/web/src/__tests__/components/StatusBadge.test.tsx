import { render, screen } from "@testing-library/react";
import StatusBadge from "@/components/StatusBadge";

describe("StatusBadge", () => {
  describe("default variant", () => {
    it("renders VIVO for Alive", () => {
      render(<StatusBadge status="Alive" />);
      expect(screen.getByText("VIVO")).toBeInTheDocument();
    });

    it("renders MUERTO for Dead", () => {
      render(<StatusBadge status="Dead" />);
      expect(screen.getByText("MUERTO")).toBeInTheDocument();
    });

    it("renders DESCONOCIDO for unknown", () => {
      render(<StatusBadge status="unknown" />);
      expect(screen.getByText("DESCONOCIDO")).toBeInTheDocument();
    });
  });

  describe("hero variant", () => {
    it("renders LIVE for Alive", () => {
      render(<StatusBadge status="Alive" variant="hero" />);
      expect(screen.getByText("LIVE")).toBeInTheDocument();
    });

    it("renders DEAD for Dead", () => {
      render(<StatusBadge status="Dead" variant="hero" />);
      expect(screen.getByText("DEAD")).toBeInTheDocument();
    });

    it("renders UNKNOWN for unknown", () => {
      render(<StatusBadge status="unknown" variant="hero" />);
      expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
    });
  });
});

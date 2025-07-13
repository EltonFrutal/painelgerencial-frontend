import { render, screen, waitFor } from "@testing-library/react";
import Resultados from "@/pages/resultados";
import axios from "axios";

// Mock do axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Página Resultados - /api/dre/por-nivel3", () => {
  it("renderiza a tabela com os dados de nivel3", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: [
          { nivel3: "SALÁRIOS - 18", total: -22513 },
          { nivel3: "ALUGUEL - 44", total: -18500 },
        ],
      },
    });

    render(<Resultados />);

    await waitFor(() => {
      expect(screen.getByText("SALÁRIOS - 18")).toBeInTheDocument();
      expect(screen.getByText("ALUGUEL - 44")).toBeInTheDocument();
      expect(screen.getByText("-22.513")).toBeInTheDocument();
      expect(screen.getByText("-18.500")).toBeInTheDocument();
    });
  });
});

// pages/vendas.tsx

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";

interface VendaData {
  label: string;
  total: number;
}

interface VendaDetalhada {
  pedido: string;
  cliente: string;
  vendedor: string;
  valorvenda: number;
  valorcusto: number;
  valorlucro: number;
}

const useResponsiveBarSize = (nivel: "ano" | "mes" | "dia") => {
  const [barSize, setBarSize] = useState(30);
  useEffect(() => {
    const updateBarSize = () => {
      const width = window.innerWidth;
      let newSize = 30;
      if (nivel === "ano") newSize = width < 500 ? 18 : width < 800 ? 25 : 30;
      else if (nivel === "mes") newSize = width < 500 ? 12 : width < 800 ? 16 : 20;
      else newSize = width < 500 ? 4 : width < 800 ? 6 : 8;
      setBarSize(newSize);
    };
    updateBarSize();
    window.addEventListener("resize", updateBarSize);
    return () => window.removeEventListener("resize", updateBarSize);
  }, [nivel]);
  return barSize;
};

const useLabelFontSize = () => {
  const [fontSize, setFontSize] = useState(12);
  useEffect(() => {
    const updateFontSize = () => {
      setFontSize(window.innerWidth < 500 ? 8 : 10);
    };
    updateFontSize();
    window.addEventListener("resize", updateFontSize);
    return () => window.removeEventListener("resize", updateFontSize);
  }, []);
  return fontSize;
};

const formatCompactNumber = (value: number) => {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value.toFixed(1);
};

export default function Vendas() {
  const [data, setData] = useState<VendaData[]>([]);
  const [nivel, setNivel] = useState<"ano" | "mes" | "dia">("ano");
  const [anoSelecionado, setAnoSelecionado] = useState<string | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [vendasDetalhadas, setVendasDetalhadas] = useState<VendaDetalhada[]>([]);

  const barSize = useResponsiveBarSize(nivel);
  const fontSize = useLabelFontSize();

  const fetchData = async (nivelFetch: "ano" | "mes" | "dia", ano?: string, mes?: string) => {
    try {
      const params: Record<string, string> = { nivel: nivelFetch };
      if (ano) params.ano = ano;
      if (mes) params.mes = mes;
      const response = await api.get("/api/vendas/analitico", { params });
      setData(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const fetchDetalhesDoDia = async (ano: string, mes: string, dia: string) => {
    try {
      const response = await api.get("/api/vendas/detalhes-dia", {
        params: {
          ano,
          mes,
          dia,
          idorganizacao: localStorage.getItem("idorganizacao")!,
        },
      });
      setVendasDetalhadas(response.data);
      setDiaSelecionado(dia);
    } catch (error) {
      console.error("Erro ao buscar detalhes do dia:", error);
    }
  };

  useEffect(() => {
    fetchData("ano");
    return () => setDiaSelecionado(null);
  }, []);

  const handleBarClick = (entry: VendaData) => {
    if (nivel === "ano") {
      setAnoSelecionado(entry.label);
      setNivel("mes");
      fetchData("mes", entry.label);
      setDiaSelecionado(null);
      setVendasDetalhadas([]);
    } else if (nivel === "mes") {
      setMesSelecionado(entry.label);
      setNivel("dia");
      fetchData("dia", anoSelecionado!, entry.label);
      setDiaSelecionado(null);
      setVendasDetalhadas([]);
    } else if (nivel === "dia") {
      setDiaSelecionado(entry.label);
      fetchDetalhesDoDia(anoSelecionado!, mesSelecionado!, entry.label);
    }
  };

  const handleVoltar = () => {
    if (nivel === "dia") {
      setNivel("mes");
      fetchData("mes", anoSelecionado!);
      setMesSelecionado(null);
      setDiaSelecionado(null);
      setVendasDetalhadas([]);
    } else if (nivel === "mes") {
      setNivel("ano");
      fetchData("ano");
      setAnoSelecionado(null);
      setMesSelecionado(null);
      setDiaSelecionado(null);
      setVendasDetalhadas([]);
    }
  };

  const titulo =
    nivel === "ano"
      ? "Vendas Anuais"
      : nivel === "mes"
      ? `Vendas Mensais - ${anoSelecionado}`
      : `Vendas Diárias - ${mesSelecionado?.padStart(2, "0")}/${anoSelecionado}`;

  return (
    <Layout titulo="Painel Gerencial" subtitulo="Vendas">
      <div className="flex justify-center items-center w-full h-full p-4">
        <div className="relative bg-white rounded-xl shadow p-4 w-full max-w-3xl">
          {nivel !== "ano" && (
            <button
              onClick={handleVoltar}
              className="absolute top-3 right-3 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              title="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <h2 className="text-center text-lg font-semibold mb-4">{titulo}</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barSize={barSize} barGap={10} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} activeBar={false}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={nivel === "dia" && entry.label === diaSelecionado ? "#eab308" : "#2563eb"}
                    onClick={() => handleBarClick(entry)}
                  />
                ))}
                <LabelList
                  dataKey="total"
                  position="top"
                  formatter={(label) => formatCompactNumber(Number(label))}
                  style={{ fontSize: fontSize }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* TABELA DE DETALHAMENTO */}
          {nivel === "dia" && diaSelecionado && (
            <div className="mt-4 max-h-64 overflow-y-auto border-t pt-2 text-[8px] sm:text-[10px] leading-none">
              <h3 className="font-semibold mb-2">
                Vendas do dia {diaSelecionado.padStart(2, "0")}/{mesSelecionado}/{anoSelecionado}
              </h3>
              <table className="w-full border text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-0.5">Pedido</th>
                    <th className="p-0.5">Cliente</th>
                    <th className="p-0.5">Vendedor</th>
                    <th className="p-0.5 text-right">Venda</th>
                    <th className="p-0.5 text-right">Custo</th>
                    <th className="p-0.5 text-right">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasDetalhadas.map((v, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-0.5">{v.pedido}</td>
                      <td className="p-0.5">{(v.cliente || "").substring(0, 15)}</td>
                      <td className="p-0.5">{(v.vendedor || "").substring(0, 15)}</td>
                      <td className="p-0.5 text-right">{Math.round(v.valorvenda).toLocaleString("pt-BR")}</td>
                      <td className="p-0.5 text-right">{Math.round(v.valorcusto).toLocaleString("pt-BR")}</td>
                      <td
                        className={`p-0.5 text-right ${v.valorlucro < 0 ? "text-red-500" : ""}`}
                      >
                        {Math.round(v.valorlucro).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}



// pages/vendas.tsx

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, LabelList, ResponsiveContainer, Rectangle } from "recharts";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";

interface VendaData {
    label: string;
    total: number;
}

const useResponsiveBarSize = (nivel: "ano" | "mes" | "dia") => {
    const [barSize, setBarSize] = useState(30);

    useEffect(() => {
        const updateBarSize = () => {
            const width = window.innerWidth;
            let newSize = 30;

            if (nivel === "ano") {
                newSize = width < 500 ? 18 : width < 800 ? 25 : 30;
            } else if (nivel === "mes") {
                newSize = width < 500 ? 12 : width < 800 ? 16 : 20;
            } else if (nivel === "dia") {
                newSize = width < 500 ? 4 : width < 800 ? 6 : 8;
            }

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
    if (value >= 1_000_000_000) {
        return (value / 1_000_000_000).toFixed(1) + 'B';
    } else if (value >= 1_000_000) {
        return (value / 1_000_000).toFixed(1) + 'M';
    } else if (value >= 1_000) {
        return (value / 1_000).toFixed(1) + 'K';
    } else {
        return value.toFixed(1);
    }
};

export default function Vendas() {
    const [data, setData] = useState<VendaData[]>([]);
    const [nivel, setNivel] = useState<"ano" | "mes" | "dia">("ano");
    const [anoSelecionado, setAnoSelecionado] = useState<string | null>(null);
    const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);

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

    useEffect(() => {
        fetchData("ano");
    }, []);

    const handleBarClick = (entry: VendaData) => {
        if (nivel === "ano") {
            setAnoSelecionado(entry.label);
            setNivel("mes");
            fetchData("mes", entry.label);
        } else if (nivel === "mes") {
            setMesSelecionado(entry.label);
            setNivel("dia");
            fetchData("dia", anoSelecionado!, entry.label);
        }
    };

    const handleVoltar = () => {
        if (nivel === "dia") {
            setNivel("mes");
            fetchData("mes", anoSelecionado!);
            setMesSelecionado(null);
        } else if (nivel === "mes") {
            setNivel("ano");
            fetchData("ano");
            setAnoSelecionado(null);
        }
    };

    const titulo = nivel === "ano" ? "Vendas Anuais" : nivel === "mes" ? `Vendas Mensais - ${anoSelecionado}` : `Vendas Diárias - ${mesSelecionado?.padStart(2, "0")}/${anoSelecionado}`;

    return (
        <Layout titulo="Painel Gerencial" subtitulo="Vendas">
            <div className="flex justify-center items-center w-full h-full p-4">
                <div className="relative bg-white rounded-xl shadow p-4 w-full max-w-3xl h-[420px]">
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

                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={data} barSize={barSize} barGap={10} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <Bar
                                dataKey="total"
                                fill="#2563eb"
                                radius={[4, 4, 0, 0]}
                                activeBar={<Rectangle fill="#2563eb" stroke="none" />} // impede borda preta ao clicar na barra
                                onClick={(data) => {
                                    if ("payload" in data) {
                                        handleBarClick((data as { payload: VendaData }).payload);
                                    }
                                }}
                            >
                                <LabelList
                                    dataKey="total"
                                    position="top"
                                    formatter={(label) => formatCompactNumber(Number(label))}
                                    style={{ fontSize: fontSize }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Layout>
    );
}

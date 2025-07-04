// pages/vendas.tsx

import { formatNumberShort } from "@/lib/utils";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    LabelList,
    ResponsiveContainer,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";

interface VendaData {
    label: string;
    total: number;
}

export default function Vendas() {
    const [data, setData] = useState<VendaData[]>([]);
    const [nivel, setNivel] = useState<"ano" | "mes" | "dia">("ano");
    const [anoSelecionado, setAnoSelecionado] = useState<string | null>(null);
    const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);

    const fetchData = async (
        nivelFetch: "ano" | "mes" | "dia",
        ano?: string,
        mes?: string
    ) => {
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
        const { label } = entry;
        if (nivel === "ano") {
            setAnoSelecionado(label);
            setNivel("mes");
            fetchData("mes", label);
        } else if (nivel === "mes") {
            setMesSelecionado(label);
            setNivel("dia");
            fetchData("dia", anoSelecionado!, label);
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

    const titulo =
        nivel === "ano"
            ? "Vendas Anuais"
            : nivel === "mes"
            ? `Vendas Mensais - ${anoSelecionado}`
            : `Vendas Diárias - ${mesSelecionado?.padStart(2, "0")}/${anoSelecionado}`;

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
                        <BarChart data={data} barSize={30} barGap={10}>
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis hide />
                            <Tooltip formatter={(value: number) => formatNumberShort(value)} />
                            <Bar
                                dataKey="total"
                                fill="#2563eb"
                                radius={[4, 4, 0, 0]}
                                onClick={(data) => {
                                    if ('payload' in data) {
                                        handleBarClick((data as { payload: VendaData }).payload);
                                    }
                                }}
                            >
                                <LabelList
                                    dataKey="total"
                                    position="top"
                                    formatter={(value: number) => formatNumberShort(value)}
                                    style={{ fontSize: 12 }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Layout>
    );
}

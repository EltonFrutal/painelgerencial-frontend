// PGWebIA - MenuPrincipal cards no topo centralizados horizontalmente

import Layout from "@/components/Layout";
import { DollarSign, Download, Upload, MinusCircle, RotateCcw, Package, ShoppingBag, BarChart, Gauge } from "lucide-react";
import { useRouter } from "next/router";

export default function MenuPrincipal() {
    const router = useRouter();

    const cards = [
        { label: "Vendas", icon: <DollarSign size={44} />, cor: "bg-orange-500", route: "/vendas" },
        { label: "A Receber", icon: <Download size={44} />, cor: "bg-green-500", route: "/a-receber" },
        { label: "A Pagar", icon: <MinusCircle size={44} />, cor: "bg-red-600", route: "/a-pagar" },
        { label: "Histórico", icon: <RotateCcw size={44} />, cor: "bg-blue-500", route: "/historico" },
        { label: "Estoque", icon: <Package size={44} />, cor: "bg-blue-700", route: "/estoque" },
        { label: "Compras", icon: <ShoppingBag size={44} />, cor: "bg-gray-800", route: "/compras" },
        { label: "Resultados", icon: <BarChart size={44} />, cor: "bg-yellow-500", route: "/resultados" },
        { label: "Indicadores", icon: <Gauge size={44} />, cor: "bg-purple-500", route: "/indicadores" },
    ];

    return (
        <Layout titulo="Painel Gerencial" subtitulo="Menu Principal">
            <div className="flex justify-center mt-8"> {/* Apenas topo confortável */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                    {cards.map((card, idx) => (
                        <button
                            key={idx}
                            onClick={() => router.push(card.route)}
                            className={`
                                ${card.cor} text-white 
                                flex flex-col items-center justify-center 
                                rounded-xl shadow 
                                w-24 h-24 sm:w-28 sm:h-28
                                hover:scale-105 transition-transform
                            `}
                        >
                            {card.icon}
                            <span className="mt-1 text-xs font-medium text-center">{card.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </Layout>
    );
}


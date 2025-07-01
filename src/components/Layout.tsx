// PGWebIA - Layout.tsx corrigido sem erro de hydration no Next.js

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    Home, DollarSign, Download, MinusCircle, RotateCcw,
    Package, ShoppingBag, BarChart, Gauge, LogOut, User, Building
} from "lucide-react";

interface LayoutProps {
    titulo: string;
    subtitulo: string;
    children: ReactNode;
}

export default function Layout({ titulo, subtitulo, children }: LayoutProps) {
    const router = useRouter();

    const [usuario, setUsuario] = useState("");
    const [organizacao, setOrganizacao] = useState("");
    const [idorganizacao, setIdOrganizacao] = useState("");
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        // Evita hydration failed no Next.js
        setHasMounted(true);

        if (typeof window !== "undefined") {
            setUsuario(localStorage.getItem("usuario") || "");
            setOrganizacao(localStorage.getItem("organizacao") || "");
            setIdOrganizacao(localStorage.getItem("idorganizacao") || "");
        }
    }, []);

    if (!hasMounted) {
        return null; // Evita render antes de montar
    }

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    const menuItems = [
        { icon: <Home size={24} />, route: "/menu-principal", label: "Menu" },
        { icon: <DollarSign size={24} />, route: "/vendas", label: "Vendas" },
        { icon: <Download size={24} />, route: "/a-receber", label: "A Receber" },
        { icon: <MinusCircle size={24} />, route: "/a-pagar", label: "A Pagar" },
        { icon: <RotateCcw size={24} />, route: "/historico", label: "Histórico" },
        { icon: <Package size={24} />, route: "/estoque", label: "Estoque" },
        { icon: <ShoppingBag size={24} />, route: "/compras", label: "Compras" },
        { icon: <BarChart size={24} />, route: "/resultados", label: "Resultados" },
        { icon: <Gauge size={24} />, route: "/indicadores", label: "Indicadores" },
    ];

    return (
        <div className="flex min-h-screen">

            {/* Menu lateral fixo - escondido em MOBILE */}
            <aside className="hidden md:flex w-20 bg-gradient-to-b from-blue-700 to-blue-500 text-white flex-col items-center py-4 space-y-1">
                {/* <img src="/images/Logo.png" alt="Logo" className="w-10 h-10 mb-2" /> */}
                {menuItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => router.push(item.route)}
                        title={item.label}
                        className={`flex flex-col items-center justify-center p-2 rounded hover:bg-blue-600 transition ${
                            router.pathname === item.route ? "bg-blue-800" : ""
                        }`}
                    >
                        {item.icon}
                        <span className="text-[10px] mt-1">{item.label}</span>
                    </button>
                ))}
                <div className="mt-auto mb-2">
                    <button
                        onClick={handleLogout}
                        title="Sair"
                        className="p-2 rounded bg-red-500 hover:bg-red-600 transition"
                    >
                        <LogOut size={24} />
                    </button>
                </div>
            </aside>

            {/* Área principal */}
            <div className="flex-1 flex flex-col">

                {/* Cabeçalho responsivo */}
                <header className="bg-white shadow p-3 flex flex-col md:flex-row md:justify-between md:items-center border-b">

                    {/* MOBILE: Home, Logo, Título centralizado */}
                    <div className="flex flex-col md:hidden w-full">
                        <div className="flex items-center justify-between w-full">
                            {/* Botão Home */}
                            <button onClick={() => router.push("/menu-principal")}>
                                <Home size={28} className="text-blue-700" />
                            </button>
                            {/* Logo + Título */}
                            <div className="flex flex-1 justify-center items-center gap-2">
                                <img src="/images/Logo.png" alt="Logo" className="w-6 h-6" />
                                <h1 className="text-lg font-bold text-blue-900">{titulo}</h1>
                            </div>
                            {/* Botão Logout */}
                            <button
                                onClick={handleLogout}
                                className="p-1 rounded bg-red-500 hover:bg-red-600 transition"
                                title="Sair"
                            >
                                <LogOut size={20} className="text-white" />
                            </button>
                        </div>
                        {/* Usuário e Organização abaixo */}
                        <div className="mt-1 text-xs text-gray-700 text-center">
                            {usuario} | {organizacao}{idorganizacao ? ` - ${idorganizacao}` : ""}
                        </div>
                    </div>

                    {/* DESKTOP: Título e Subtítulo */}
                    <div className="hidden md:block">
                        <div className="flex items-center gap-2">
    			<img 
        			src="/images/Logo.png" 
        			alt="Logo PGWebIA" 
        			className="w-8 h-8 hidden md:block" 
    				/>
    				<h1 className="text-xl font-bold">{titulo}</h1>
<			/div>
                        <h2 className="text-sm text-gray-500 md:pl-10">{subtitulo}</h2>
                    </div>

                    {/* DESKTOP: Usuário e Organização detalhados */}
                    <div className="hidden md:flex flex-col text-sm text-gray-700 text-right">
                        <div className="flex items-center justify-end gap-1">
                            <User size={14} />
                            <span>Usuário: {usuario}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            <Building size={14} />
                            <span>Organização: {organizacao} - {idorganizacao}</span>
                        </div>
                    </div>
                </header>

                {/* Conteúdo */}
                <main className="flex-1 p-4 bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}


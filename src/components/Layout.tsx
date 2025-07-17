// src/components/Layout.tsx

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
    Home, DollarSign, Download, MinusCircle, RotateCcw,
    Package, ShoppingBag, BarChart, Gauge, LogOut, User, Building, ShieldCheck
} from "lucide-react";

interface LayoutProps {
    titulo: string;
    subtitulo: string;
    children: ReactNode;
}

interface OrganizacaoAssessor {
    idorganizacao: number;
    nomeorganizacao: string;
}

export default function Layout({ titulo, subtitulo, children }: LayoutProps) {
    const router = useRouter();

    const [nome, setNome] = useState("");
    const [nomeOrganizacao, setNomeOrganizacao] = useState("");
    const [idOrganizacao, setIdOrganizacao] = useState("");
    const [tipoPerfil, setTipoPerfil] = useState("");
    const [hasMounted, setHasMounted] = useState(false);
    const [isSelectingOrg, setIsSelectingOrg] = useState(false);
    const [organizacoesAssessor, setOrganizacoesAssessor] = useState<OrganizacaoAssessor[]>([]);

    useEffect(() => {
        setHasMounted(true);
        if (typeof window !== "undefined") {
            setNome(localStorage.getItem("nome") || "");
            setNomeOrganizacao(localStorage.getItem("nome_organizacao") || "");
            setIdOrganizacao(localStorage.getItem("idorganizacao") || "");

            const idassessor = localStorage.getItem("idassessor");
            const admin = localStorage.getItem("admin");

            if (idassessor && admin === "true") setTipoPerfil("Admin");
            else if (idassessor) setTipoPerfil("Assessor");
            else setTipoPerfil("Usuário");

            if (idassessor) {
                try {
                    setOrganizacoesAssessor(JSON.parse(localStorage.getItem("organizacoes_assessor") || "[]"));
                } catch {
                    setOrganizacoesAssessor([]);
                }
            }
        }
    }, []);

    if (!hasMounted) return null;

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    const handleChangeOrg = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const org = organizacoesAssessor.find((o) => String(o.idorganizacao) === id);
        if (org) {
            localStorage.setItem("idorganizacao", String(org.idorganizacao));
            localStorage.setItem("nome_organizacao", org.nomeorganizacao);
            setNomeOrganizacao(org.nomeorganizacao);
            setIdOrganizacao(String(org.idorganizacao));
            setIsSelectingOrg(false);
            router.reload();
        }
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
            {/* Sidebar */}
            <aside className="hidden md:flex w-20 bg-gradient-to-b from-blue-700 to-blue-500 text-white flex-col items-center py-4 space-y-1">
                {menuItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => router.push(item.route)}
                        title={item.label}
                        className={`flex flex-col items-center justify-center p-2 rounded hover:bg-blue-600 transition ${router.pathname === item.route ? "bg-blue-800" : ""}`}
                    >
                        {item.icon}
                        <span className="text-[10px] mt-1">{item.label}</span>
                    </button>
                ))}
                {/* <div className="mt-auto mb-2">
                    <button
                        onClick={handleLogout}
                        title="Sair"
                        className="p-2 rounded bg-red-500 hover:bg-red-600 transition"
                    >
                        <LogOut size={24} />
                    </button>
                </div> */}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow p-3 flex flex-col md:flex-row md:justify-between md:items-start border-b">
                    <div className="flex items-center justify-between w-full md:justify-start md:gap-4">
                        {/* Home Mobile */}
                        <button onClick={() => router.push("/menu-principal")} className="block md:hidden">
                            <Home size={28} className="text-blue-700" />
                        </button>

                        {/* Logo, Título e Subtítulo */}
                        <div className="flex flex-1 justify-center md:justify-start items-center gap-4">
                            <Image src="/images/Logo.png" alt="Logo" width={40} height={40} className="w-10 h-10" />
                            <div className="hidden md:flex flex-col items-start">
                                <h1 className="text-xl font-bold text-blue-900">{titulo}</h1>
                                {subtitulo && <h2 className="text-sm text-gray-500">{subtitulo}</h2>}
                            </div>
                            <h1 className="text-lg font-bold text-blue-900 md:hidden">{titulo}</h1>
                        </div>

                        {/* Usuário, Organização e Botão Sair lado a lado no Desktop */}
                        <div className="hidden md:flex flex-row items-center gap-3">
                            {/* Usuário e Organização */}
                            <div className="flex flex-col text-sm text-gray-700">
                                <div className="flex items-center gap-1">
                                    {tipoPerfil === "Admin" && <ShieldCheck size={14} />}
                                    <User size={14} />
                                    <span>{tipoPerfil}: {nome}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Building size={14} />
                                    {tipoPerfil === "Assessor" || tipoPerfil === "Admin" ? (
                                        isSelectingOrg ? (
                                            <select
                                                value={idOrganizacao}
                                                onChange={handleChangeOrg}
                                                onBlur={() => setIsSelectingOrg(false)}
                                                className="border text-sm pl-2 pr-6 py-0.5 rounded"
                                            >
                                                {organizacoesAssessor.map((org) => (
                                                    <option key={org.idorganizacao} value={org.idorganizacao}>
                                                        {org.nomeorganizacao} ({org.idorganizacao})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <button
                                                onClick={() => setIsSelectingOrg(true)}
                                                className="text-blue-700 underline"
                                            >
                                                {nomeOrganizacao} ({idOrganizacao})
                                            </button>
                                        )
                                    ) : (
                                        <span>{nomeOrganizacao} ({idOrganizacao})</span>
                                    )}
                                </div>
                            </div>

                            {/* Botão Sair (agora após o bloco de usuário) */}
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded bg-red-500 hover:bg-red-600 transition"
                                title="Sair"
                            >
                                <LogOut size={20} className="text-white" />
                            </button>
                        </div>

                        {/* Botão Sair Mobile */}
                        <button
                            onClick={handleLogout}
                            className="p-1 rounded bg-red-500 hover:bg-red-600 transition md:hidden"
                            title="Sair"
                        >
                            <LogOut size={20} className="text-white" />
                        </button>
                    </div>

                    {/* Informações de Usuário e Organização Mobile */}
                    <div className="flex md:hidden justify-center items-center mt-2 text-xs text-gray-600 gap-3">
                        <div className="flex items-center gap-1">
                            {tipoPerfil === "Admin" && <ShieldCheck size={12} />}
                            <User size={12} />
                            <span>{tipoPerfil}: {nome}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Building size={12} />
                            {tipoPerfil === "Assessor" || tipoPerfil === "Admin" ? (
                                isSelectingOrg ? (
                                    <select
                                        value={idOrganizacao}
                                        onChange={handleChangeOrg}
                                        onBlur={() => setIsSelectingOrg(false)}
                                        className="border text-xs pl-1 pr-4 py-0.5 rounded"
                                    >
                                        {organizacoesAssessor.map((org) => (
                                            <option key={org.idorganizacao} value={org.idorganizacao}>
                                                {org.nomeorganizacao} ({org.idorganizacao})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <button
                                        onClick={() => setIsSelectingOrg(true)}
                                        className="text-blue-700 underline text-xs"
                                    >
                                        {nomeOrganizacao} ({idOrganizacao})
                                    </button>
                                )
                            ) : (
                                <span>{nomeOrganizacao} ({idOrganizacao})</span>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-2 md:p-4 bg-gray-50 md:bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}



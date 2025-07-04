// PGWebIA - Layout.tsx ajustado com troca de organização

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
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
    const [tipoPerfil, setTipoPerfil] = useState(""); // Usuário | Assessor | Admin
    const [hasMounted, setHasMounted] = useState(false);
    const [isSelectingOrg, setIsSelectingOrg] = useState(false);
    const [organizacoesAssessor, setOrganizacoesAssessor] = useState<OrganizacaoAssessor[]>([]);

    useEffect(() => {
        setHasMounted(true);
        if (typeof window !== "undefined") {
            const nomeStorage = localStorage.getItem("nome") || "";
            const nomeOrgStorage = localStorage.getItem("nome_organizacao") || "";
            const idOrgStorage = localStorage.getItem("idorganizacao") || "";

            setNome(nomeStorage);
            setNomeOrganizacao(nomeOrgStorage);
            setIdOrganizacao(idOrgStorage);

            const idassessor = localStorage.getItem("idassessor");
            const admin = localStorage.getItem("admin");

            if (idassessor && admin === "true") {
                setTipoPerfil("Admin");
            } else if (idassessor) {
                setTipoPerfil("Assessor");
            } else {
                setTipoPerfil("Usuário");
            }

            // Carrega lista de organizações caso seja assessor
            if (idassessor) {
                const orgsStorage = localStorage.getItem("organizacoes_assessor");
                if (orgsStorage) {
                    try {
                        setOrganizacoesAssessor(JSON.parse(orgsStorage));
                    } catch {
                        setOrganizacoesAssessor([]);
                    }
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

        // 🔄 Força reload da página atual para buscar os dados com o novo idorganizacao
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

            {/* Menu lateral fixo */}
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

                {/* Cabeçalho */}
                <header className="bg-white shadow p-3 flex flex-col md:flex-row md:justify-between md:items-center border-b">

                    {/* MOBILE */}
                    <div className="flex flex-col md:hidden w-full">
                        <div className="flex items-center justify-between w-full">
                            <button onClick={() => router.push("/menu-principal")}>
                                <Home size={28} className="text-blue-700" />
                            </button>
                            <div className="flex flex-1 justify-center items-center gap-2">
                                <img src="/images/Logo.png" alt="Logo" className="w-6 h-6" />
                                <h1 className="text-lg font-bold text-blue-900">{titulo}</h1>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1 rounded bg-red-500 hover:bg-red-600 transition"
                                title="Sair"
                            >
                                <LogOut size={20} className="text-white" />
                            </button>
                        </div>
                        <div className="mt-1 text-xs text-gray-700 text-center">
                            {tipoPerfil}: {nome} | Organização: {nomeOrganizacao} ({idOrganizacao})
                        </div>
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden md:block">
                        <div className="flex items-center gap-2">
                            <img src="/images/Logo.png" alt="Logo PGWebIA" className="w-8 h-8 hidden md:block" />
                            <h1 className="text-xl font-bold">{titulo}</h1>
                        </div>
                        <h2 className="text-sm text-gray-500 md:pl-10">{subtitulo}</h2>
                    </div>

                    <div className="hidden md:flex flex-col text-sm text-gray-700 text-right">
                        <div className="flex items-center justify-end gap-1">
                            {tipoPerfil === "Admin" && <ShieldCheck size={14} />}
                            <User size={14} />
                            <span>{tipoPerfil}: {nome}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            <Building size={14} />
                            {tipoPerfil === "Assessor" || tipoPerfil === "Admin" ? (
                                isSelectingOrg ? (
                                    <select
                                        value={idOrganizacao}
                                        onChange={handleChangeOrg}
                                        onBlur={() => setIsSelectingOrg(false)}
                                        className="border text-sm px-1 py-0.5 rounded"
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
                                        className="text-blue-700 underline text-sm"
                                        title="Trocar Organização"
                                    >
                                        Organização: {nomeOrganizacao} ({idOrganizacao})
                                    </button>
                                )
                            ) : (
                                <span>Organização: {nomeOrganizacao} ({idOrganizacao})</span>
                            )}
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


// src/pages/login-assessor.tsx

import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import { User, Lock, Eye, EyeOff } from "lucide-react";

interface OrganizacaoAssessor {
    idorganizacao: number;
    nomeorganizacao: string;
}

export default function LoginAssessor() {
    const [assessor, setAssessor] = useState("");
    const [senha, setSenha] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [organizacoes, setOrganizacoes] = useState<OrganizacaoAssessor[]>([]);
    const [selectedOrg, setSelectedOrg] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            console.log("Tentando fazer login com:", { assessor, senha });
            console.log("URL da API:", process.env.NEXT_PUBLIC_API_URL);
            
            const response = await api.post("/auth/login-assessor", { assessor, senha });
            console.log("Resposta do login:", response.data);
            
            const { token, assessor: nomeAssessor, idassessor, admin, organizacoes } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("nome", nomeAssessor);
            localStorage.setItem("idassessor", String(idassessor));
            localStorage.setItem("admin", admin ? "true" : "false");
            localStorage.setItem("organizacoes_assessor", JSON.stringify(organizacoes));

            setOrganizacoes(organizacoes);
        } catch (error: any) {
            console.error("Erro no login:", error);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Data:", error.response.data);
                console.error("Headers:", error.response.headers);
            }
            setError("Assessor ou senha inválidos.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrg = async () => {
        if (!selectedOrg) {
            alert("Selecione uma organização");
            return;
        }

        const orgSelecionada = organizacoes.find(org => org.idorganizacao === Number(selectedOrg));
        if (!orgSelecionada) {
            alert("Organização inválida.");
            return;
        }

        try {
            const oldToken = localStorage.getItem("token");
            const response = await api.post("/auth/assessor-set-org", {
                token: oldToken,
                idorganizacao: orgSelecionada.idorganizacao
            });

            const { token: newToken } = response.data;

            localStorage.setItem("token", newToken);
            localStorage.setItem("idorganizacao", String(orgSelecionada.idorganizacao));
            localStorage.setItem("nome_organizacao", orgSelecionada.nomeorganizacao);

            router.push("/menu-principal");
        } catch {
            alert("Erro ao confirmar a organização. Tente novamente.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-xs">
                <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-gradient-to-r from-blue-400 to-blue-600 p-3">
                        <User size={32} className="text-white" />
                    </div>
                </div>

                <div className="flex mb-4 border rounded-full overflow-hidden">
                    <button
                        onClick={() => router.push("/login")}
                        className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 transition"
                    >
                        Usuário
                    </button>
                    <button className="flex-1 py-2 bg-blue-500 text-white">
                        Assessor
                    </button>
                </div>

                <h2 className="text-center text-lg font-bold mb-4">Login de Assessor</h2>

                <div className="relative mb-3">
                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Assessor"
                        value={assessor}
                        onChange={(e) => setAssessor(e.target.value)}
                        className="w-full pl-8 p-2 border rounded"
                    />
                </div>

                <div className="relative mb-4">
                    <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full pl-8 pr-8 p-2 border rounded"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
                )}

                {organizacoes.length === 0 && (
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 rounded hover:from-blue-600 hover:to-blue-500 transition mb-2"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                )}

                {organizacoes.length > 0 && (
                    <>
                        <h2 className="text-center text-sm mb-2">Selecione a Organização</h2>
                        <div className="mb-4">
                            <select
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Selecione...</option>
                                {organizacoes.map((org) => (
                                    <option key={org.idorganizacao} value={org.idorganizacao}>
                                        {org.nomeorganizacao} ({org.idorganizacao})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleConfirmOrg}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 rounded hover:from-blue-600 hover:to-blue-500 transition"
                        >
                            Confirmar Organização
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// src/pages/login.tsx

import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import { Building, User, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [idOrganizacao, setIdOrganizacao] = useState("");
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!idOrganizacao || !usuario || !senha) {
            alert("Preencha todos os campos antes de entrar.");
            return;
        }

        try {
            const payload = { idorganizacao: Number(idOrganizacao), usuario, senha };

            const response = await api.post("/auth/login", payload);

            const { token, usuario: nomeUsuario, idusuario, organizacao, idorganizacao } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("nome", nomeUsuario);
            localStorage.setItem("idusuario", String(idusuario)); // opcional para gráficos
            localStorage.setItem("idorganizacao", String(idorganizacao));
            localStorage.setItem("nome_organizacao", organizacao); // ⚠️ ALTERAÇÃO AQUI

            router.push("/menu-principal");
        } catch (error) {
            console.error("Erro no login:", error);
            alert("Erro ao fazer login. Verifique suas credenciais.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-xs">
                <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-gradient-to-r from-blue-400 to-blue-600 p-3">
                        <User size={32} className="text-white" />
                    </div>
                </div>

                <div className="flex mb-4 border rounded-full overflow-hidden">
                    <button className="flex-1 py-2 bg-blue-500 text-white">
                        Usuário
                    </button>
                    <button
                        onClick={() => router.push("/login-assessor")}
                        className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 transition"
                    >
                        Assessor
                    </button>
                </div>

                <h2 className="text-center text-lg font-bold mb-4">Login de Usuário</h2>

                <div className="relative mb-3">
                    <Building className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="ID Organização"
                        value={idOrganizacao}
                        onChange={(e) => setIdOrganizacao(e.target.value)}
                        className="w-full pl-8 p-2 border rounded"
                    />
                </div>

                <div className="relative mb-3">
                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Usuário"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
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

                <button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 rounded hover:from-blue-600 hover:to-blue-500 transition"
                >
                    Entrar
                </button>
            </div>
        </div>
    );
}

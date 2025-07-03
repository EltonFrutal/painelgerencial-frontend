// src/pages/login.tsx

import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api"; // ✅ Alterado de axios para api centralizado
import { Building, User, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [isUsuario, setIsUsuario] = useState(true);
    const [idOrganizacao, setIdOrganizacao] = useState("");
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const endpoint = "/auth/login"; 

            const payload = isUsuario
                ? { idorganizacao: Number(idOrganizacao), usuario, senha }
                : { usuario, senha };

            // ✅ Agora usando api centralizado
            const response = await api.post(endpoint, payload);

            const { token, usuario: nomeUsuario, organizacao, idorganizacao } = response.data;
            console.log("LOGIN RESPONSE", response.data);

            localStorage.setItem("token", token);
            localStorage.setItem("usuario", nomeUsuario);
            localStorage.setItem("organizacao", organizacao);
            localStorage.setItem("idorganizacao", String(idorganizacao));

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
                    <button onClick={() => setIsUsuario(true)} className={`flex-1 py-2 ${isUsuario ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Usuário</button>
                    <button onClick={() => setIsUsuario(false)} className={`flex-1 py-2 ${!isUsuario ? "bg-blue-500 text-white" : "bg-gray-200"}`}>Assessor</button>
                </div>
                <h2 className="text-center text-lg font-bold mb-4">Login de {isUsuario ? "Usuário" : "Assessor"}</h2>

                {isUsuario && (
                    <div className="relative mb-3">
                        <Building className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="idOrganizacao"
                            value={idOrganizacao}
                            onChange={(e) => setIdOrganizacao(e.target.value)}
                            className="w-full pl-8 p-2 border rounded"
                        />
                    </div>
                )}

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

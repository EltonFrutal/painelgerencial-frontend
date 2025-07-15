"use client";

import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import axios from "axios";
import { Loader2, AlertTriangle, CreditCard, RefreshCw } from "lucide-react";

// ✅ Mock para teste (substituir por dados reais em produção)
const contasReceber = [
  { cliente: "João Silva", vencimento: "2025-07-10", valor: 1200.5, status: "Em aberto" },
  { cliente: "Maria Souza", vencimento: "2025-07-12", valor: 850.0, status: "Pago" },
  { cliente: "Empresa XYZ", vencimento: "2025-07-15", valor: 2100.0, status: "Atrasado" },
];

export default function AReceber() {
  const [resumoIA, setResumoIA] = useState<string | null>(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState<{tipo: string, mensagem: string} | null>(null);
  const resumoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (resumoIA && resumoRef.current) {
      resumoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [resumoIA]);

  async function gerarResumoIA() {
    try {
      setCarregandoIA(true);
      setResumoIA(null);
      setErroIA(null);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/openai/a-receber`,
        { dadosReceber: contasReceber }
      );

      if (response.data?.resumo) {
        setResumoIA(response.data.resumo);
      } else if (response.data?.erro) {
        setErroIA({
          tipo: "erro_api",
          mensagem: response.data.erro
        });
      } else {
        setErroIA({
          tipo: "erro_inesperado",
          mensagem: "Resposta inválida da IA."
        });
      }
    } catch (error: any) {
      console.error("🔴 Erro ao gerar resumo IA:", error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.erro || error?.response?.data?.message || "";
        
        if (errorMessage.includes("insufficient_quota") || 
            errorMessage.includes("quota") || 
            errorMessage.includes("credit") ||
            errorMessage.includes("billing")) {
          setErroIA({
            tipo: "sem_creditos",
            mensagem: "Créditos da IA esgotados. Entre em contato com o suporte para renovar o plano."
          });
        } else {
          setErroIA({
            tipo: "erro_configuracao",
            mensagem: "Erro de configuração da IA. Verifique as configurações do sistema."
          });
        }
      } else if (error?.response?.status === 401) {
        setErroIA({
          tipo: "erro_autenticacao",
          mensagem: "Falha na autenticação com o serviço de IA."
        });
      } else if (error?.response?.status === 429) {
        setErroIA({
          tipo: "limite_excedido",
          mensagem: "Limite de requisições excedido. Tente novamente em alguns minutos."
        });
      } else {
        setErroIA({
          tipo: "erro_conexao",
          mensagem: "Erro de conexão com o serviço de IA. Verifique sua conexão e tente novamente."
        });
      }
    } finally {
      setCarregandoIA(false);
    }
  }

  return (
    <Layout titulo="Painel Gerencial" subtitulo="Chat com IA - A Receber">
      <div className="flex flex-col gap-4 p-6">
        {/* Botão Gerar Resumo */}
        <div className="flex justify-center">
          <button
            onClick={gerarResumoIA}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            disabled={carregandoIA}
          >
            {carregandoIA && <Loader2 className="animate-spin" size={16} />}
            {carregandoIA ? "Gerando resumo..." : "Gerar Resumo IA"}
          </button>
        </div>

        {/* Bloco de Resumo IA ou Erro */}
        {resumoIA && (
          <div
            ref={resumoRef}
            className="max-w-3xl mx-auto p-4 mt-4 border-l-4 border-blue-500 bg-blue-50 text-blue-900 rounded shadow-sm whitespace-pre-wrap text-sm leading-relaxed"
          >
            <strong className="block mb-2">📋 Resumo IA:</strong>
            {resumoIA}
          </div>
        )}

        {/* Componente de Erro Profissional */}
        {erroIA && (
          <div
            ref={resumoRef}
            className="max-w-3xl mx-auto mt-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div className={`p-4 ${
              erroIA.tipo === "sem_creditos" ? "bg-orange-50 border-l-4 border-l-orange-400" :
              erroIA.tipo === "limite_excedido" ? "bg-yellow-50 border-l-4 border-l-yellow-400" :
              "bg-red-50 border-l-4 border-l-red-400"
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {erroIA.tipo === "sem_creditos" ? (
                    <CreditCard className={`h-5 w-5 ${
                      erroIA.tipo === "sem_creditos" ? "text-orange-400" : "text-red-400"
                    }`} />
                  ) : erroIA.tipo === "limite_excedido" ? (
                    <RefreshCw className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    erroIA.tipo === "sem_creditos" ? "text-orange-800" :
                    erroIA.tipo === "limite_excedido" ? "text-yellow-800" :
                    "text-red-800"
                  }`}>
                    {erroIA.tipo === "sem_creditos" ? "Créditos Esgotados" :
                     erroIA.tipo === "limite_excedido" ? "Limite Temporário Atingido" :
                     erroIA.tipo === "erro_autenticacao" ? "Erro de Autenticação" :
                     erroIA.tipo === "erro_configuracao" ? "Erro de Configuração" :
                     "Serviço Temporariamente Indisponível"}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    erroIA.tipo === "sem_creditos" ? "text-orange-700" :
                    erroIA.tipo === "limite_excedido" ? "text-yellow-700" :
                    "text-red-700"
                  }`}>
                    <p>{erroIA.mensagem}</p>
                  </div>
                  
                  {/* Ações específicas baseadas no tipo de erro */}
                  <div className="mt-4">
                    {erroIA.tipo === "sem_creditos" && (
                      <div className="bg-white p-3 rounded border border-orange-200">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Como resolver:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Entre em contato com o suporte técnico</li>
                          <li>• Solicite a renovação do plano de IA</li>
                          <li>• Ou aguarde a renovação automática do ciclo</li>
                        </ul>
                      </div>
                    )}
                    
                    {erroIA.tipo === "limite_excedido" && (
                      <div className="bg-white p-3 rounded border border-yellow-200">
                        <p className="text-sm text-gray-600">
                          <strong>Aguarde alguns minutos e tente novamente.</strong>
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={gerarResumoIA}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Tentar Novamente
                      </button>
                      
                      {erroIA.tipo === "sem_creditos" && (
                        <button
                          onClick={() => alert("Entre em contato: suporte@pgwebia.com")}
                          className="inline-flex items-center px-3 py-2 border border-orange-300 text-sm leading-4 font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          Contatar Suporte
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat IA */}
        <div className="flex justify-center">
          <Chat />
        </div>
      </div>
    </Layout>
  );
}



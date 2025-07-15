"use client";

import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { Loader2, AlertTriangle, CreditCard, RefreshCw } from "lucide-react";

interface ContaReceber {
  cliente: string;
  vencimento: string;
  valor: number;
  status: string;
}

export default function AReceber() {
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [carregandoContas, setCarregandoContas] = useState(false);
  const [resumoIA, setResumoIA] = useState<string | null>(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState<{tipo: string, mensagem: string} | null>(null);
  const resumoRef = useRef<HTMLDivElement | null>(null);

  // Buscar dados reais de contas a receber
  useEffect(() => {
    const buscarContasReceber = async () => {
      try {
        setCarregandoContas(true);
        const response = await api.get('/vendas/a-receber');
        setContasReceber(response.data);
      } catch (error) {
        console.error('Erro ao buscar contas a receber:', error);
        // Manter dados vazios em caso de erro
        setContasReceber([]);
      } finally {
        setCarregandoContas(false);
      }
    };

    buscarContasReceber();
  }, []);

  useEffect(() => {
    if (resumoIA && resumoRef.current) {
      resumoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [resumoIA]);

  async function gerarResumoIA() {
    if (contasReceber.length === 0) {
      setErroIA({
        tipo: "erro_dados",
        mensagem: "Nenhuma conta a receber encontrada para análise."
      });
      return;
    }

    try {
      setCarregandoIA(true);
      setResumoIA(null);
      setErroIA(null);

      const response = await api.post(
        "/api/openai/a-receber",
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
    } catch (error: unknown) {
      console.error("🔴 Erro ao gerar resumo IA:", error);
      
      // Tratamento específico para diferentes tipos de erro
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 400) {
        const errorMessage = (axiosError?.response?.data as any)?.erro || (axiosError?.response?.data as any)?.message || "";
        
        if (errorMessage.includes("insufficient_quota") || 
            errorMessage.includes("quota") || 
            errorMessage.includes("credit") ||
            errorMessage.includes("billing") ||
            errorMessage.includes("Créditos da IA esgotados") ||
            (axiosError?.response?.data as any)?.message === "insufficient_quota") {
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
      } else if (axiosError?.response?.status === 401) {
        setErroIA({
          tipo: "erro_autenticacao",
          mensagem: "Falha na autenticação com o serviço de IA."
        });
      } else if (axiosError?.response?.status === 429) {
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
        {/* Tabela de Contas a Receber */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Contas a Receber
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Dados reais das contas a receber da sua organização
            </p>
          </div>
          
          {carregandoContas ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              <span className="ml-2 text-gray-600">Carregando contas...</span>
            </div>
          ) : contasReceber.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma conta a receber encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contasReceber.map((conta, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {conta.cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(conta.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          conta.status === 'Em aberto' ? 'bg-yellow-100 text-yellow-800' :
                          conta.status === 'Atrasado' ? 'bg-red-100 text-red-800' :
                          conta.status === 'Vencido' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {conta.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Botão Gerar Resumo */}
        <div className="flex justify-center">
          <button
            onClick={gerarResumoIA}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            disabled={carregandoIA || contasReceber.length === 0}
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



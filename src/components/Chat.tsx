"use client";

import { useState } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { Send, AlertCircle, CreditCard, ExternalLink } from "lucide-react";

export default function Chat() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<{
    tipo: 'sem_creditos' | 'limite_excedido' | 'erro_autenticacao' | 'erro_generico' | null;
    mensagem: string;
  }>({ tipo: null, mensagem: '' });

  // 🚫 Temporariamente comentado para evitar erro 404
  /*
  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const idorganizacao = localStorage.getItem("idorganizacao");

        const response = await axios.get("/api/vendas/analitico", {
          params: { nivel: "mes", ano: "2025" },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (Array.isArray(response.data)) {
          const resumo = response.data
            .map((item: any) => `Mês ${item.mes}: R$ ${item.valorrealizado?.toFixed(2)}`)
            .join("\n");

          setContexto(`Resumo de vendas da organização ${idorganizacao} no ano de 2025:\n${resumo}`);
        }
      } catch (error) {
        console.error("Erro ao buscar dados de vendas:", error);
        setContexto("Não foi possível obter os dados de vendas.");
      }
    };

    fetchVendas();
  }, []);
  */

  const enviarPergunta = async () => {
    if (!pergunta.trim()) return;

    setLoading(true);
    setResposta("");
    setErro({ tipo: null, mensagem: '' });

    try {
      const res = await api.post("/ia", {
        pergunta,
        contexto: '',
      });

      setResposta(res.data.resposta);
    } catch (error: unknown) {
      console.error("Erro ao consultar IA:", error);
      
      // Detectar tipos específicos de erro
      const axiosError = error as AxiosError;
      const mensagemErro = (axiosError?.response?.data as any)?.message || axiosError?.message || 'Erro desconhecido';
      
      if (mensagemErro.includes('insufficient_quota') || 
          mensagemErro.includes('Créditos da IA esgotados') ||
          mensagemErro.includes('quota')) {
        setErro({
          tipo: 'sem_creditos',
          mensagem: 'Créditos da IA esgotados. Entre em contato conosco para renovar seu plano.'
        });
      } else if (mensagemErro.includes('rate_limit') || axiosError?.response?.status === 429) {
        setErro({
          tipo: 'limite_excedido',
          mensagem: 'Muitas solicitações feitas recentemente. Tente novamente em alguns momentos.'
        });
      } else if (axiosError?.response?.status === 401 || mensagemErro.includes('unauthorized')) {
        setErro({
          tipo: 'erro_autenticacao',
          mensagem: 'Problema de autenticação com o serviço de IA. Tente fazer login novamente.'
        });
      } else {
        setErro({
          tipo: 'erro_generico',
          mensagem: 'Ocorreu um erro inesperado. Tente novamente em alguns momentos.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 rounded-xl border bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-2">Assistente PGWebIA</h2>

      <textarea
        rows={3}
        className="w-full p-2 border rounded-md mb-2"
        placeholder="Digite sua pergunta..."
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
      />

      <button
        onClick={enviarPergunta}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        <Send size={16} />
        {loading ? "Consultando..." : "Enviar"}
      </button>

      {erro.tipo && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {erro.tipo === 'sem_creditos' && <CreditCard className="h-5 w-5 text-red-400" />}
              {erro.tipo !== 'sem_creditos' && <AlertCircle className="h-5 w-5 text-red-400" />}
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {erro.tipo === 'sem_creditos' && 'Créditos Esgotados'}
                {erro.tipo === 'limite_excedido' && 'Limite de Solicitações Excedido'}
                {erro.tipo === 'erro_autenticacao' && 'Erro de Autenticação'}
                {erro.tipo === 'erro_generico' && 'Erro no Serviço'}
              </h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{erro.mensagem}</p>
              </div>
              <div className="mt-3">
                {erro.tipo === 'sem_creditos' && (
                  <button 
                    onClick={() => window.open('mailto:suporte@pgwebia.com', '_blank')}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contatar Suporte
                  </button>
                )}
                {erro.tipo === 'limite_excedido' && (
                  <button 
                    onClick={() => setErro({ tipo: null, mensagem: '' })}
                    className="inline-flex items-center px-3 py-2 border border-orange-300 text-sm leading-4 font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Tentar Novamente
                  </button>
                )}
                {(erro.tipo === 'erro_autenticacao' || erro.tipo === 'erro_generico') && (
                  <button 
                    onClick={() => {
                      setErro({ tipo: null, mensagem: '' });
                      if (erro.tipo === 'erro_autenticacao') {
                        window.location.href = '/login';
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {erro.tipo === 'erro_autenticacao' ? 'Fazer Login' : 'Tentar Novamente'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {resposta && !erro.tipo && (
        <div className="mt-4 p-3 border rounded bg-gray-50 whitespace-pre-wrap">
          <strong>Resposta da IA:</strong>
          <p>{resposta}</p>
        </div>
      )}
    </div>
  );
}

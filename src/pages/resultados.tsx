"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import Layout from "@/components/Layout";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import FiltroMesesMobile from "@/components/FiltroMesesMobile";

interface DREItem {
  nivel1: string;
  nivel2?: string;
  nivel3?: string;
  valores: { [mes: number]: number; total: number };
}

const meses = Array.from({ length: 12 }, (_, i) => i + 1);

export default function Resultados() {
  const [dados, setDados] = useState<DREItem[]>([]);
  const [expandidoNivel1, setExpandidoNivel1] = useState<{ [key: string]: boolean }>({});
  const [expandidoNivel2, setExpandidoNivel2] = useState<{ [key: string]: boolean }>({});
  const [linha1, setLinha1] = useState<DREItem | null>(null);
  const [linha4, setLinha4] = useState<DREItem | null>(null);
  const [linha8, setLinha8] = useState<DREItem | null>(null);

  const anoAtual = new Date().getFullYear();
  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);
  const [modeloSelecionado, setModeloSelecionado] = useState("CMV");
  const mesAtual = new Date().getMonth() + 1;
  
  // Função para definir meses padrão baseado no ano
  const getMesesPadrao = useCallback((ano: number) => {
    if (ano === anoAtual) {
      // Se for o ano atual, seleciona apenas os meses anteriores ao mês atual
      const mesesAnteriores = mesAtual - 1;
      return mesesAnteriores > 0 ? Array.from({ length: mesesAnteriores }, (_, i) => i + 1) : [];
    } else {
      // Se for ano anterior, seleciona todos os meses
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
  }, [anoAtual, mesAtual]);
  
  const [mesesSelecionados, setMesesSelecionados] = useState<number[]>(getMesesPadrao(anoAtual));

// ⬇️ INSIRA AQUI
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth <= 768);
  checkMobile();
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);

// useEffect para atualizar meses selecionados quando o ano mudar
useEffect(() => {
  setMesesSelecionados(getMesesPadrao(anoSelecionado));
}, [anoSelecionado, getMesesPadrao]);

  useEffect(() => {
  async function carregar() {
    try {
      console.log("🔍 Iniciando carregamento da página de resultados...");
      const idOrganizacao = localStorage.getItem("idorganizacao");
      const token = localStorage.getItem("token");
      
      console.log("📊 Dados de autenticação:", {
        idOrganizacao: idOrganizacao,
        temToken: !!token,
        apiUrl: process.env.NEXT_PUBLIC_API_URL
      });
      
      if (!idOrganizacao) {
        console.warn("⚠️ Organização não definida no localStorage");
        return;
      }

      console.log("🌐 Fazendo requisição para DRE...");
      const response = await api.get("/api/dre/por-nivel1-e-nivel2-e-nivel3", {
        params: {
          idorganizacao: Number(idOrganizacao),
          modelo: modeloSelecionado,
          ano: anoSelecionado,
          tipo: "REALIZADO",
        },
      });

      console.log("✅ Resposta recebida:", response.data);
      const lista: DREItem[] = response.data.data;
      const ordenado = [...lista].sort((a, b) => a.nivel1.localeCompare(b.nivel1));
      setDados(ordenado);

      const fat = lista.find(d => d.nivel1.startsWith("1.0"));
      const cmv = lista.find(d => d.nivel1.startsWith("4.0"));
      const lucro = lista.find(d => d.nivel1.startsWith("8.0"));
      if (fat) setLinha1(fat);
      if (cmv) setLinha4(cmv);
      if (lucro) setLinha8(lucro);
    } catch (error: unknown) {
      console.error("❌ Erro ao buscar dados da DRE:", error);
      const axiosError = error as any;
      if (axiosError?.response) {
        console.error("📝 Detalhes do erro:", {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data
        });
      }
    }
  }

  carregar();
}, [anoSelecionado, modeloSelecionado]);

  const toggleNivel1 = (nivel1: string) => {
    setExpandidoNivel1(prev => ({ ...prev, [nivel1]: !prev[nivel1] }));
  };

  const toggleNivel2 = (chave: string) => {
    setExpandidoNivel2(prev => ({ ...prev, [chave]: !prev[chave] }));
  };

  const calcularMedia = (valores: { [mes: number]: number }) => {
  const soma = mesesSelecionados.reduce((acc, m) => acc + (valores[m] ?? 0), 0);
  const count = mesesSelecionados.filter(m => valores[m] !== 0).length;
  return count > 0 ? soma / count : 0;
};

  const calcularVar = (media: number, base: number) => {
    if (media === 0 || base === 0) return "-";
    return `${((media / base) * 100).toFixed(1)}%`;
  };

  const dadosAgrupados = dados.reduce((acc, item) => {
    if (!acc[item.nivel1]) acc[item.nivel1] = {};
    if (item.nivel2) {
      if (!acc[item.nivel1][item.nivel2]) acc[item.nivel1][item.nivel2] = [];
      acc[item.nivel1][item.nivel2].push(item);
    } else {
      if (!acc[item.nivel1]["_totais"]) acc[item.nivel1]["_totais"] = [];
      acc[item.nivel1]["_totais"].push(item);
    }
    return acc;
  }, {} as Record<string, Record<string, DREItem[]>>);

  return (
    <Layout titulo="Painel Gerencial" subtitulo="Resultados">
      <div className="p-4 pt-0">

<div className="mb-4 flex items-center gap-2">
  <label className="text-sm font-medium">Ano:</label>
  <div className="flex items-center border border-gray-300 rounded px-2">
    <button
      onClick={() => setAnoSelecionado(prev => prev - 1)}
      className="p-1 text-gray-600 hover:text-black"
    >
      <ChevronDown size={16} />
    </button>
    <span className="px-3 text-sm font-semibold w-12 text-center">{anoSelecionado}</span>
    <button
      onClick={() => setAnoSelecionado(prev => prev + 1)}
      className="p-1 text-gray-600 hover:text-black"
    >
      <ChevronUp size={16} />
    </button>
  </div>

  {/* Modelo */}
  <div className="flex items-center gap-2">
    <label className="text-sm font-medium">Modelo:</label>
    <select
      value={modeloSelecionado}
      onChange={(e) => setModeloSelecionado(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1 text-sm"
    >
      <option value="CMV">CMV</option>
      <option value="EMISSAO">EMISSÃO</option>
      <option value="ENTRADA">ENTRADA</option>
      <option value="PAGAMENTO">PAGAMENTO</option>
    </select>
  </div>
</div>

<FiltroMesesMobile
  meses={meses}
  selecionados={mesesSelecionados}
  onChange={setMesesSelecionados}
/>

        <table className="w-full border border-gray-300 text-xs">
          <thead className="bg-amber-600 text-white">
            <tr>
              <th className="text-left px-2 py-1 border-b">DRE - Realizada</th>
              {!isMobile &&
                meses.map(mes => (
                  <th key={mes} className="text-right px-2 py-1 border-b w-16">
                    <div className="flex items-center justify-end gap-1">
                      {anoSelecionado === anoAtual && mes === mesAtual && (
                        <div className="w-3 h-3 rounded-full border border-black relative overflow-hidden">
                          <div className="w-1/2 h-full bg-black"></div>
                        </div>
                      )}
                      {mes}
                    </div>
                  </th>
                ))}
              <th className="text-right px-2 py-1 border-b w-20">Total</th>
              <th className="text-right px-2 py-1 border-b w-20">Média</th>
              <th className="text-right px-2 py-1 border-b w-20">Var %</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(dadosAgrupados)
              .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
              .map(([nivel1, subnivel2]) => {
                const isDespesas = nivel1.startsWith("7.0");
                const isOpen = expandidoNivel1[nivel1] ?? false;

                const totaisNivel1 = Object.values(subnivel2).flat().reduce((acc, item) => {
  		mesesSelecionados.forEach(m => acc[m] = (acc[m] ?? 0) + (item.valores[m] ?? 0));
  		acc.total = mesesSelecionados.reduce((soma, m) => soma + (acc[m] ?? 0), 0);
  		return acc;
		}, {} as { [mes: number]: number; total: number });

                const media = calcularMedia(totaisNivel1);
                const varPercent = linha1 ? calcularVar(media, calcularMedia(linha1.valores)) : "-";

                return (
                  <>
                    {(nivel1.startsWith("4.0") || nivel1.startsWith("7.0")) && (
  <tr>
    <td colSpan={meses.length + 4} className="py-1" />
  </tr>
)}

                    <tr
                      key={nivel1}
                      className={`font-bold cursor-pointer ${
                        nivel1.startsWith("1.0") || nivel1.startsWith("2.0") || nivel1.startsWith("3.0")
                          ? "bg-blue-100"
                          : nivel1.startsWith("4.0") || nivel1.startsWith("4.1") || nivel1.startsWith("5.0")
                          ? "bg-gray-200"
                          : nivel1.startsWith("7.0")
                          ? "bg-red-100"
                          : nivel1.startsWith("8.0")
                          ? "bg-green-100"
                          : "bg-blue-50"
                      }`}
                      onClick={() => isDespesas && toggleNivel1(nivel1)}
                    >
                      <td className="px-2 py-1">
                        <div className="flex items-center gap-2">
                          {isDespesas && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                          {nivel1}
                        </div>
                      </td>

                      {!isMobile &&
                        meses.map(m => (
                          <td key={m} className={`px-2 py-1 text-right ${(totaisNivel1[m] || 0) < 0 ? "text-red-600" : ""}`}>
                            {(!totaisNivel1[m] && totaisNivel1[m] !== 0) || isNaN(totaisNivel1[m]) || totaisNivel1[m] === 0 ? "-" : Math.round(totaisNivel1[m]).toLocaleString("pt-BR")}
                          </td>
                        ))}
                      <td className={`px-2 py-1 text-right ${(totaisNivel1.total || 0) < 0 ? "text-red-600" : ""}`}>
                        {(!totaisNivel1.total && totaisNivel1.total !== 0) || isNaN(totaisNivel1.total) || totaisNivel1.total === 0 ? "-" : Math.round(totaisNivel1.total).toLocaleString("pt-BR")}
                      </td>
                      <td className={`px-2 py-1 text-right ${media < 0 ? "text-red-600" : ""}`}>{isNaN(media) || media === 0 ? "-" : Math.round(media).toLocaleString("pt-BR")}</td>
                      <td className={`px-2 py-1 text-right ${varPercent !== "-" && parseFloat(varPercent) < 0 ? "text-red-600" : ""}`}>{varPercent}</td>
                    </tr>

                    {isDespesas && isOpen && Object.entries(subnivel2)
                      .filter(([k]) => k !== "_totais")
                      .sort(([, itensA], [, itensB]) => {
                        const totalA = itensA.reduce((acc, item) => acc + item.valores.total, 0);
                        const totalB = itensB.reduce((acc, item) => acc + item.valores.total, 0);
                        return totalA - totalB;
                      })
                      .map(([nivel2, itens]) => {
                        const chave = `${nivel1}-${nivel2}`;
                        const isOpen2 = expandidoNivel2[chave] ?? false;

                        const totalN2 = itens.reduce((acc, item) => {
  			mesesSelecionados.forEach(m => acc[m] = (acc[m] ?? 0) + (item.valores[m] ?? 0));
  			acc.total = mesesSelecionados.reduce((soma, m) => soma + (acc[m] ?? 0), 0);
  			return acc;
			}, {} as { [mes: number]: number; total: number });

                        const mediaN2 = calcularMedia(totalN2);
                        const varN2 = linha1 ? calcularVar(mediaN2, calcularMedia(linha1.valores)) : "-";

                        return (
                          <>
                            <tr
                              key={chave}
                              className={`cursor-pointer ${
                                nivel1.startsWith("7.0") ? "bg-red-50" : "bg-blue-100"
                              }`}
                              onClick={() => toggleNivel2(chave)}
                            >
                              <td className="pl-6 px-2 py-1 font-medium">
                                <div className="flex items-center gap-2">
                                  {isOpen2 ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                  {nivel2}
                                </div>
                              </td>
                              {!isMobile &&
                                meses.map(m => (
                                  <td key={m} className={`px-2 py-1 text-right ${(totalN2[m] || 0) < 0 ? "text-red-600" : ""}`}>
                                    {(!totalN2[m] && totalN2[m] !== 0) || isNaN(totalN2[m]) || totalN2[m] === 0 ? "-" : Math.round(totalN2[m]).toLocaleString("pt-BR")}
                                  </td>
                                ))}
                              <td className="px-2 py-1 text-right">{isNaN(totalN2.total) || totalN2.total === 0 ? "-" : Math.round(totalN2.total).toLocaleString("pt-BR")}</td>
                              <td className={`px-2 py-1 text-right ${mediaN2 < 0 ? "text-red-600" : ""}`}>{isNaN(mediaN2) || mediaN2 === 0 ? "-" : Math.round(mediaN2).toLocaleString("pt-BR")}</td>
                              <td className={`px-2 py-1 text-right ${varN2 !== "-" && parseFloat(varN2) < 0 ? "text-red-600" : ""}`}>{varN2}</td>
                            </tr>

                            {isOpen2 &&
                              itens
                                .sort((a, b) => a.valores.total - b.valores.total)
                                .map((item, i) => {
                                  const mediaN3 = calcularMedia(item.valores);
                                  const varN3 = linha1 ? calcularVar(mediaN3, calcularMedia(linha1.valores)) : "-";
                                  return (
                                    <tr key={`${chave}-${i}`} className="bg-white">
                                      <td className="pl-12 px-2 py-1 font-medium">{item.nivel3}</td>
                                      {!isMobile &&
                                        meses.map(m => (
                                          <td key={m} className={`px-2 py-1 text-right font-medium ${(item.valores[m] || 0) < 0 ? "text-red-600" : ""}`}>
                                            {(!item.valores[m] && item.valores[m] !== 0) || isNaN(item.valores[m]) || item.valores[m] === 0 ? "-" : Math.round(item.valores[m]).toLocaleString("pt-BR")}
                                          </td>
                                        ))}
                                      <td className="px-2 py-1 text-right font-medium">
                                        {(() => {
                                          const total = mesesSelecionados.reduce((acc, m) => acc + (item.valores[m] ?? 0), 0);
                                          return isNaN(total) || total === 0 ? "-" : Math.round(total).toLocaleString("pt-BR");
                                        })()}
                                      </td>
                                      <td className={`px-2 py-1 text-right font-medium ${mediaN3 < 0 ? "text-red-600" : ""}`}>{isNaN(mediaN3) || mediaN3 === 0 ? "-" : Math.round(mediaN3).toLocaleString("pt-BR")}</td>
                                      <td className={`px-2 py-1 text-right ${varN3 !== "-" && parseFloat(varN3) < 0 ? "text-red-600" : ""}`}>{varN3}</td>
                                    </tr>
                                  );
                                })}
                          </>
                        );
                      })}

                    {nivel1.startsWith("4.0") && linha1 && linha4 && (
                      <tr className="bg-gray-200 font-bold text-gray-400">
                        <td className="px-2 py-1">4.1 - MARGEM %</td>
                        {!isMobile && meses.map((m) => {
                          const fat = linha1.valores[m] ?? 0;
                          const cmv = linha4.valores[m] ?? 0;
                          const perc = fat ? ((fat - (cmv * -1)) / fat) * 100 : 0;
                          return (
                            <td key={m} className={`px-2 py-1 text-right ${perc < 0 ? "text-red-600" : ""}`}>
                              {fat === 0 ? "-" : `${perc.toFixed(1)}%`}
                            </td>
                          );
                        })}
                        <td className={`px-2 py-1 text-right ${(() => {
                          const totalFat = mesesSelecionados.reduce((acc, m) => acc + (linha1.valores[m] ?? 0), 0);
                          const totalCmv = mesesSelecionados.reduce((acc, m) => acc + (linha4.valores[m] ?? 0), 0);
                          return totalFat === 0 ? "" : ((totalFat - totalCmv) / totalFat) < 0 ? "text-red-600" : "";
                        })()}`}>
                          {(() => {
                            const totalFat = mesesSelecionados.reduce((acc, m) => acc + (linha1.valores[m] ?? 0), 0);
                            const totalCmv = mesesSelecionados.reduce((acc, m) => acc + (linha4.valores[m] ?? 0), 0);
                            return totalFat === 0 ? "-" : `${(((totalFat - (totalCmv * -1)) / totalFat) * 100).toFixed(1)}%`;
                          })()}
                        </td>
                        <td className="text-right px-2 py-1">
                          {(() => {
                            const media1 = calcularMedia(linha1.valores);
                            const media4 = calcularMedia(linha4.valores);
                            const perc = media1 ? ((media1 - (media4 * -1)) / media1) * 100 : 0;
                            const resultado = media1 === 0 ? "-" : `${perc.toFixed(1)}%`;
                            const isNegativo = perc < 0;
                            return <span className={isNegativo ? "text-red-600" : ""}>{resultado}</span>;
                          })()}
                        </td>
                        <td className="text-right px-2 py-1">–</td>
                      </tr>
                    )}
                  </>
                );
              })}

            {linha1 && linha8 && (
              <tr className="bg-green-100 font-bold">
                <td className="px-2 py-1">8.1 - LUCRO LÍQUIDO %</td>
                {!isMobile && meses.map((m) => {
                  const fat = linha1.valores[m] ?? 0;
                  const lucro = linha8.valores[m] ?? 0;
                  const perc = fat ? (lucro / fat) * 100 : 0;
                  return (
                    <td key={m} className={`px-2 py-1 text-right ${perc < 0 ? "text-red-600" : ""}`}>
                      {fat === 0 ? "-" : `${perc.toFixed(1)}%`}
                    </td>
                  );
                })}
                <td className={`px-2 py-1 text-right ${(() => {
                  const totalFat = mesesSelecionados.reduce((acc, m) => acc + (linha1.valores[m] ?? 0), 0);
                  const totalLucro = mesesSelecionados.reduce((acc, m) => acc + (linha8.valores[m] ?? 0), 0);
                  return totalFat === 0 ? "" : (totalLucro / totalFat) < 0 ? "text-red-600" : "";
                })()}`}>
                  {(() => {
                    const totalFat = mesesSelecionados.reduce((acc, m) => acc + (linha1.valores[m] ?? 0), 0);
                    const totalLucro = mesesSelecionados.reduce((acc, m) => acc + (linha8.valores[m] ?? 0), 0);
                    return totalFat === 0 ? "-" : `${((totalLucro / totalFat) * 100).toFixed(1)}%`;
                  })()}
                </td>
                <td className="text-right px-2 py-1">–</td>
                <td className="text-right px-2 py-1">–</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

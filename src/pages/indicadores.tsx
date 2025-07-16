import Layout from "@/components/Layout";
import { TrendingUp, TrendingDown, Target, DollarSign, ShoppingCart, Package, Calendar, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import Image from "next/image";

// Componente de velocímetro usando imagem PNG
const SpeedometerIcon = ({ className = "w-7 h-7" }) => (
    <Image
        src="/images/velocimetro.png"
        alt="Velocímetro"
        width={28}
        height={28}
        className={className}
    />
);

interface IndicadorDB {
    datacriacao: string;
    ano: number;
    mes: number;
    dia: number;
    idorganizacao: number;
    nomeorganizacao: string;
    idempresa: number;
    nomeempresa: string;
    indicador: string;
    legenda: string;
    meta: number;
    realizado: number;
    direcao: number;
    variacao: number;
    cor: string;
    posicao: number;
    ativo: boolean;
}

interface Indicador {
    id: string;
    nome: string;
    meta: number;
    realizado: number;
    variacao: number;
    unidade: string;
    icone: React.ReactNode;
    descricao: string;
    cor: string;
    direcao: number;
}

interface DiaDisponivel {
    dia: number;
    datacriacao: string;
}

interface EmpresaDisponivel {
    idempresa: number;
    nomeempresa: string;
}

export default function Indicadores() {
    const [indicadores, setIndicadores] = useState<Indicador[]>([]);
    const [diasDisponiveis, setDiasDisponiveis] = useState<DiaDisponivel[]>([]);
    const [empresasDisponiveis, setEmpresasDisponiveis] = useState<EmpresaDisponivel[]>([]);
    const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
    const [empresaSelecionada, setEmpresaSelecionada] = useState<number>(1); // Padrão empresa 1
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mapeamento de ícones baseado no nome do indicador
    const getIconeByName = (nome: string): React.ReactNode => {
        const nomeUpper = nome.toUpperCase();
        
        if (nomeUpper.includes('VENDA')) return <DollarSign className="w-6 h-6" />;
        if (nomeUpper.includes('COMPRA')) return <ShoppingCart className="w-6 h-6" />;
        if (nomeUpper.includes('MARGEM') || nomeUpper.includes('CMV')) return <TrendingUp className="w-6 h-6" />;
        if (nomeUpper.includes('INADIMPL')) return <AlertCircle className="w-6 h-6" />;
        if (nomeUpper.includes('PROJECAO')) return <Target className="w-6 h-6" />;
        if (nomeUpper.includes('ANO')) return <Calendar className="w-6 h-6" />;
        if (nomeUpper.includes('ESTOQUE')) return <Package className="w-6 h-6" />;
        
        return <DollarSign className="w-6 h-6" />; // Padrão
    };

    // Determinar unidade baseado no indicador
    const getUnidadeByName = (nome: string): string => {
        const nomeUpper = nome.toUpperCase();
        
        if (nomeUpper.includes('MARGEM') || nomeUpper.includes('INADIMPL') || nomeUpper.includes('PERCENT') || nomeUpper.includes('%')) return '%';
        if (nomeUpper.includes('VENDA') || nomeUpper.includes('COMPRA') || nomeUpper.includes('RECEITA') || nomeUpper.includes('FATURAMENTO')) return 'k';
        return 'un'; // Padrão para unidades
    };

    // Buscar dias disponíveis
    const fetchDiasDisponiveis = async () => {
        try {
            const response = await api.get('/api/indicadores/dias');
            console.log('Dados brutos recebidos:', response.data);
            
            // Remover duplicatas e ordenar os dias em ordem crescente
            const diasUnicos = response.data.reduce((acc: DiaDisponivel[], current: DiaDisponivel) => {
                const existe = acc.find(item => item.dia === current.dia);
                if (!existe) {
                    acc.push(current);
                }
                return acc;
            }, []);
            
            const diasOrdenados = diasUnicos.sort((a: DiaDisponivel, b: DiaDisponivel) => a.dia - b.dia);
            console.log('Dias ordenados (sem duplicatas):', diasOrdenados.map((d: DiaDisponivel) => d.dia));
            console.log('Dias disponíveis carregados:', diasOrdenados);
            setDiasDisponiveis(diasOrdenados);
            
            // Selecionar o dia mais recente por padrão
            if (diasOrdenados.length > 0) {
                const diaRecente = diasOrdenados[diasOrdenados.length - 1]; // O último dia (mais recente)
                console.log('Dia inicial selecionado:', diaRecente.dia);
                setDiaSelecionado(diaRecente.dia);
            }
        } catch (error) {
            console.error('Erro ao buscar dias disponíveis:', error);
        }
    };

    // Buscar empresas disponíveis
    const fetchEmpresasDisponiveis = async () => {
        try {
            const response = await api.get('/api/indicadores/empresas');
            setEmpresasDisponiveis(response.data);
        } catch (error) {
            console.error('Erro ao buscar empresas disponíveis:', error);
        }
    };

    // Buscar indicadores do backend
    const fetchIndicadores = useCallback(async () => {
        if (!diaSelecionado) return;
        
        try {
            setLoading(true);
            const response = await api.get(`/api/indicadores?dia=${diaSelecionado}&empresa=${empresaSelecionada}`);
            
            // Converter dados do banco para formato do componente
            const indicadoresFormatados: Indicador[] = response.data.map((item: IndicadorDB) => ({
                id: `${item.indicador}-${item.idempresa}`,
                nome: item.legenda || item.indicador.replace(/_/g, ' ').toLowerCase()
                    .replace(/\b\w/g, l => l.toUpperCase()),
                meta: item.meta,
                realizado: item.realizado,
                variacao: item.variacao,
                unidade: getUnidadeByName(item.legenda || item.indicador),
                icone: getIconeByName(item.legenda || item.indicador),
                descricao: `${item.nomeempresa} - ${item.indicador}`,
                cor: item.cor,
                direcao: item.direcao
            }));
            
            setIndicadores(indicadoresFormatados);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar indicadores:', err);
            setError('Erro ao carregar indicadores');
        } finally {
            setLoading(false);
        }
    }, [diaSelecionado, empresaSelecionada]);

    useEffect(() => {
        fetchDiasDisponiveis();
        fetchEmpresasDisponiveis();
    }, []);

    useEffect(() => {
        fetchIndicadores();
    }, [fetchIndicadores]);

    const getVariacaoColor = (variacao: number) => {
        if (variacao > 0) return "text-green-600";
        if (variacao < 0) return "text-red-600";
        return "text-gray-600";
    };

    const getVariacaoIcon = (variacao: number) => {
        if (variacao > 0) return <TrendingUp className="w-4 h-4" />;
        if (variacao < 0) return <TrendingDown className="w-4 h-4" />;
        return null;
    };

    const getProgressColor = (cor: string) => {
        const corLower = cor.toLowerCase();
        if (corLower === 'verde' || corLower === 'green') return "bg-green-500";
        if (corLower === 'amarelo' || corLower === 'yellow') return "bg-yellow-500";
        if (corLower === 'vermelho' || corLower === 'red') return "bg-red-500";
        return "bg-gray-500"; // Cor padrão
    };

    const getCardBorderColor = (cor: string) => {
        const corLower = cor.toLowerCase();
        if (corLower === 'verde' || corLower === 'green') return 'border-l-green-500';
        if (corLower === 'amarelo' || corLower === 'yellow') return 'border-l-yellow-500';
        if (corLower === 'vermelho' || corLower === 'red') return 'border-l-red-500';
        return 'border-l-gray-500'; // Cor padrão
    };

    const formatNumberWithScale = (value: number): string => {
        const absValue = Math.abs(value);
        const signal = value < 0 ? "-" : "";
        
        if (absValue >= 1000000000) {
            // Bilhões
            const billions = absValue / 1000000000;
            if (billions >= 100) return `${signal}${billions.toFixed(0)} <span style="font-size: 0.8em; color: #9ca3af;">B</span>`;
            if (billions >= 10) return `${signal}${billions.toFixed(1)} <span style="font-size: 0.8em; color: #9ca3af;">B</span>`;
            return `${signal}${billions.toFixed(2)} <span style="font-size: 0.8em; color: #9ca3af;">B</span>`;
        } else if (absValue >= 1000000) {
            // Milhões
            const millions = absValue / 1000000;
            if (millions >= 100) return `${signal}${millions.toFixed(0)} <span style="font-size: 0.8em; color: #9ca3af;">M</span>`;
            if (millions >= 10) return `${signal}${millions.toFixed(1)} <span style="font-size: 0.8em; color: #9ca3af;">M</span>`;
            return `${signal}${millions.toFixed(2)} <span style="font-size: 0.8em; color: #9ca3af;">M</span>`;
        } else if (absValue >= 1000) {
            // Milhares
            const thousands = absValue / 1000;
            if (thousands >= 100) return `${signal}${thousands.toFixed(0)} <span style="font-size: 0.8em; color: #9ca3af;">K</span>`;
            if (thousands >= 10) return `${signal}${thousands.toFixed(1)} <span style="font-size: 0.8em; color: #9ca3af;">K</span>`;
            return `${signal}${thousands.toFixed(2)} <span style="font-size: 0.8em; color: #9ca3af;">K</span>`;
        } else {
            // Valores menores que 1000
            return `${signal}${absValue.toFixed(0)}`;
        }
    };

    const formatValue = (value: number, unidade: string) => {
        if (unidade === "%") {
            return `${value.toFixed(1)}%`;
        }
        
        // Para valores monetários, usar apenas formatação com escala
        if (unidade === 'k') {
            return `${formatNumberWithScale(value)}`;
        }
        
        // Para outras unidades, usar formatação com escala
        if (unidade === 'un') {
            return `${formatNumberWithScale(value)}`;
        }
        
        return `${formatNumberWithScale(value)}`;
    };

    const formatVariacao = (variacao: number) => {
        const percentage = (variacao * 100);
        const signal = percentage >= 0 ? "+" : "";
        return `${signal}${percentage.toFixed(1)}%`;
    };

    const calculateProgress = (realizado: number, meta: number) => {
        return Math.min((realizado / meta) * 100, 100);
    };

    return (
        <Layout titulo="Painel Gerencial" subtitulo="Indicadores">
            <div className="p-6 bg-gray-50 min-h-full">
                {/* Cabeçalho com ícone */}
                <div className="mb-6">
                    {/* Layout completo em uma linha - Desktop */}
                    <div className="hidden md:flex items-center justify-between mb-6">
                        <div className="flex items-center gap-8">
                            {/* Ícone do velocímetro */}
                            <SpeedometerIcon className="w-8 h-8" />
                            
                            {/* Dia */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700">Dia:</span>
                                <div className="flex items-center border border-gray-300 rounded px-2">
                                    <button
                                        onClick={() => {
                                            const currentIndex = diasDisponiveis.findIndex(d => d.dia === diaSelecionado);
                                            if (currentIndex > 0) {
                                                setDiaSelecionado(diasDisponiveis[currentIndex - 1].dia);
                                            }
                                        }}
                                        disabled={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) <= 0}
                                        className="p-1 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                        title={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) <= 0 ? 'Você já está no primeiro dia' : 'Dia anterior'}
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                    <span className="px-2 text-xs font-semibold text-center min-w-[100px]">
                                        {diaSelecionado && diasDisponiveis.find(d => d.dia === diaSelecionado)?.datacriacao 
                                            ? (() => {
                                                const dataDisponivel = diasDisponiveis.find(d => d.dia === diaSelecionado);
                                                if (!dataDisponivel?.datacriacao) return diaSelecionado || '-';
                                                const data = new Date(dataDisponivel.datacriacao);
                                                const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                                                const diaSemana = diasSemana[data.getDay()];
                                                const dia = data.getDate().toString().padStart(2, '0');
                                                const mes = (data.getMonth() + 1).toString().padStart(2, '0');
                                                const ano = data.getFullYear().toString().slice(-2);
                                                return `${diaSemana} ${dia}/${mes}/${ano}`;
                                            })()
                                            : (diaSelecionado || '-')
                                        }
                                    </span>
                                    <button
                                        onClick={() => {
                                            const currentIndex = diasDisponiveis.findIndex(d => d.dia === diaSelecionado);
                                            if (currentIndex >= 0 && currentIndex < diasDisponiveis.length - 1) {
                                                const proximoDia = diasDisponiveis[currentIndex + 1].dia;
                                                setDiaSelecionado(proximoDia);
                                            }
                                        }}
                                        disabled={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) >= diasDisponiveis.length - 1}
                                        className="p-1 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                        title={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) >= diasDisponiveis.length - 1 ? 'Você já está no último dia' : 'Próximo dia'}
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                </div>
                            </div>

                                {/* Empresa */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-700">Empresa:</span>
                                    <div className="flex items-center border border-gray-300 rounded px-2">
                                        <button
                                            onClick={() => {
                                                const currentIndex = empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada);
                                                if (currentIndex > 0) {
                                                    setEmpresaSelecionada(empresasDisponiveis[currentIndex - 1].idempresa);
                                                }
                                            }}
                                            disabled={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) <= 0}
                                            className="p-1 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                            title={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) <= 0 ? 'Você já está na primeira empresa' : 'Empresa anterior'}
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                        <span className="px-2 text-xs font-semibold text-center min-w-[100px]">
                                            {empresasDisponiveis.find(e => e.idempresa === empresaSelecionada)?.nomeempresa || 'MULTICAR'}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const currentIndex = empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada);
                                                if (currentIndex >= 0 && currentIndex < empresasDisponiveis.length - 1) {
                                                    setEmpresaSelecionada(empresasDisponiveis[currentIndex + 1].idempresa);
                                                }
                                            }}
                                            disabled={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) >= empresasDisponiveis.length - 1}
                                            className="p-1 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                            title={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) >= empresasDisponiveis.length - 1 ? 'Você já está na última empresa' : 'Próxima empresa'}
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                    </div>
                                </div>
                        </div>

                        {/* Resumo Geral alinhado à direita */}
                        <div className="flex items-center gap-2">
                            <div className="text-center px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-lg font-bold text-green-600">
                                    {loading ? '0' : indicadores.filter(i => i.cor.toLowerCase() === 'verde' || i.cor.toLowerCase() === 'green').length}
                                </div>
                                <div className="text-xs text-green-700">Atingidos</div>
                            </div>
                            <div className="text-center px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="text-lg font-bold text-yellow-600">
                                    {loading ? '0' : indicadores.filter(i => i.cor.toLowerCase() === 'amarelo' || i.cor.toLowerCase() === 'yellow').length}
                                </div>
                                <div className="text-xs text-yellow-700">Próximos</div>
                            </div>
                            <div className="text-center px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                                <div className="text-lg font-bold text-red-600">
                                    {loading ? '0' : indicadores.filter(i => i.cor.toLowerCase() === 'vermelho' || i.cor.toLowerCase() === 'red').length}
                                </div>
                                <div className="text-xs text-red-700">Abaixo</div>
                            </div>
                        </div>
                    </div>

                    {/* Ícone com seletores de Dia e Empresa - Mobile */}
                    <div className="md:hidden flex items-center justify-between mb-4">
                        <SpeedometerIcon className="w-9 h-9" />
                        
                        <div className="flex items-center gap-3">
                            {/* Seletor de Dia */}
                            <div className="flex items-center border border-gray-300 rounded px-1">
                                <button
                                    onClick={() => {
                                        const currentIndex = diasDisponiveis.findIndex(d => d.dia === diaSelecionado);
                                        if (currentIndex > 0) {
                                            setDiaSelecionado(diasDisponiveis[currentIndex - 1].dia);
                                        }
                                    }}
                                    disabled={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) <= 0}
                                    className="p-1 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                    title={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) <= 0 ? 'Você já está no primeiro dia' : 'Dia anterior'}
                                >
                                    <ChevronDown size={12} />
                                </button>
                                <span className="px-2 text-xs font-semibold text-center min-w-[70px]">
                                    {diaSelecionado && diasDisponiveis.find(d => d.dia === diaSelecionado)?.datacriacao 
                                        ? (() => {
                                            const dataDisponivel = diasDisponiveis.find(d => d.dia === diaSelecionado);
                                            if (!dataDisponivel?.datacriacao) return diaSelecionado || '-';
                                            const data = new Date(dataDisponivel.datacriacao);
                                            const dia = data.getDate().toString().padStart(2, '0');
                                            const mes = (data.getMonth() + 1).toString().padStart(2, '0');
                                            return `${dia}/${mes}`;
                                        })()
                                        : (diaSelecionado || '-')
                                    }
                                </span>
                                <button
                                    onClick={() => {
                                        const currentIndex = diasDisponiveis.findIndex(d => d.dia === diaSelecionado);
                                        if (currentIndex >= 0 && currentIndex < diasDisponiveis.length - 1) {
                                            const proximoDia = diasDisponiveis[currentIndex + 1].dia;
                                            setDiaSelecionado(proximoDia);
                                        }
                                    }}
                                    disabled={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) >= diasDisponiveis.length - 1}
                                    className="p-1 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                    title={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) >= diasDisponiveis.length - 1 ? 'Você já está no último dia' : 'Próximo dia'}
                                >
                                    <ChevronUp size={12} />
                                </button>
                            </div>

                            {/* Seletor de Empresa */}
                            <div className="flex items-center border border-gray-300 rounded px-1">
                                <button
                                    onClick={() => {
                                        const currentIndex = empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada);
                                        if (currentIndex > 0) {
                                            setEmpresaSelecionada(empresasDisponiveis[currentIndex - 1].idempresa);
                                        }
                                    }}
                                    disabled={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) <= 0}
                                    className="p-1 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                    title={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) <= 0 ? 'Você já está na primeira empresa' : 'Empresa anterior'}
                                >
                                    <ChevronDown size={12} />
                                </button>
                                <span className="px-2 text-xs font-semibold text-center min-w-[70px]">
                                    {empresasDisponiveis.find(e => e.idempresa === empresaSelecionada)?.nomeempresa || 'MULTICAR'}
                                </span>
                                <button
                                    onClick={() => {
                                        const currentIndex = empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada);
                                        if (currentIndex >= 0 && currentIndex < empresasDisponiveis.length - 1) {
                                            setEmpresaSelecionada(empresasDisponiveis[currentIndex + 1].idempresa);
                                        }
                                    }}
                                    disabled={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) >= empresasDisponiveis.length - 1}
                                    className="p-1 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                    title={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) >= empresasDisponiveis.length - 1 ? 'Você já está na última empresa' : 'Próxima empresa'}
                                >
                                    <ChevronUp size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-600">{error}</p>
                        <button 
                            onClick={fetchIndicadores}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : indicadores.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                        <p className="text-yellow-600">Nenhum indicador encontrado.</p>
                    </div>
                ) : (
                    <>
                        {/* Resumo Geral - Mobile */}
                        <div className="mb-6 md:hidden">
                            <div className="flex items-center gap-2">
                                <div className="text-center px-2 py-2 bg-green-50 rounded-lg border border-green-200 flex-1">
                                    <div className="text-lg font-bold text-green-600">
                                        {indicadores.filter(i => i.cor.toLowerCase() === 'verde' || i.cor.toLowerCase() === 'green').length}
                                    </div>
                                    <div className="text-xs text-green-700">Atingidos</div>
                                </div>
                                <div className="text-center px-2 py-2 bg-yellow-50 rounded-lg border border-yellow-200 flex-1">
                                    <div className="text-lg font-bold text-yellow-600">
                                        {indicadores.filter(i => i.cor.toLowerCase() === 'amarelo' || i.cor.toLowerCase() === 'yellow').length}
                                    </div>
                                    <div className="text-xs text-yellow-700">Próximos</div>
                                </div>
                                <div className="text-center px-2 py-2 bg-red-50 rounded-lg border border-red-200 flex-1">
                                    <div className="text-lg font-bold text-red-600">
                                        {indicadores.filter(i => i.cor.toLowerCase() === 'vermelho' || i.cor.toLowerCase() === 'red').length}
                                    </div>
                                    <div className="text-xs text-red-700">Abaixo</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {indicadores.map((indicador) => (
                                <div 
                                    key={indicador.id}
                                    className={`bg-white rounded-lg shadow-md p-3 border-l-4 ${getCardBorderColor(indicador.cor)} hover:shadow-lg transition-shadow duration-200`}
                                >
                                    {/* Header do Card */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                                {indicador.icone}
                                            </div>
                                            <div>
                                                <h3 className="text-[10px] md:text-sm font-medium text-gray-600">{indicador.nome}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Valores Principais */}
                                    <div className="mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span 
                                                className="text-sm md:text-xl font-bold text-gray-800"
                                                dangerouslySetInnerHTML={{ __html: formatValue(indicador.realizado, indicador.unidade) }}
                                            />
                                            <div className="flex items-center">
                                                <span className={`md:hidden text-[10px] font-medium ${getVariacaoColor(indicador.variacao)}`}>
                                                    {formatVariacao(indicador.variacao)}
                                                </span>
                                                <div className={`hidden md:flex items-center space-x-1 ${getVariacaoColor(indicador.variacao)}`}>
                                                    {getVariacaoIcon(indicador.variacao)}
                                                    <span className="text-[10px] md:text-sm font-medium">
                                                        {formatVariacao(indicador.variacao)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Ícone da variação e Meta na mesma linha para mobile */}
                                        <div className="md:hidden flex items-center justify-between mb-1">
                                            <div className="text-[10px] text-gray-500">
                                                Meta: <span dangerouslySetInnerHTML={{ __html: formatValue(indicador.meta, indicador.unidade) }} />
                                            </div>
                                            <div className={`flex items-center ${getVariacaoColor(indicador.variacao)}`}>
                                                {getVariacaoIcon(indicador.variacao)}
                                            </div>
                                        </div>
                                        
                                        <div className="hidden md:flex justify-between items-center mb-1">
                                            <div className="text-[10px] md:text-sm text-gray-500">
                                                Meta: <span dangerouslySetInnerHTML={{ __html: formatValue(indicador.meta, indicador.unidade) }} />
                                            </div>
                                            <span className={`px-1 py-0.5 text-[9px] md:text-xs font-medium rounded-full ${
                                                indicador.cor.toLowerCase() === 'verde' || indicador.cor.toLowerCase() === 'green'
                                                    ? 'bg-green-100 text-green-800' 
                                                    : indicador.cor.toLowerCase() === 'amarelo' || indicador.cor.toLowerCase() === 'yellow'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                            }`}>
                                                {indicador.cor.toLowerCase() === 'verde' || indicador.cor.toLowerCase() === 'green' ? 'Meta Atingida' : 
                                                 indicador.cor.toLowerCase() === 'amarelo' || indicador.cor.toLowerCase() === 'yellow' ? 'Próximo da Meta' : 'Abaixo da Meta'}
                                            </span>
                                        </div>

                                        {/* Barra de Progress */}
                                        <div className="w-full bg-gray-200 rounded-full h-4 md:h-5 relative">
                                            <div 
                                                className={`h-4 md:h-5 rounded-full transition-all duration-300 ${getProgressColor(indicador.cor)}`}
                                                style={{ width: `${calculateProgress(indicador.realizado, indicador.meta)}%` }}
                                            ></div>
                                            <div 
                                                className="absolute inset-y-0 flex items-center transition-all duration-300"
                                                style={{ 
                                                    left: `${Math.max(calculateProgress(indicador.realizado, indicador.meta) - 12, 2)}%`,
                                                    transform: calculateProgress(indicador.realizado, indicador.meta) < 20 ? 'translateX(0)' : 'translateX(-50%)'
                                                }}
                                            >
                                                <span className={`text-[8px] md:text-xs font-medium ${calculateProgress(indicador.realizado, indicador.meta) > 0 ? 'text-white' : 'text-gray-500'}`}>
                                                    {Math.round(calculateProgress(indicador.realizado, indicador.meta))}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

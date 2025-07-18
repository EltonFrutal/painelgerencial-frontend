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

export default function Indicadores2() {
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
        
        if (nomeUpper.includes('VENDA')) return <DollarSign className="w-4 h-4 md:w-4 md:h-4" />;
        if (nomeUpper.includes('COMPRA')) return <ShoppingCart className="w-4 h-4 md:w-4 md:h-4" />;
        if (nomeUpper.includes('MARGEM') || nomeUpper.includes('CMV')) return <TrendingUp className="w-4 h-4 md:w-4 md:h-4" />;
        if (nomeUpper.includes('INADIMPL')) return <AlertCircle className="w-4 h-4 md:w-4 md:h-4" />;
        if (nomeUpper.includes('PROJECAO')) return <Target className="w-4 h-4 md:w-4 md:h-4" />;
        if (nomeUpper.includes('ANO')) return <Calendar className="w-4 h-4 md:w-4 md:h-4" />;
        if (nomeUpper.includes('ESTOQUE')) return <Package className="w-4 h-4 md:w-4 md:h-4" />;
        
        return <DollarSign className="w-4 h-4 md:w-4 md:h-4" />; // Padrão
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
        if (diaSelecionado) {
            fetchIndicadores();
        }
    }, [diaSelecionado, empresaSelecionada, fetchIndicadores]);

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

    // Função para obter cores baseadas na cor do indicador
    const getCardColors = (cor: string) => {
        const corLower = cor.toLowerCase();
        if (corLower === 'verde' || corLower === 'green') {
            return {
                bg: 'bg-green-500',
                textLight: 'text-green-100',
                textDark: 'text-green-800'
            };
        }
        if (corLower === 'amarelo' || corLower === 'yellow') {
            return {
                bg: 'bg-yellow-500',
                textLight: 'text-yellow-100',
                textDark: 'text-yellow-800'
            };
        }
        if (corLower === 'vermelho' || corLower === 'red') {
            return {
                bg: 'bg-red-500',
                textLight: 'text-red-100',
                textDark: 'text-red-800'
            };
        }
        return {
            bg: 'bg-blue-500',
            textLight: 'text-blue-100',
            textDark: 'text-blue-800'
        };
    };

    const formatNumberWithScale = (value: number): string => {
        const absValue = Math.abs(value);
        const signal = value < 0 ? "-" : "";
        
        if (absValue >= 1000000000) {
            // Bilhões
            const billions = absValue / 1000000000;
            if (billions >= 100) return `${signal}${billions.toFixed(0)}B`;
            if (billions >= 10) return `${signal}${billions.toFixed(1)}B`;
            return `${signal}${billions.toFixed(2)}B`;
        } else if (absValue >= 1000000) {
            // Milhões
            const millions = absValue / 1000000;
            if (millions >= 100) return `${signal}${millions.toFixed(0)}M`;
            if (millions >= 10) return `${signal}${millions.toFixed(1)}M`;
            return `${signal}${millions.toFixed(2)}M`;
        } else if (absValue >= 1000) {
            // Milhares
            const thousands = absValue / 1000;
            if (thousands >= 100) return `${signal}${thousands.toFixed(0)}K`;
            if (thousands >= 10) return `${signal}${thousands.toFixed(1)}K`;
            return `${signal}${thousands.toFixed(2)}K`;
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

    return (
                <Layout titulo="Painel Gerencial" subtitulo="Indicadores 2 - Teste">
            <div className="p-1 md:p-6 bg-gray-50 min-h-full font-bahnschrift">
                {/* Cabeçalho com ícone */}
                <div className="mb-6">
                    {/* Layout completo em uma linha - Desktop */}
                    <div className="hidden md:flex items-center justify-between mb-6">
                        <div className="flex items-center gap-8">
                            {/* Ícone do velocímetro */}
                            <SpeedometerIcon className="w-8 h-8" />
                            
                            {/* Dia */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-700">Dia:</span>
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
                                    <span className="px-2 text-xs text-center min-w-[100px]">
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
                                <span className="text-xs text-gray-700">Empresa:</span>
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
                                    <span className="px-2 text-xs text-center min-w-[100px]">
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
                        <div className="flex items-center gap-4">
                            <div className="text-center px-2 py-1 bg-green-50 rounded-lg border-2 border-green-400">
                                <div className="text-sm font-medium text-green-600">
                                    {loading ? '0' : indicadores.filter(i => i.cor.toLowerCase() === 'verde' || i.cor.toLowerCase() === 'green').length}
                                </div>
                                <div className="text-xs text-green-700">Atingidos</div>
                            </div>
                            <div className="text-center px-2 py-1 bg-yellow-50 rounded-lg border-2 border-yellow-400">
                                <div className="text-sm font-medium text-yellow-600">
                                    {loading ? '0' : indicadores.filter(i => i.cor.toLowerCase() === 'amarelo' || i.cor.toLowerCase() === 'yellow').length}
                                </div>
                                <div className="text-xs text-yellow-700">Próximos</div>
                            </div>
                            <div className="text-center px-2 py-1 bg-red-50 rounded-lg border-2 border-red-400">
                                <div className="text-sm font-medium text-red-600">
                                    {loading ? '0' : indicadores.filter(i => i.cor.toLowerCase() === 'vermelho' || i.cor.toLowerCase() === 'red').length}
                                </div>
                                <div className="text-xs text-red-700">Abaixo</div>
                            </div>
                        </div>
                    </div>

                    {/* Cards de Resumo com Ícone - Mobile (mesmo alinhamento) */}
                    <div className="mb-4 md:hidden">
                        <div className="flex items-center justify-between gap-2">
                            {/* Ícone do velocímetro */}
                            <div className="flex items-center justify-center p-0.5 bg-white bg-opacity-95 rounded-md h-[48px] w-[48px] shadow-sm">
                                <div className="text-blue-700">
                                    <SpeedometerIcon className="w-10 h-10" />
                                </div>
                            </div>
                            
                            {/* Cards de resumo */}
                            <div className="flex items-center gap-2 flex-1 justify-end">
                                <div className="text-center px-2 py-1.5 bg-green-50 rounded-lg border-2 border-green-400 flex-1 max-w-[80px] h-[48px] flex flex-col justify-center">
                                    <div className="text-sm font-medium text-green-600">
                                        {indicadores.filter(i => i.cor.toLowerCase() === 'verde' || i.cor.toLowerCase() === 'green').length}
                                    </div>
                                    <div className="text-xs text-green-700">Atingidos</div>
                                </div>
                                <div className="text-center px-2 py-1.5 bg-yellow-50 rounded-lg border-2 border-yellow-400 flex-1 max-w-[80px] h-[48px] flex flex-col justify-center">
                                    <div className="text-sm font-medium text-yellow-600">
                                        {indicadores.filter(i => i.cor.toLowerCase() === 'amarelo' || i.cor.toLowerCase() === 'yellow').length}
                                    </div>
                                    <div className="text-xs text-yellow-700">Próximos</div>
                                </div>
                                <div className="text-center px-2 py-1.5 bg-red-50 rounded-lg border-2 border-red-400 flex-1 max-w-[80px] h-[48px] flex flex-col justify-center">
                                    <div className="text-sm font-medium text-red-600">
                                        {indicadores.filter(i => i.cor.toLowerCase() === 'vermelho' || i.cor.toLowerCase() === 'red').length}
                                    </div>
                                    <div className="text-xs text-red-700">Abaixo</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seletores de Dia e Empresa - Mobile */}
                    <div className="md:hidden flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 w-full">
                            {/* Seletor de Dia */}
                            <div className="flex items-center border border-gray-300 rounded px-1 flex-1 h-[28px] justify-center">
                                <button
                                    onClick={() => {
                                        const currentIndex = diasDisponiveis.findIndex(d => d.dia === diaSelecionado);
                                        if (currentIndex > 0) {
                                            setDiaSelecionado(diasDisponiveis[currentIndex - 1].dia);
                                        }
                                    }}
                                    disabled={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) <= 0}
                                    className="p-1.5 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                    title={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) <= 0 ? 'Você já está no primeiro dia' : 'Dia anterior'}
                                >
                                    <ChevronDown size={16} />
                                </button>
                                <span className="px-2 text-xs text-center min-w-[55px]">
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
                                    className="p-1.5 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                    title={diasDisponiveis.length === 0 || diasDisponiveis.findIndex(d => d.dia === diaSelecionado) >= diasDisponiveis.length - 1 ? 'Você já está no último dia' : 'Próximo dia'}
                                >
                                    <ChevronUp size={16} />
                                </button>
                            </div>

                            {/* Seletor de Empresa */}
                            <div className="flex items-center border border-gray-300 rounded px-1 flex-1 h-[28px] justify-center">
                                <button
                                    onClick={() => {
                                        const currentIndex = empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada);
                                        if (currentIndex > 0) {
                                            setEmpresaSelecionada(empresasDisponiveis[currentIndex - 1].idempresa);
                                        }
                                    }}
                                    disabled={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) <= 0}
                                    className="p-1.5 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                    title={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) <= 0 ? 'Você já está na primeira empresa' : 'Empresa anterior'}
                                >
                                    <ChevronDown size={16} />
                                </button>
                                <span className="px-2 text-xs text-center min-w-[55px]">
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
                                    className="p-1.5 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                                    title={empresasDisponiveis.length === 0 || empresasDisponiveis.findIndex(e => e.idempresa === empresaSelecionada) >= empresasDisponiveis.length - 1 ? 'Você já está na última empresa' : 'Próxima empresa'}
                                >
                                    <ChevronUp size={16} />
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
                        {/* Novo Layout dos Indicadores - Modelo da Imagem */}
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                            {indicadores.map((indicador) => {
                                const colors = getCardColors(indicador.cor);
                                
                                return (
                                    <div 
                                        key={indicador.id}
                                        className={`${colors.bg} rounded-lg shadow-lg px-3 py-2 md:p-4 text-white hover:shadow-xl transition-shadow duration-200 font-bold md:font-bahnschrift`}
                                    >
                                        {/* Valor Principal Grande */}
                                        <div className="mb-1 md:mb-3">
                                            <div className={`flex items-center justify-between text-2xl md:text-3xl ${colors.textLight} mb-1`}>
                                                <span>{formatValue(indicador.realizado, indicador.unidade)}</span>
                                                <div className="p-1 md:p-1 border border-white rounded-full">
                                                    <div className={`${colors.textLight} text-lg md:text-xs`}>
                                                        {indicador.icone}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`flex items-center justify-between text-xs ${colors.textLight} opacity-90`}>
                                                <span>Meta: {formatValue(indicador.meta, indicador.unidade)}</span>
                                                <div className={`flex items-center space-x-1 ${colors.textLight}`}>
                                                    {getVariacaoIcon(indicador.variacao)}
                                                    <span className="text-xs">
                                                        {formatVariacao(indicador.variacao)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nome do Indicador */}
                                        <div className="mb-1 md:mb-3">
                                            <h3 className={`text-xs ${colors.textLight} truncate`}>
                                                {indicador.nome}
                                            </h3>
                                        </div>

                                        {/* Barra de Progresso com Percentual */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-white bg-opacity-30 rounded-full h-2">
                                                <div 
                                                    className="h-2 bg-white rounded-full transition-all duration-300"
                                                    style={{ 
                                                        width: `${Math.min((indicador.realizado / indicador.meta) * 100, 100)}%` 
                                                    }}
                                                ></div>
                                            </div>
                                            <span className={`text-xs ${colors.textLight} opacity-90 min-w-[35px] text-right`}>
                                                {Math.round(Math.min((indicador.realizado / indicador.meta) * 100, 100))}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Loader2, Download, Calendar, DollarSign } from "lucide-react";

interface ContasReceber {
  id: number;
  cliente: string;
  descricao: string;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  dataVencimento: string;
  dataEmissao: string;
  status: 'pendente' | 'parcial' | 'pago' | 'vencido';
}

export default function AReceber() {
  const [contas, setContas] = useState<ContasReceber[]>([]);
  const [carregandoContas, setCarregandoContas] = useState(false);
  const [resumo, setResumo] = useState({
    totalPendente: 0,
    totalVencido: 0,
    totalRecebido: 0,
    quantidadeContas: 0
  });

  // Buscar contas a receber
  useEffect(() => {
    const buscarContas = async () => {
      try {
        setCarregandoContas(true);
        // Simulando dados até implementar a API real
        const dadosSimulados: ContasReceber[] = [
          {
            id: 1,
            cliente: "João Silva",
            descricao: "Venda #001",
            valorTotal: 1500.00,
            valorPago: 0,
            valorPendente: 1500.00,
            dataVencimento: "2025-07-20",
            dataEmissao: "2025-07-10",
            status: "pendente"
          },
          {
            id: 2,
            cliente: "Maria Santos",
            descricao: "Venda #002",
            valorTotal: 2300.00,
            valorPago: 1000.00,
            valorPendente: 1300.00,
            dataVencimento: "2025-07-25",
            dataEmissao: "2025-07-12",
            status: "parcial"
          },
          {
            id: 3,
            cliente: "Carlos Oliveira",
            descricao: "Venda #003",
            valorTotal: 800.00,
            valorPago: 800.00,
            valorPendente: 0,
            dataVencimento: "2025-07-15",
            dataEmissao: "2025-07-05",
            status: "pago"
          }
        ];

        setContas(dadosSimulados);
        
        // Calcular resumo
        const totalPendente = dadosSimulados.reduce((sum, conta) => sum + conta.valorPendente, 0);
        const totalRecebido = dadosSimulados.reduce((sum, conta) => sum + conta.valorPago, 0);
        const totalVencido = dadosSimulados
          .filter(conta => new Date(conta.dataVencimento) < new Date() && conta.status !== 'pago')
          .reduce((sum, conta) => sum + conta.valorPendente, 0);
        
        setResumo({
          totalPendente,
          totalVencido,
          totalRecebido,
          quantidadeContas: dadosSimulados.length
        });

      } catch (error) {
        console.error('Erro ao buscar contas a receber:', error);
        setContas([]);
      } finally {
        setCarregandoContas(false);
      }
    };

    buscarContas();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'parcial': return 'bg-yellow-100 text-yellow-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'parcial': return 'Parcial';
      case 'vencido': return 'Vencido';
      default: return 'Pendente';
    }
  };

  return (
    <Layout titulo="Contas a Receber" subtitulo="Gestão de Recebimentos">
      <div className="flex flex-col gap-6 p-6">
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total a Receber</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(resumo.totalPendente)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Vencido</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(resumo.totalVencido)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Recebido</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(resumo.totalRecebido)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{resumo.quantidadeContas}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Contas</p>
                <p className="text-2xl font-bold text-gray-900">{resumo.quantidadeContas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Contas a Receber */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Contas a Receber
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Lista de todas as contas pendentes e recebidas
            </p>
          </div>
          
          {carregandoContas ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              <span className="ml-2 text-gray-600">Carregando contas...</span>
            </div>
          ) : contas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma conta encontrada
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
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Pendente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contas.map((conta) => (
                    <tr key={conta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {conta.cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {conta.descricao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(conta.valorTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(conta.valorPago)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(conta.valorPendente)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(conta.status)}`}>
                          {getStatusText(conta.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}



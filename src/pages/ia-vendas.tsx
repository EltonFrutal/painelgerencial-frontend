import Layout from "@/components/Layout";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function IAVendas() {
  return (
    <Layout titulo="Painel Gerencial" subtitulo="IA - Vendas">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-orange-800 mb-2">
            Funcionalidade Desabilitada
          </h2>
          <p className="text-orange-700 text-sm">
            A funcionalidade de IA para vendas está temporariamente desabilitada. 
            Esta página será implementada em uma versão futura.
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-4">
            Para acessar as funcionalidades disponíveis, utilize o menu lateral.
          </p>
          <Link 
            href="/menu-principal" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Voltar ao Menu Principal
          </Link>
        </div>
      </div>
    </Layout>
  );
}



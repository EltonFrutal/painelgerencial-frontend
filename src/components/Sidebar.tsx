// src/components/Sidebar.tsx
import { useRouter } from 'next/router';
import { Home, DollarSign, Download, MinusCircle, RotateCcw, Box, ShoppingBag, BarChart2, Gauge, Settings } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();

  const menus = [
    { icon: <Home size={24} />, path: '/menu-principal', tooltip: 'Menu Principal' },
    { icon: <DollarSign size={24} />, path: '/vendas', tooltip: 'Vendas' },
    { icon: <Download size={24} />, path: '/areceber', tooltip: 'A Receber' },
    { icon: <MinusCircle size={24} />, path: '/apagar', tooltip: 'A Pagar' },
    { icon: <RotateCcw size={24} />, path: '/historico', tooltip: 'Histórico' },
    { icon: <Box size={24} />, path: '/estoque', tooltip: 'Estoque' },
    { icon: <ShoppingBag size={24} />, path: '/compras', tooltip: 'Compras' },
    { icon: <BarChart2 size={24} />, path: '/resultados', tooltip: 'Resultados' },
    { icon: <Gauge size={24} />, path: '/indicadores', tooltip: 'Indicadores' },
    // futuramente exibir <Settings /> somente para assessor
  ];

  return (
    <div className="flex flex-col w-16 bg-gradient-to-b from-sky-800 to-sky-500 text-white items-center py-4 space-y-4">
      {menus.map(({ icon, path, tooltip }) => (
        <button
          key={path}
          onClick={() => router.push(path)}
          title={tooltip}
          className="hover:bg-sky-700 p-2 rounded"
        >
          {icon}
        </button>
      ))}
      {/* Futuramente: <Settings /> somente para assessor */}
    </div>
  );
}


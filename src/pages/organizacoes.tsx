// src/pages/organizacoes.tsx
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/router';

interface Organizacao {
  idorganizacao: number;
  organizacao: string;
  ativo: boolean;
}

export default function Organizacoes() {
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizacoes = async () => {
      try {
        const response = await api.get('/organizacoes');
        setOrganizacoes(response.data);
      } catch (error) {
        alert('Erro ao carregar organizações, redirecionando para login.');
        router.push('/login');
      }
    };
    fetchOrganizacoes();
  }, [router]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Organizações</h1>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Organização</th>
            <th className="p-2 border">Ativo</th>
          </tr>
        </thead>
        <tbody>
          {organizacoes.map((org) => (
            <tr key={org.idorganizacao}>
              <td className="p-2 border text-center">{org.idorganizacao}</td>
              <td className="p-2 border">{org.organizacao}</td>
              <td className="p-2 border text-center">{org.ativo ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// src/pages/usuarios.tsx

import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/router';

interface Usuario {
    idusuario: number;
    usuario: string;
    email: string;
    ativo: boolean;
}

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await api.get('/usuarios');
                setUsuarios(response.data);
            } catch {
                alert('Erro ao carregar usuários, redirecionando para login.');
                router.push('/login');
            }
        };
        fetchUsuarios();
    }, [router]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Usuários</h1>
            <table className="min-w-full bg-white shadow rounded">
                <thead>
                    <tr>
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">Usuário</th>
                        <th className="p-2 border">Email</th>
                        <th className="p-2 border">Ativo</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((user) => (
                        <tr key={user.idusuario}>
                            <td className="p-2 border text-center">{user.idusuario}</td>
                            <td className="p-2 border">{user.usuario}</td>
                            <td className="p-2 border">{user.email}</td>
                            <td className="p-2 border text-center">{user.ativo ? '✅' : '❌'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

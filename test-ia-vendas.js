// test-ia-vendas.js
const axios = require('axios');

async function testarIAVendas() {
  try {
    const dadosVendas = [
      {
        idvendas: 1,
        cliente: "João Silva",
        pedido: "PED001",
        dataemissao: "2025-07-10",
        valorvenda: 1500.00,
        valorcusto: 900.00,
        valorlucro: 600.00,
        tipo: "Venda",
        vendedor: "Maria Santos",
        empresa: "Empresa A"
      },
      {
        idvendas: 2,
        cliente: "Pedro Oliveira",
        pedido: "PED002",
        dataemissao: "2025-07-12",
        valorvenda: 2300.00,
        valorcusto: 1400.00,
        valorlucro: 900.00,
        tipo: "Venda",
        vendedor: "Carlos Lima",
        empresa: "Empresa B"
      }
    ];

    console.log('🧪 Testando rota da IA...');
    const response = await axios.post('http://localhost:3001/api/openai/vendas', {
      dadosVendas: dadosVendas
    });

    console.log('✅ Resposta da IA:', response.data);
  } catch (error) {
    console.error('❌ Erro ao testar IA:', error.response?.data || error.message);
  }
}

testarIAVendas();

// script-login-teste.js
// Script para fazer login automático e testar a página ia-vendas com dados reais

async function loginETestarIA() {
  console.log('🔐 Fazendo login como assessor...');
  
  try {
    // 1. Fazer login como assessor
    const loginResponse = await fetch('http://localhost:3001/auth/login-assessor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessor: 'Elton',
        senha: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login realizado com sucesso!');
      console.log('Token:', loginData.token);
      
      // 2. Salvar token no localStorage
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('idorganizacao', '1111');
      
      console.log('✅ Token salvo no localStorage');
      console.log('✅ Organização definida como 1111 (Clinivet)');
      
      // 3. Recarregar a página para usar os dados reais
      window.location.reload();
      
    } else {
      console.error('❌ Erro no login:', loginData);
    }
    
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
  }
}

// Função para limpar o localStorage (logout)
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('idorganizacao');
  console.log('✅ Logout realizado - localStorage limpo');
  window.location.reload();
}

// Função para verificar se está logado
function verificarLogin() {
  const token = localStorage.getItem('token');
  const idorganizacao = localStorage.getItem('idorganizacao');
  
  if (token && idorganizacao) {
    console.log('✅ Usuário logado');
    console.log('Organização:', idorganizacao);
    return true;
  } else {
    console.log('❌ Usuário não logado');
    return false;
  }
}

// Expor funções globalmente para uso no console
window.loginETestarIA = loginETestarIA;
window.logout = logout;
window.verificarLogin = verificarLogin;

console.log('🚀 Script carregado! Comandos disponíveis:');
console.log('- loginETestarIA() - Fazer login e testar com dados reais');
console.log('- logout() - Fazer logout e usar dados simulados');
console.log('- verificarLogin() - Verificar status do login');

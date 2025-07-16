// Exemplos de como os números estão sendo formatados na página de indicadores

// Função implementada no frontend
const formatNumberWithScale = (value) => {
    const absValue = Math.abs(value);
    const signal = value < 0 ? "-" : "";
    
    if (absValue >= 1000000000) {
        const billions = absValue / 1000000000;
        if (billions >= 100) return `${signal}${billions.toFixed(0)}B`;
        if (billions >= 10) return `${signal}${billions.toFixed(1)}B`;
        return `${signal}${billions.toFixed(2)}B`;
    } else if (absValue >= 1000000) {
        const millions = absValue / 1000000;
        if (millions >= 100) return `${signal}${millions.toFixed(0)}M`;
        if (millions >= 10) return `${signal}${millions.toFixed(1)}M`;
        return `${signal}${millions.toFixed(2)}M`;
    } else if (absValue >= 1000) {
        const thousands = absValue / 1000;
        if (thousands >= 100) return `${signal}${thousands.toFixed(0)}K`;
        if (thousands >= 10) return `${signal}${thousands.toFixed(1)}K`;
        return `${signal}${thousands.toFixed(2)}K`;
    } else {
        return `${signal}${absValue.toFixed(0)}`;
    }
};

const formatValue = (value, unidade) => {
    if (unidade === "%") {
        return `${value.toFixed(1)}%`;
    }
    
    if (unidade === 'R$') {
        return `R$ ${formatNumberWithScale(value)}`;
    }
    
    if (unidade === 'un') {
        return `${formatNumberWithScale(value)}`;
    }
    
    return `${formatNumberWithScale(value)} ${unidade}`;
};

// Exemplos de formatação nos indicadores
console.log("=== Formatação de Valores nos Indicadores ===");
console.log("Vendas R$ 1,230,000:", formatValue(1230000, 'R$')); // R$ 1.23M
console.log("Vendas R$ 123,000:", formatValue(123000, 'R$')); // R$ 123K
console.log("Vendas R$ 12,300:", formatValue(12300, 'R$')); // R$ 12.3K
console.log("Vendas R$ 1,230:", formatValue(1230, 'R$')); // R$ 1.23K
console.log("Vendas R$ 890:", formatValue(890, 'R$')); // R$ 890

console.log("\nPedidos (unidades):");
console.log("Pedidos 1,230:", formatValue(1230, 'un')); // 1.23K
console.log("Pedidos 123:", formatValue(123, 'un')); // 123
console.log("Pedidos 12.3:", formatValue(12.3, 'un')); // 12

console.log("\nMargens (percentual):");
console.log("Margem 15.5%:", formatValue(15.5, '%')); // 15.5%
console.log("Margem 8.2%:", formatValue(8.2, '%')); // 8.2%

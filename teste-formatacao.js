// Teste da função de formatação de números
const formatNumberWithScale = (value) => {
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

// Testes
console.log("=== Testes de Formatação ===");
console.log("1,230:", formatNumberWithScale(1230)); // 1,23K
console.log("12,300:", formatNumberWithScale(12300)); // 12,3K
console.log("123,000:", formatNumberWithScale(123000)); // 123K
console.log("1,230,000:", formatNumberWithScale(1230000)); // 1,23M
console.log("12,300,000:", formatNumberWithScale(12300000)); // 12,3M
console.log("123,000,000:", formatNumberWithScale(123000000)); // 123M
console.log("1,230,000,000:", formatNumberWithScale(1230000000)); // 1,23B
console.log("12,300,000,000:", formatNumberWithScale(12300000000)); // 12,3B
console.log("123,000,000,000:", formatNumberWithScale(123000000000)); // 123B
console.log("500:", formatNumberWithScale(500)); // 500
console.log("50:", formatNumberWithScale(50)); // 50
console.log("5:", formatNumberWithScale(5)); // 5
console.log("-1,230:", formatNumberWithScale(-1230)); // -1,23K

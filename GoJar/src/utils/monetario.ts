/**
 * Utilitários para formatação de valores monetários
 * O sistema mantém valores internamente como centavos inteiros (ex: 33000 = R$ 330.00)
 * Aplica máscara na interface para exibir com 2 casas decimais
 */

/**
 * Converte centavos inteiros para string formatada (ex: 33000 -> "330.00")
 */
export function formatarCentavosParaExibicao(centavos: number): string {
    const reais = Math.floor(centavos / 100);
    const centavosRestantes = centavos % 100;
    return `${reais}.${String(centavosRestantes).padStart(2, "0")}`;
}

/**
 * Extrai apenas dígitos do input e converte para centavos inteiros
 * Exemplos:
 * - Input "330.00" -> 33000 centavos
 * - Input "55555" -> 55555 centavos (555.55 reais)
 * - Input "100" -> 100 centavos (1.00 real)
 * - Input "1" -> 1 centavo (0.01 real)
 */
export function extrairCentavos(input: string): number {
    // Remove tudo que não é dígito
    const apenasDigitos = input.replace(/\D/g, "");

    if (!apenasDigitos) return 0;

    // Interpreta como centavos inteiros
    return parseInt(apenasDigitos, 10);
}

/**
 * Formata string de input em tempo real enquanto o usuário digita
 * Exemplos:
 * - "1" -> "0.01"
 * - "12" -> "0.12"
 * - "123" -> "1.23"
 * - "1234" -> "12.34"
 * - "55555" -> "555.55"
 */
export function formatarInputEmTempoReal(input: string): string {
    const centavos = extrairCentavos(input);
    if (centavos === 0) return "";

    return formatarCentavosParaExibicao(centavos);
}

/**
 * Converte valor decimal (ex: 330.00) para centavos inteiros (33000)
 */
export function converterReaisCentavos(reais: number | string): number {
    const numero = typeof reais === "string" ? parseFloat(reais) : reais;
    if (isNaN(numero)) return 0;
    return Math.round(numero * 100);
}

/**
 * Converte centavos inteiros para decimal (ex: 33000 -> 330.00)
 */
export function converterCentavosReais(centavos: number): number {
    return centavos / 100;
}

export interface Entrada {
    id: string;
    nome: string;
    valor: number;
    frequencia: "mensal" | "semanal" | "diária" | "única";
    dia: number;
    dataUnica?: string; // Data quando frequência for "única" (YYYY-MM-DD)
    ativo: boolean;
}

export interface Saida {
    id: string;
    nome: string;
    valor: number;
    frequencia: "mensal" | "semanal" | "diária" | "única";
    dia: number;
    dataUnica?: string; // Data quando frequência for "única" (YYYY-MM-DD)
    ativo: boolean;
}

export interface Meta {
    id: string;
    nome: string;
    valor: number;
    frequencia: "mensal" | "semanal" | "diária" | "única";
    dia: number;
    dataUnica?: string; // Data quando frequência for "única" (YYYY-MM-DD)
    ativo: boolean;
}

export type TipoItem = "entrada" | "saida" | "meta";

export interface Modal {
    aberto: boolean;
    tipo: TipoItem;
    itemId?: string;
}

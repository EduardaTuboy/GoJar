export interface Entrada {
    id: string;
    nome: string;
    valor: number;
    frequencia: "mensal" | "semanal" | "diária" | "única";
    dia: number;
    ativo: boolean;
}

export interface Saida {
    id: string;
    nome: string;
    valor: number;
    frequencia: "mensal" | "semanal" | "diária" | "única";
    dia: number;
    ativo: boolean;
}

export interface Meta {
    id: string;
    nome: string;
    valor: number;
    dataAlvo: string;
    ativo: boolean;
}

export type TipoItem = "entrada" | "saida" | "meta";

export interface Modal {
    aberto: boolean;
    tipo: TipoItem;
    itemId?: string;
}

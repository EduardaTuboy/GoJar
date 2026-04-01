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

export type Frequencia = "diária" | "semanal" | "mensal" | "anual" | "única";

export interface ItemBase {
    id: string;
    nome: string;
    valor: number;
    frequencia: Frequencia;
    ativo: boolean; // NOVO
    dia?: number;
    mes?: number; // NOVO: Usado para frequência anual
    dataUnica?: string;
    dataInicio?: string; // NOVO
    dataFim?: string; // NOVO: Pode ser data YYYY-MM-DD ou "indeterminado"
}

export interface RegistroSaldo {
    id: string;
    valor: number;
    data: string; // Data e hora no formato ISO
}

export interface SaldoConta {
    id: string;
    nome: string;
    historico: RegistroSaldo[];
}

export interface Entrada extends ItemBase { }
export interface Saida extends ItemBase { }
export interface Meta extends ItemBase { }

export interface Modal {
    aberto: boolean;
    tipo: TipoItem;
    itemId?: string;
}
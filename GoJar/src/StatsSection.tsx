import type { Entrada, Saida, Meta, TipoItem } from "./types";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

interface StatsSectionProps {
    titulo: string;
    tipo: TipoItem;
    itens: (Entrada | Saida | Meta)[];
    onEditar: (item: Entrada | Saida | Meta) => void;
    onDeletar: (id: string) => void;
    onAdicionar: () => void;
}

export function StatsSection({
    titulo,
    tipo,
    itens,
    onEditar,
    onDeletar,
    onAdicionar,
}: StatsSectionProps) {
    const formatarValor = (valor: number) => {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const getFrequenciaEspecifica = (
        item: Entrada | Saida | Meta
    ): string => {
        const entrada = item as Entrada | Saida | Meta;

        if (entrada.frequencia === "diária") {
            return "Todo dia";
        } else if (entrada.frequencia === "semanal") {
            const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
            return `Todo ${diasSemana[entrada.dia] || "dia"}`;
        } else if (entrada.frequencia === "mensal") {
            return `Dia ${entrada.dia} de cada mês`;
        } else if (entrada.frequencia === "única") {
            if (entrada.dataUnica) {
                const data = new Date(entrada.dataUnica);
                return `Data: ${data.toLocaleDateString("pt-BR")}`;
            }
            return "Uma única vez";
        } else {
            return "Uma única vez";
        }
    };

    const getFrequenciaLabel = (item: Entrada | Saida | Meta): string => {
        const entrada = item as Entrada | Saida | Meta;
        const frequenciaMap: Record<string, string> = {
            diária: "/dia",
            semanal: "/semana",
            mensal: "/mês",
            única: "uma vez",
        };
        return frequenciaMap[entrada.frequencia] || entrada.frequencia;
    };

    return (
        <div className="stats-section">
            <h3>{titulo}</h3>
            <ul>
                {itens.length === 0 ? (
                    <li className="empty">Nenhum item adicionado</li>
                ) : (
                    itens.map((item) => (
                        <li key={item.id}>
                            <span className="nome">{item.nome}</span>
                            <span className="valor">{formatarValor(item.valor)}</span>
                            <span className="frequencia-label">{getFrequenciaLabel(item)}</span>
                            <span className="edit">
                                <button
                                    onClick={() => onEditar(item)}
                                    title="Editar"
                                    className="icon-btn"
                                >
                                    <EditRoundedIcon />
                                </button>
                                <button
                                    onClick={() => onDeletar(item.id)}
                                    title="Deletar"
                                    className="icon-btn delete"
                                >
                                    <DeleteRoundedIcon />
                                </button>
                            </span>
                            <span className="freq-especifica">
                                {getFrequenciaEspecifica(item)}
                            </span>
                        </li>
                    ))
                )}
            </ul>
            <button className="add" onClick={onAdicionar} title={`Adicionar ${tipo}`}>
                <AddRoundedIcon />
            </button>
        </div>
    );
}

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
    onToggleAtivo: (id: string) => void; // NOVO
}

export function StatsSection({
    titulo,
    tipo,
    itens,
    onEditar,
    onDeletar,
    onAdicionar,
    onToggleAtivo, // NOVO
}: StatsSectionProps) {
    const formatarValor = (valor: number) => {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const getFrequenciaEspecifica = (item: Entrada | Saida | Meta): string => {
        const i = item as Entrada | Saida | Meta;
        let freqStr = "";

        // Lógica base da frequência
        if (i.frequencia === "diária") {
            freqStr = "Todo dia";
        } else if (i.frequencia === "semanal") {
            const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
            freqStr = `Todo(a) ${diasSemana[i.dia || 0] || "dia"}`;
        } else if (i.frequencia === "mensal") {
            freqStr = `Dia ${i.dia} de cada mês`;
        } else if (i.frequencia === "anual") {
            const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            freqStr = `Todo dia ${i.dia} de ${meses[(i.mes || 1) - 1]}`;
        } else if (i.frequencia === "única") {
            if (i.dataUnica) {
                const data = new Date(i.dataUnica);
                return `Data: ${data.toLocaleDateString("pt-BR")}`;
            }
            return "Uma única vez";
        }

        // Adiciona a lógica de período (Início e Fim)
        if (i.frequencia !== "única") {
            const formatarData = (d: string) => {
                const [ano, mes, dia] = d.split("-");
                return `${dia}/${mes}/${ano}`;
            };
            const strInicio = i.dataInicio ? formatarData(i.dataInicio) : null;
            const strFim = i.dataFim && i.dataFim !== "indeterminado" ? formatarData(i.dataFim) : null;

            if (strInicio && strFim) {
                freqStr += ` (De ${strInicio} até ${strFim})`;
            } else if (strInicio) {
                freqStr += ` (A partir de ${strInicio})`;
            } else if (strFim) {
                freqStr += ` (Até ${strFim})`;
            }
        }

        return freqStr;
    };

    const getFrequenciaLabel = (item: Entrada | Saida | Meta): string => {
        const i = item as Entrada | Saida | Meta;
        const frequenciaMap: Record<string, string> = {
            diária: "/dia",
            semanal: "/semana",
            mensal: "/mês",
            anual: "/ano",
            única: "uma vez",
        };
        return frequenciaMap[i.frequencia] || i.frequencia;
    };

    return (
        <div className="stats-section">
            <h3>{titulo}</h3>
            <ul>
                {itens.length === 0 ? (
                    <li className="empty">Nenhum item adicionado</li>
                ) : (
                    itens.map((item) => (
                        <li
                            key={item.id}
                            onClick={() => onToggleAtivo(item.id)} // Clique em qualquer lugar do item inverte o status
                            style={{
                                cursor: "pointer",
                                opacity: item.ativo === false ? 0.45 : 1, // Fica transparente
                                filter: item.ativo === false ? "grayscale(100%)" : "none", // Fica cinza
                                transition: "all 0.2s ease"
                            }}
                            title={item.ativo === false ? "Clique para reativar" : "Clique para desativar"}
                        >
                            <span className="nome">
                                {item.nome} {item.ativo === false && <small style={{ fontStyle: "italic" }}> (Inativo)</small>}
                            </span>
                            <span className="valor">{formatarValor(item.valor)}</span>
                            <span className="frequencia-label">{getFrequenciaLabel(item)}</span>

                            <span className="edit">
                                <button
                                    // O e.stopPropagation() impede que o clique no botão ative o onClick do <li>
                                    onClick={(e) => { e.stopPropagation(); onEditar(item); }}
                                    title="Editar"
                                    className="icon-btn"
                                >
                                    <EditRoundedIcon sx={{ fontSize: "clamp(20px, 4vw, 30px)" }} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeletar(item.id); }}
                                    title="Deletar"
                                    className="icon-btn delete"
                                >
                                    <DeleteRoundedIcon sx={{ fontSize: "clamp(20px, 4vw, 30px)" }} />
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
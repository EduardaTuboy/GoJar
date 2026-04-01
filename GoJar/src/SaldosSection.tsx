import { useState } from "react";
import type { SaldoConta, RegistroSaldo } from "./types";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton } from "@mui/material";

interface SaldosSectionProps {
    saldos: SaldoConta[];
    onAtualizarSaldos: (novosSaldos: SaldoConta[]) => void;
}

export function SaldosSection({ saldos, onAtualizarSaldos }: SaldosSectionProps) {
    const [editando, setEditando] = useState<Record<string, string>>({});
    const [historicoModal, setHistoricoModal] = useState<SaldoConta | null>(null);

    const handleEditClick = (id: string, valorAtual: number) => {
        if (editando[id] === undefined) {
            setEditando({ ...editando, [id]: valorAtual.toFixed(2) });
        }
    };

    const handleChange = (id: string, value: string) => {
        // Permite apenas números, vírgula e ponto
        if (/^[\d.,]*$/.test(value)) {
            setEditando({ ...editando, [id]: value });
        }
    };

    const handleSalvar = () => {
        const novosSaldos = saldos.map((conta) => {
            const novoValorStr = editando[conta.id];
            if (novoValorStr !== undefined) {
                // Converte vírgula para ponto e formata para número
                const valorFormatado = parseFloat(novoValorStr.replace(",", "."));
                if (!isNaN(valorFormatado)) {
                    const novoRegistro: RegistroSaldo = {
                        id: Date.now().toString() + Math.random(),
                        valor: valorFormatado,
                        data: new Date().toISOString(),
                    };
                    return {
                        ...conta,
                        historico: [novoRegistro, ...conta.historico],
                    };
                }
            }
            return conta;
        });

        onAtualizarSaldos(novosSaldos);
        setEditando({}); // Limpa o estado de edição
    };

    const handleAdicionar = () => {
        const nome = prompt("Nome do novo saldo (ex: Conta Corrente):");
        if (!nome) return;

        const novaConta: SaldoConta = {
            id: Date.now().toString(),
            nome,
            historico: [{
                id: Date.now().toString(),
                valor: 0,
                data: new Date().toISOString()
            }]
        };
        onAtualizarSaldos([...saldos, novaConta]);
    };

    const handleDeletar = (id: string) => {
        if (window.confirm("Tem certeza que deseja deletar este saldo?")) {
            onAtualizarSaldos(saldos.filter(s => s.id !== id));
            const newEditando = { ...editando };
            delete newEditando[id];
            setEditando(newEditando);
        }
    };

    const formatarDataHora = (isoString: string) => {
        const d = new Date(isoString);
        return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    };

    const formatarMoeda = (valor: number) => {
        return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const temAlteracoes = Object.keys(editando).length > 0;

    return (
        // Adicionamos a classe base 'stats-section' e uma extra 'saldos-section' para pequenos ajustes
        <div className="stats-section saldos-section">
            <h3>Saldos</h3>

            <div> {/* Essa div puxa automaticamente a caixa branca com borda grossa */}
                <ul>
                    {saldos.length === 0 ? (
                        <p className="empty">Nenhum saldo cadastrado.</p>
                    ) : (
                        saldos.map((conta) => {
                            const isEditing = editando[conta.id] !== undefined;
                            const ultimoRegistro = conta.historico[0] || { valor: 0, data: new Date().toISOString() };

                            return (
                                <li key={conta.id}> {/* O li já puxa a linha separadora de baixo */}
                                    <div className="saldo-header">{conta.nome}</div>
                                    <div className="saldo-row">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="saldo-input edit-mode"
                                                value={editando[conta.id]}
                                                onChange={(e) => handleChange(conta.id, e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <div
                                                className="saldo-input read-mode"
                                                onClick={() => handleEditClick(conta.id, ultimoRegistro.valor)}
                                            >
                                                {formatarMoeda(ultimoRegistro.valor)}
                                            </div>
                                        )}

                                        {/* Reutilizando a classe "edit" das Entradas/Saídas */}
                                        <span className="edit">
                                            <button className="icon-btn" onClick={() => setHistoricoModal(conta)} title="Ver Histórico">
                                                <EditRoundedIcon sx={{ fontSize: "clamp(20px, 4vw, 30px)" }} />
                                            </button>
                                            <button className="icon-btn delete" onClick={() => handleDeletar(conta.id)} title="Deletar">
                                                <DeleteRoundedIcon sx={{ fontSize: "clamp(20px, 4vw, 30px)" }} />
                                            </button>
                                        </span>
                                    </div>
                                    <div className="saldo-data">
                                        Alterado por último {formatarDataHora(ultimoRegistro.data)}
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>

                <div className="saldos-footer">
                    <button
                        className={`btn-salvar ${temAlteracoes ? 'active' : ''}`}
                        disabled={!temAlteracoes}
                        onClick={handleSalvar}
                    >
                        Salvar
                    </button>
                    {/* O botão '.add' é reutilizado, só ajeitamos a posição dele via CSS para ficar ao lado do Salvar */}
                    <button className="add" onClick={handleAdicionar} title="Adicionar Saldo">
                        <AddRoundedIcon />
                    </button>
                </div>
            </div>

            {/* Modal de Histórico... (permanece igual) */}
            <Dialog open={!!historicoModal} onClose={() => setHistoricoModal(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Histórico: {historicoModal?.nome}</DialogTitle>
                <DialogContent dividers>
                    <List>
                        {historicoModal?.historico.map((reg) => (
                            <ListItem key={reg.id}>
                                <ListItemText
                                    primary={`R$ ${formatarMoeda(reg.valor)}`}
                                    secondary={formatarDataHora(reg.data)}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        </div>
    );
}
import { useState } from "react";
import type { SaldoConta, RegistroSaldo } from "./types";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    DialogContentText
} from "@mui/material";

// IMPORTAÇÕES DOS UTILITÁRIOS MONETÁRIOS
import {
    formatarCentavosParaExibicao,
    extrairCentavos,
    converterReaisCentavos,
    converterCentavosReais,
} from "./utils/monetario";

interface SaldosSectionProps {
    saldos: SaldoConta[];
    onAtualizarSaldos: (saldos: SaldoConta[]) => void;
}

// Helpers para lidar com o input de data nativo que usa horário local
const formatToLocalDatetime = (isoStr: string) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const parseLocalDatetime = (localStr: string) => {
    if (!localStr) return new Date().toISOString();
    return new Date(localStr).toISOString();
};

export function SaldosSection({ saldos, onAtualizarSaldos }: SaldosSectionProps) {
    const [editando, setEditando] = useState<Record<string, number>>({});
    const [editingConta, setEditingConta] = useState<SaldoConta | null>(null);

    // Estados para os novos modais do Material UI
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [novoNomeSaldo, setNovoNomeSaldo] = useState("");
    const [deleteContaId, setDeleteContaId] = useState<string | null>(null);

    // ---- FUNÇÕES DE EDIÇÃO INLINE (Rápida) ----
    const handleEditClick = (id: string, valorAtual: number) => {
        if (editando[id] === undefined) {
            setEditando({ ...editando, [id]: converterReaisCentavos(valorAtual) });
        }
    };

    const handleChange = (id: string, value: string) => {
        const centavos = extrairCentavos(value);
        setEditando({ ...editando, [id]: centavos });
    };

    const handleSalvar = () => {
        const novosSaldos = saldos.map((conta) => {
            const centavos = editando[conta.id];
            if (centavos !== undefined) {
                const valorFormatado = converterCentavosReais(centavos);
                const novoRegistro: RegistroSaldo = {
                    id: Date.now().toString() + Math.random(),
                    valor: valorFormatado,
                    data: new Date().toISOString(),
                };
                return { ...conta, historico: [novoRegistro, ...conta.historico] };
            }
            return conta;
        });

        onAtualizarSaldos(novosSaldos);
        setEditando({});
    };

    // ---- FUNÇÕES GERAIS DA CONTA ----
    const handleAbrirAddModal = () => {
        setNovoNomeSaldo("");
        setAddModalOpen(true);
    };

    const confirmarAdicionar = () => {
        if (!novoNomeSaldo.trim()) return;

        const novaConta: SaldoConta = {
            id: Date.now().toString(),
            nome: novoNomeSaldo.trim(),
            ativo: true,
            historico: [{ id: Date.now().toString(), valor: 0, data: new Date().toISOString() }]
        };
        onAtualizarSaldos([...saldos, novaConta]);
        setAddModalOpen(false);
    };

    const handleAbrirDeleteModal = (id: string) => {
        setDeleteContaId(id);
    };

    const confirmarDeletar = () => {
        if (!deleteContaId) return;

        onAtualizarSaldos(saldos.filter(s => s.id !== deleteContaId));
        const newEditando = { ...editando };
        delete newEditando[deleteContaId];
        setEditando(newEditando);
        setDeleteContaId(null);
    };

    const toggleVisibility = (id: string) => {
        const novosSaldos = saldos.map(s => s.id === id ? { ...s, ativo: s.ativo === false ? true : false } : s);
        onAtualizarSaldos(novosSaldos);
    };

    // ---- FUNÇÕES DO MODAL DE EDIÇÃO PROFUNDA ----
    const handleCloseModal = () => setEditingConta(null);

    const handleModalChangeRegistro = (id: string, field: 'data' | 'valor', value: any) => {
        if (!editingConta) return;
        const newHistorico = editingConta.historico.map(reg => reg.id === id ? { ...reg, [field]: value } : reg);
        setEditingConta({ ...editingConta, historico: newHistorico });
    };

    const handleModalAddRegistro = () => {
        if (!editingConta) return;
        const novoRegistro: RegistroSaldo = {
            id: Date.now().toString() + Math.random(),
            valor: 0,
            data: new Date().toISOString()
        };
        setEditingConta({ ...editingConta, historico: [novoRegistro, ...editingConta.historico] });
    };

    const handleModalDeleteRegistro = (id: string) => {
        if (!editingConta) return;
        const newHistorico = editingConta.historico.filter(reg => reg.id !== id);
        setEditingConta({ ...editingConta, historico: newHistorico });
    };

    const handleSaveModal = () => {
        if (!editingConta) return;
        const historicoOrdenado = [...editingConta.historico].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        const contaToSave = { ...editingConta, historico: historicoOrdenado };

        const novosSaldos = saldos.map(s => s.id === contaToSave.id ? contaToSave : s);
        onAtualizarSaldos(novosSaldos);
        setEditingConta(null);
    };

    const formatarDataHora = (isoString: string) => {
        const d = new Date(isoString);
        return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`;
    };

    const formatarMoeda = (valor: number) => valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const temAlteracoes = Object.keys(editando).length > 0;

    return (
        <div className="stats-section saldos-section">
            <h3>Saldos</h3>

            <div>
                <ul>
                    {saldos.length === 0 ? (
                        <p className="empty">Nenhum saldo cadastrado.</p>
                    ) : (
                        saldos.map((conta) => {
                            const isEditing = editando[conta.id] !== undefined;
                            const ultimoRegistro = conta.historico[0] || { valor: 0, data: new Date().toISOString() };
                            const inativo = conta.ativo === false;

                            return (
                                <li
                                    key={conta.id}
                                    onClick={() => toggleVisibility(conta.id)}
                                    style={{
                                        cursor: "pointer",
                                        opacity: inativo ? 0.45 : 1,
                                        filter: inativo ? "grayscale(100%)" : "none",
                                        transition: 'all 0.2s ease'
                                    }}
                                    title={inativo ? "Clique para mostrar no gráfico" : "Clique para ocultar do gráfico"}
                                >
                                    <div className="saldo-header">{conta.nome} {inativo && "(Oculto)"}</div>
                                    <div className="saldo-row">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                className="saldo-input edit-mode"
                                                value={formatarCentavosParaExibicao(editando[conta.id])}
                                                onClick={(e) => e.stopPropagation()} // Impede o clique de desativar o item
                                                onChange={(e) => handleChange(conta.id, e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <div
                                                className="saldo-input read-mode"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Impede o clique de desativar o item
                                                    handleEditClick(conta.id, ultimoRegistro.valor);
                                                }}
                                            >
                                                {formatarMoeda(ultimoRegistro.valor)}
                                            </div>
                                        )}

                                        <span className="edit">
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.currentTarget.blur();
                                                    setEditingConta(conta);
                                                }}
                                                title="Editar Conta e Histórico"
                                            >
                                                <EditRoundedIcon sx={{ fontSize: "clamp(20px, 4vw, 30px)" }} />
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.currentTarget.blur();
                                                    handleAbrirDeleteModal(conta.id);
                                                }}
                                                title="Deletar"
                                            >
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
                    <button className="add" onClick={(e) => {
                        e.currentTarget.blur();
                        handleAbrirAddModal();
                    }} title="Adicionar Saldo">
                        <AddRoundedIcon />
                    </button>
                </div>
            </div>

            {/* MODAL DE EDIÇÃO AVANÇADA */}
            <Dialog open={!!editingConta} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>Configurações do Saldo</DialogTitle>
                <DialogContent dividers>
                    {editingConta && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "8px" }}>
                            <TextField
                                label="Nome da Conta"
                                fullWidth
                                value={editingConta.nome}
                                onChange={(e) => setEditingConta({ ...editingConta, nome: e.target.value })}
                            />

                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                    <h4 style={{ margin: 0 }}>Histórico de Lançamentos</h4>
                                    <Button size="small" startIcon={<AddRoundedIcon />} onClick={handleModalAddRegistro} variant="outlined">
                                        Novo Lançamento
                                    </Button>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {editingConta.historico.map((reg) => (
                                        <div key={reg.id} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                            <TextField
                                                type="datetime-local"
                                                size="small"
                                                label="Data e Hora"
                                                value={formatToLocalDatetime(reg.data)}
                                                onChange={(e) => handleModalChangeRegistro(reg.id, "data", parseLocalDatetime(e.target.value))}
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                type="text"
                                                inputProps={{ inputMode: "numeric" }}
                                                size="small"
                                                label="Valor (R$)"
                                                value={formatarCentavosParaExibicao(converterReaisCentavos(reg.valor))}
                                                onChange={(e) => {
                                                    const centavos = extrairCentavos(e.target.value);
                                                    handleModalChangeRegistro(reg.id, "valor", converterCentavosReais(centavos));
                                                }}
                                                fullWidth
                                            />
                                            <IconButton
                                                color="error"
                                                onClick={() => handleModalDeleteRegistro(reg.id)}
                                                disabled={editingConta.historico.length === 1}
                                                title="Deletar este registro"
                                            >
                                                <DeleteRoundedIcon />
                                            </IconButton>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveModal}>
                        Salvar Alterações
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL DE ADICIONAR SALDO */}
            <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Novo Saldo</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Digite o nome da nova conta ou saldo que deseja acompanhar.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        label="Nome do Saldo"
                        placeholder="Ex: Conta Corrente"
                        fullWidth
                        value={novoNomeSaldo}
                        onChange={(e) => setNovoNomeSaldo(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmarAdicionar();
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddModalOpen(false)}>Cancelar</Button>
                    <Button onClick={confirmarAdicionar} variant="contained" disabled={!novoNomeSaldo.trim()}>
                        Adicionar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            <Dialog open={!!deleteContaId} onClose={() => setDeleteContaId(null)} fullWidth maxWidth="xs">
                <DialogTitle>Deletar Saldo?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja deletar este saldo inteiramente? Todo o histórico associado a ele será perdido. Essa ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteContaId(null)}>Cancelar</Button>
                    <Button onClick={confirmarDeletar} variant="contained" color="error">
                        Deletar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
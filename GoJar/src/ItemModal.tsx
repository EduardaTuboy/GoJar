import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import type { Entrada, Saida, Meta, TipoItem } from "./types";
import {
    formatarCentavosParaExibicao,
    extrairCentavos,
    converterReaisCentavos,
    converterCentavosReais,
} from "./utils/monetario";

interface ItemModalProps {
    aberto: boolean;
    tipo: TipoItem;
    item?: Entrada | Saida | Meta;
    onSalvar: (item: Entrada | Saida | Meta) => void;
    onFechar: () => void;
}

export function ItemModal({
    aberto,
    tipo,
    item,
    onSalvar,
    onFechar,
}: ItemModalProps) {
    const hojeIso = new Date().toISOString().split("T")[0];

    const [formData, setFormData] = useState<any>({
        nome: "",
        valorCentavos: 0,
        frequencia: "mensal",
        dia: 1,
        mes: 1,
        dataUnica: hojeIso,
        dataInicio: hojeIso,
        dataFim: "indeterminado",
        ativo: true,
    });

    useEffect(() => {
        if (item) {
            setFormData({
                ...item,
                valorCentavos: converterReaisCentavos(item.valor),
                dataInicio: item.dataInicio || hojeIso,
                dataFim: item.dataFim || "indeterminado",
                ativo: item.ativo !== undefined ? item.ativo : true,
                mes: item.mes || 1,
            });
        } else {
            setFormData({
                nome: "",
                valorCentavos: 0,
                frequencia: "mensal",
                dia: 1,
                mes: 1,
                dataUnica: hojeIso,
                dataInicio: hojeIso,
                dataFim: "indeterminado",
                ativo: true,
            });
        }
    }, [item, aberto, hojeIso]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        if (name === "valor") {
            const centavos = extrairCentavos(value);
            setFormData({ ...formData, valorCentavos: centavos });
        } else if (type === "checkbox") {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: name === "dia" || name === "mes" ? parseInt(value, 10) : value,
        });
    };

    const handleDataFimCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            dataFim: e.target.checked ? "indeterminado" : hojeIso,
        });
    };

    const handleSalvar = () => {
        if (!formData.nome || formData.valorCentavos <= 0) {
            alert("Preencha o nome e um valor maior que zero.");
            return;
        }

        // Cria o item SEM o ID inicialmente
        const novoItem: any = {
            ...formData,
            valor: converterCentavosReais(formData.valorCentavos),
        };

        // Só coloca o ID no objeto se ele realmente já existir (Modo Edição)
        if (item?.id) {
            novoItem.id = item.id;
        }

        delete novoItem.valorCentavos;

        onSalvar(novoItem);
        onFechar();
    };

    return (
        <Dialog open={aberto} onClose={onFechar} maxWidth="sm" fullWidth>
            <DialogTitle>
                {item ? `Editar ${tipo}` : `Adicionar ${tipo}`}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField autoFocus fullWidth label="Nome" name="nome" value={formData.nome} onChange={handleChange} />
                    <TextField
                        fullWidth
                        label="Valor (R$)"
                        name="valor"
                        type="text"
                        inputProps={{ inputMode: "numeric" }}
                        value={formatarCentavosParaExibicao(formData.valorCentavos)}
                        onChange={handleChange}
                        placeholder="0.00"
                    />

                    <FormControl fullWidth>
                        <InputLabel>Frequência</InputLabel>
                        <Select
                            name="frequencia"
                            value={formData.frequencia || "mensal"}
                            onChange={(e) => handleSelectChange("frequencia", e.target.value)}
                            label="Frequência"
                        >
                            <MenuItem value="semanal">Semanal</MenuItem>
                            <MenuItem value="mensal">Mensal</MenuItem>
                            <MenuItem value="anual">Anual</MenuItem>
                            <MenuItem value="única">Única</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Lógica condicional dos Dias/Meses baseada na frequência */}
                    {formData.frequencia === "semanal" && (
                        <FormControl fullWidth>
                            <InputLabel>Dia da Semana</InputLabel>
                            <Select name="dia" value={String(formData.dia)} onChange={(e) => handleSelectChange("dia", e.target.value)} label="Dia da Semana">
                                <MenuItem value="0">Domingo</MenuItem>
                                <MenuItem value="1">Segunda</MenuItem>
                                <MenuItem value="2">Terça</MenuItem>
                                <MenuItem value="3">Quarta</MenuItem>
                                <MenuItem value="4">Quinta</MenuItem>
                                <MenuItem value="5">Sexta</MenuItem>
                                <MenuItem value="6">Sábado</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {(formData.frequencia === "mensal" || formData.frequencia === "anual") && (
                        <FormControl fullWidth>
                            <InputLabel>Dia do Mês</InputLabel>
                            <Select name="dia" value={String(formData.dia)} onChange={(e) => handleSelectChange("dia", e.target.value)} label="Dia do Mês">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                    <MenuItem key={day} value={String(day)}>{day}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {formData.frequencia === "anual" && (
                        <FormControl fullWidth>
                            <InputLabel>Mês</InputLabel>
                            <Select name="mes" value={String(formData.mes || 1)} onChange={(e) => handleSelectChange("mes", e.target.value)} label="Mês">
                                {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map((m, i) => (
                                    <MenuItem key={i + 1} value={String(i + 1)}>{m}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {formData.frequencia === "única" && (
                        <TextField fullWidth label="Data do Evento" name="dataUnica" type="date" InputLabelProps={{ shrink: true }} value={formData.dataUnica || ""} onChange={handleChange} />
                    )}

                    {/* Nova seção de Data de Início e Fim para eventos recorrentes */}
                    {formData.frequencia !== "única" && (
                        <div style={{ borderTop: "1px solid #eee", paddingTop: "16px", marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            <TextField fullWidth label="Data de Início (A partir de)" name="dataInicio" type="date" InputLabelProps={{ shrink: true }} value={formData.dataInicio || ""} onChange={handleChange} />

                            <FormControlLabel
                                control={<Checkbox checked={formData.dataFim === "indeterminado"} onChange={handleDataFimCheckbox} />}
                                label="Evento sem data final (Indeterminado)"
                            />

                            {formData.dataFim !== "indeterminado" && (
                                <TextField fullWidth label="Data de Fim (Até)" name="dataFim" type="date" InputLabelProps={{ shrink: true }} value={formData.dataFim || ""} onChange={handleChange} />
                            )}
                        </div>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onFechar}>Cancelar</Button>
                <Button onClick={handleSalvar} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
}
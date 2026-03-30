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
    const [formData, setFormData] = useState<any>({
        nome: "",
        valorCentavos: 0, // Armazenado como centavos inteiros
    });

    useEffect(() => {
        if (item) {
            // Converter valor para centavos inteiros ao editar
            setFormData({
                ...item,
                valorCentavos: converterReaisCentavos(item.valor),
            });
        } else {
            setFormData({
                nome: "",
                valorCentavos: 0,
                frequencia: "mensal",
                dia: 1,
                dataUnica: new Date().toISOString().split("T")[0],
                ativo: true,
            });
        }
    }, [item, aberto]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "valor") {
            // Extrai dígitos e converte para centavos
            const centavos = extrairCentavos(value);
            setFormData({
                ...formData,
                valorCentavos: centavos,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleValueBlur = () => {
        // Normaliza centavos (já está correto, nada a fazer)
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: name === "dia" ? parseInt(value, 10) : value,
        });
    };

    const handleSalvar = () => {
        if (!formData.nome || formData.valorCentavos <= 0) {
            alert("Preencha todos os campos corretamente");
            return;
        }

        const novoItem = {
            ...formData,
            valor: converterCentavosReais(formData.valorCentavos),
            id: item?.id || Date.now().toString(),
        };

        delete novoItem.valorCentavos; // Remove campo temporário

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
                    <TextField
                        fullWidth
                        label="Nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        label="Valor (R$)"
                        name="valor"
                        type="text"
                        inputProps={{ inputMode: "numeric" }}
                        value={formatarCentavosParaExibicao(formData.valorCentavos)}
                        onChange={handleChange}
                        onBlur={handleValueBlur}
                        placeholder="0.00"
                    />

                    {(tipo === "entrada" || tipo === "saida" || tipo === "meta") && (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>Frequência</InputLabel>
                                <Select
                                    name="frequencia"
                                    value={formData.frequencia || "mensal"}
                                    onChange={(e) =>
                                        handleSelectChange("frequencia", e.target.value)
                                    }
                                    label="Frequência"
                                >
                                    <MenuItem value="diária">Diária</MenuItem>
                                    <MenuItem value="semanal">Semanal</MenuItem>
                                    <MenuItem value="mensal">Mensal</MenuItem>
                                    <MenuItem value="única">Única</MenuItem>
                                </Select>
                            </FormControl>

                            {formData.frequencia === "semanal" && (
                                <FormControl fullWidth>
                                    <InputLabel>Dia da Semana</InputLabel>
                                    <Select
                                        name="dia"
                                        value={String(formData.dia)}
                                        onChange={(e) =>
                                            handleSelectChange("dia", e.target.value)
                                        }
                                        label="Dia da Semana"
                                    >
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

                            {formData.frequencia === "mensal" && (
                                <FormControl fullWidth>
                                    <InputLabel>Dia do Mês</InputLabel>
                                    <Select
                                        name="dia"
                                        value={String(formData.dia)}
                                        onChange={(e) =>
                                            handleSelectChange("dia", e.target.value)
                                        }
                                        label="Dia do Mês"
                                    >
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                                            (day) => (
                                                <MenuItem key={day} value={String(day)}>
                                                    {day}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                            )}

                            {formData.frequencia === "única" && (
                                <TextField
                                    fullWidth
                                    label="Data"
                                    name="dataUnica"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.dataUnica || ""}
                                    onChange={handleChange}
                                />
                            )}
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onFechar}>Cancelar</Button>
                <Button onClick={handleSalvar} variant="contained">
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

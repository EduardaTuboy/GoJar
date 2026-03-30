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
                dataAlvo: new Date().toISOString().split("T")[0],
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
            [name]: value,
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

                    {(tipo === "entrada" || tipo === "saida") && (
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

                            {formData.frequencia !== "única" && (
                                <TextField
                                    fullWidth
                                    label={
                                        formData.frequencia === "semanal" ? "Dia da semana" : "Dia"
                                    }
                                    name="dia"
                                    type="number"
                                    inputProps={{
                                        min: formData.frequencia === "semanal" ? 0 : 1,
                                        max: formData.frequencia === "semanal" ? 6 : 31,
                                    }}
                                    value={formData.dia}
                                    onChange={handleChange}
                                    helperText={
                                        formData.frequencia === "semanal"
                                            ? "0=domingo, 6=sábado"
                                            : "Dia do mês"
                                    }
                                />
                            )}
                        </>
                    )}

                    {tipo === "meta" && (
                        <TextField
                            fullWidth
                            label="Data Alvo"
                            name="dataAlvo"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.dataAlvo}
                            onChange={handleChange}
                        />
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

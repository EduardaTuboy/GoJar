import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { Entrada, Saida, Meta, SaldoConta } from './types';

type TipoEvento = "entrada" | "saida" | "meta";

interface Evento {
    tipo: TipoEvento;
    data: Date;
    valor: number;
    nome: string;
}

// Helpers para datas
const parseDateLocal = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');

function gerarEventos(entradas: Entrada[], saidas: Saida[], metas: Meta[], dataInicio: Date, numMeses: number = 12): Evento[] {
    const eventos: Evento[] = [];
    const dataFim = new Date(dataInicio);
    dataFim.setMonth(dataFim.getMonth() + numMeses);


    const processarLista = (lista: any[], tipoEvento: TipoEvento) => {

        for (const item of lista) {
            if (item.ativo === false) {
                continue;
            }

            const frequencia = item.frequencia;
            let eventosGeradosNesteItem = 0;

            if (frequencia === "única") {
                if (!item.dataUnica) continue;
                const data = parseDateLocal(item.dataUnica);
                if (data >= dataInicio && data <= dataFim) {
                    eventos.push({ tipo: tipoEvento, data, valor: item.valor, nome: item.nome });
                    eventosGeradosNesteItem++;
                } else {
                }
                continue;
            }

            const itemInicio = item.dataInicio ? parseDateLocal(item.dataInicio) : new Date(dataInicio);
            const itemFim = (item.dataFim && item.dataFim !== "indeterminado") ? parseDateLocal(item.dataFim) : new Date(dataFim);

            const janelaInicio = dataInicio > itemInicio ? dataInicio : itemInicio;
            const janelaFim = dataFim < itemFim ? dataFim : itemFim;

            if (janelaInicio > janelaFim) {
                continue;
            }

            if (frequencia === "mensal") {
                let curAno = janelaInicio.getFullYear();
                let curMes = janelaInicio.getMonth();
                while (true) {
                    const dataRef = new Date(curAno, curMes, 1);
                    if (dataRef > janelaFim) break;

                    const dia = item.dia || 1;
                    const validDay = Math.min(dia, getDaysInMonth(curAno, curMes));
                    const dataEvento = new Date(curAno, curMes, validDay);

                    if (dataEvento >= janelaInicio && dataEvento <= janelaFim) {
                        eventos.push({ tipo: tipoEvento, data: dataEvento, valor: item.valor, nome: item.nome });
                        eventosGeradosNesteItem++;
                    }
                    curMes++;
                    if (curMes > 11) { curMes = 0; curAno++; }
                }
            }
            else if (frequencia === "semanal") {
                let dataEvento = new Date(janelaInicio);
                const diaAlvo = item.dia || 0;
                while (dataEvento.getDay() !== diaAlvo) {
                    dataEvento.setDate(dataEvento.getDate() + 1);
                }
                while (dataEvento <= janelaFim) {
                    if (dataEvento >= janelaInicio) {
                        eventos.push({ tipo: tipoEvento, data: new Date(dataEvento), valor: item.valor, nome: item.nome });
                        eventosGeradosNesteItem++;
                    }
                    dataEvento.setDate(dataEvento.getDate() + 7);
                }
            }
            else if (frequencia === "anual") {
                let curAno = janelaInicio.getFullYear();
                while (true) {
                    const mes = (item.mes || 1) - 1;
                    const dia = item.dia || 1;
                    const validDay = Math.min(dia, getDaysInMonth(curAno, mes));
                    const dataEvento = new Date(curAno, mes, validDay);

                    if (dataEvento > janelaFim) break;
                    if (dataEvento >= janelaInicio) {
                        eventos.push({ tipo: tipoEvento, data: dataEvento, valor: item.valor, nome: item.nome });
                        eventosGeradosNesteItem++;
                    }
                    curAno++;
                }
            }

        }
    };

    processarLista(entradas, "entrada");
    processarLista(saidas, "saida");
    processarLista(metas, "meta");

    const eventosOrdenados = eventos.sort((a, b) => {
        if (a.data.getTime() !== b.data.getTime()) return a.data.getTime() - b.data.getTime();
        return (a.tipo === "meta" ? 0 : 1) - (b.tipo === "meta" ? 0 : 1);
    });

    return eventosOrdenados;
}

function calcularProjecao(dataInicial: Date, saldoInicial: number, eventos: Evento[]) {

    const seriesProjecao: [number, number][] = [];
    const seriesMetas: [number, number][] = [];

    let metasAcumuladas = eventos
        .filter(e => e.tipo === "meta" && e.data < dataInicial)
        .reduce((sum, e) => sum + e.valor, 0);

    let saldoAtual = saldoInicial;

    seriesProjecao.push([dataInicial.getTime(), saldoAtual]);
    seriesMetas.push([dataInicial.getTime(), metasAcumuladas]);

    const eventosFuturos = eventos.filter(e => e.data >= dataInicial);

    for (let i = 0; i < eventosFuturos.length; i++) {
        const ev = eventosFuturos[i];

        if (ev.tipo === "meta") metasAcumuladas += ev.valor;
        else if (ev.tipo === "entrada") saldoAtual += ev.valor;
        else if (ev.tipo === "saida") saldoAtual -= ev.valor;

        const simbolo = ev.tipo === "entrada" ? "🟢" : ev.tipo === "saida" ? "🔴" : "🎯";
        const sinal = ev.tipo === "entrada" ? "+" : ev.tipo === "saida" ? "-" : "+";

        seriesProjecao.push([ev.data.getTime(), saldoAtual]);
        seriesMetas.push([ev.data.getTime(), metasAcumuladas]);

        // Interpolação de "burn rate" entre os eventos
        if (i + 1 < eventosFuturos.length) {
            const proximoEvento = eventosFuturos[i + 1];
            const diasGap = Math.floor((proximoEvento.data.getTime() - ev.data.getTime()) / (1000 * 60 * 60 * 24));

            if (diasGap > 0) {
                let custoFuturo = 0;
                let metaFuturaTotal = metasAcumuladas;
                let dataRecarga = proximoEvento.data;

                for (let j = i + 1; j < eventosFuturos.length; j++) {
                    const evFuturo = eventosFuturos[j];
                    if (evFuturo.tipo === "entrada") { dataRecarga = evFuturo.data; break; }
                    if (evFuturo.tipo === "saida") custoFuturo += evFuturo.valor;
                    if (evFuturo.tipo === "meta") metaFuturaTotal += evFuturo.valor;
                }

                const diasTotaisCiclo = Math.max(1, Math.floor((dataRecarga.getTime() - ev.data.getTime()) / (1000 * 60 * 60 * 24)));
                const excessoAteRecarga = Math.max(0, saldoAtual - custoFuturo - metaFuturaTotal);
                const taxaDiariaAtiva = excessoAteRecarga / diasTotaisCiclo;

                for (let dia = 1; dia < diasGap; dia++) {
                    const dataInterp = new Date(ev.data.getTime() + dia * 24 * 60 * 60 * 1000);

                    if (saldoAtual > metasAcumuladas) {
                        saldoAtual -= taxaDiariaAtiva;
                        saldoAtual = Math.max(saldoAtual, metasAcumuladas);
                    }

                    seriesProjecao.push([dataInterp.getTime(), saldoAtual]);
                    seriesMetas.push([dataInterp.getTime(), metasAcumuladas]);
                }
            }
        }
    }

    return { seriesProjecao, seriesMetas };
}

interface GraficoProps {
    entradas: Entrada[];
    saidas: Saida[];
    metas: Meta[];
    saldos: SaldoConta[];
}

const MeuGrafico: React.FC<GraficoProps> = ({ entradas, saidas, metas, saldos }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        // 1. O EXATO MOMENTO ATUAL
        const agoraTimestamp = new Date().getTime();

        // 2. Mapeia as mudanças de saldo usando o horário exato
        const datasHistorico = new Set<number>();
        saldos.forEach(conta => {
            if (conta.ativo === false) return; // IGNORA SALDOS INATIVOS (OCULTOS)
            conta.historico.forEach(reg => {
                datasHistorico.add(new Date(reg.data).getTime());
            });
        });

        let datasOrdenadas = Array.from(datasHistorico).sort((a, b) => a - b);

        if (datasOrdenadas.length === 0) {
            datasOrdenadas = [agoraTimestamp];
        }

        const seriesHistorico: [number, number][] = [];
        let saldoAtualTotal = 0;

        // 3. Monta a linha do passado até o presente
        datasOrdenadas.forEach(timestamp => {
            let totalMomento = 0;
            saldos.forEach(conta => {
                if (conta.ativo === false) return; // IGNORA SALDOS INATIVOS

                // Garante que o histórico lido está ordenado do mais recente para o mais antigo
                const historicoOrdenado = [...conta.historico].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

                // Pega o primeiro registro válido (mais recente) que ocorreu antes ou no momento exato do timestamp
                const registroValido = historicoOrdenado.find(reg => new Date(reg.data).getTime() <= timestamp);
                if (registroValido) {
                    totalMomento += registroValido.valor;
                }
            });
            seriesHistorico.push([timestamp, totalMomento]);
            saldoAtualTotal = totalMomento;
        });

        // 4. PROJEÇÃO (Ignorando o Histórico)
        const dataHoje = new Date();
        dataHoje.setHours(0, 0, 0, 0);

        const eventosGerados = gerarEventos(entradas, saidas, metas, dataHoje, 12);

        // MUDANÇA 1: Passamos '0' em vez de 'saldoAtualTotal' como saldo inicial
        const { seriesProjecao, seriesMetas } = calcularProjecao(dataHoje, 0, eventosGerados);

        // CORREÇÃO VISUAL
        if (seriesProjecao.length > 0) {
            // MUDANÇA 2: O ponto inicial da linha no gráfico também deve ser fixado em 0
            seriesProjecao[0] = [agoraTimestamp, 0];
        }
        if (seriesMetas.length > 0) {
            seriesMetas[0] = [agoraTimestamp, seriesMetas[0][1]];
        }

        // 5. Opções do Gráfico
        // 5. Opções do Gráfico
        const options: ApexOptions = {
            series: [
                { name: 'Saldo Histórico', type: 'line', data: seriesHistorico },
                { name: 'Metas Acumuladas', type: 'line', data: seriesMetas },
                { name: 'Saldo Projetado', type: 'line', data: seriesProjecao }
            ],
            chart: {
                height: 350,
                type: 'line',
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    dynamicAnimation: { enabled: true, speed: 350 }
                },
                toolbar: { show: true },
                zoom: { enabled: true },
                fontFamily: 'Kadwa, serif',
            },
            colors: ['#01c02a', '#FF9800', '#2563d6'],
            stroke: {
                curve: ['stepline', 'stepline', 'smooth'],
                width: [3, 2, 4]
            },
            fill: {
                type: ['solid', 'solid', 'solid'],
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center',
                fontSize: '14px'
            },
            xaxis: {
                type: 'datetime',
                labels: { style: { fontSize: '12px' }, format: 'dd/MM' },
                axisBorder: { show: false },
                tooltip: { enabled: false }
            },
            yaxis: {
                floating: false, // Mudado para false: os números agora ficam fora da área das linhas do gráfico
                title: { text: undefined },
                labels: {
                    style: { fontSize: '11px', fontWeight: 'bold' }, // Fonte um pouquinho menor pra caber bem
                    offsetX: 0, // Resetado o deslocamento para não encavalar
                    formatter: (value) => {
                        if (value === undefined || value === null) return "";
                        const val = Math.abs(value);
                        const sign = value < 0 ? "-" : "";
                        // Formata compactado: ex: R$ 1.5M, R$ 5k, R$ 500
                        if (val >= 1000000) return `${sign}R$ ${(val / 1000000).toFixed(1)}M`;
                        if (val >= 1000) return `${sign}R$ ${(val / 1000).toFixed(1).replace('.0', '')}k`;
                        return `${sign}R$ ${val.toFixed(0)}`;
                    }
                }
            },
            grid: {
                borderColor: '#e7e7e7',
                strokeDashArray: 4,
                // O padding lateral foi removido para o ApexCharts dar o espaçamento automático ideal para os R$
            },
            markers: { size: [0, 0, 0] },
            tooltip: {
                shared: true,
                intersect: false,
                x: { format: 'dd MMM yyyy HH:mm' },
                y: {
                    formatter: function (y) {
                        if (typeof y !== "undefined") {
                            return y.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        }
                        return String(y);
                    }
                }
            }
        };

        chartRef.current.innerHTML = '';
        const chart = new ApexCharts(chartRef.current, options);
        chart.render();

        return () => { chart.destroy(); };

    }, [entradas, saidas, metas, saldos]);

    return (
        <div id="chart-container" style={{ background: '#fff', padding: '16px', borderRadius: '8px' }}>
            <div ref={chartRef}></div>
        </div>
    );
};

export default MeuGrafico;
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

// Helper para criar datas consistentes (ignora fuso horário para evitar bugs de virada de dia)
const parseDateLocal = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

function gerarEventos(entradas: Entrada[], saidas: Saida[], metas: Meta[], dataInicio: Date, numMeses: number = 12): Evento[] {
    const eventos: Evento[] = [];
    const dataFim = new Date(dataInicio);
    dataFim.setMonth(dataFim.getMonth() + numMeses);

    const processarLista = (lista: any[], tipoEvento: TipoEvento) => {
        for (const item of lista) {
            if (item.ativo === false) continue;

            const frequencia = item.frequencia;

            if (frequencia === "única") {
                if (!item.dataUnica) continue;
                const data = parseDateLocal(item.dataUnica);
                if (data >= dataInicio && data <= dataFim) {
                    eventos.push({ tipo: tipoEvento, data, valor: item.valor, nome: item.nome });
                }
                continue;
            }

            const itemInicio = item.dataInicio ? parseDateLocal(item.dataInicio) : new Date(dataInicio);
            const itemFim = (item.dataFim && item.dataFim !== "indeterminado") ? parseDateLocal(item.dataFim) : new Date(dataFim);

            const janelaInicio = dataInicio > itemInicio ? dataInicio : itemInicio;
            const janelaFim = dataFim < itemFim ? dataFim : itemFim;

            if (janelaInicio > janelaFim) continue;

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
                    }
                    dataEvento.setDate(dataEvento.getDate() + 7);
                }
            }
            else if (frequencia === "diária") {
                let dataEvento = new Date(janelaInicio);
                while (dataEvento <= janelaFim) {
                    eventos.push({ tipo: tipoEvento, data: new Date(dataEvento), valor: item.valor, nome: item.nome });
                    dataEvento.setDate(dataEvento.getDate() + 1);
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
                    }
                    curAno++;
                }
            }
        }
    };

    processarLista(entradas, "entrada");
    processarLista(saidas, "saida");
    processarLista(metas, "meta");

    // Ordenação: primeiro por data, em caso de empate, metas vêm primeiro.
    return eventos.sort((a, b) => {
        if (a.data.getTime() !== b.data.getTime()) return a.data.getTime() - b.data.getTime();
        return (a.tipo === "meta" ? 0 : 1) - (b.tipo === "meta" ? 0 : 1);
    });
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
            conta.historico.forEach(reg => {
                datasHistorico.add(new Date(reg.data).getTime());
            });
        });

        let datasOrdenadas = Array.from(datasHistorico).sort((a, b) => a - b);

        // Se a conta for nova, o marco zero é agora
        if (datasOrdenadas.length === 0) {
            datasOrdenadas = [agoraTimestamp];
        }

        const seriesHistorico: [number, number][] = [];
        let saldoAtualTotal = 0;

        // 3. Monta a linha do passado até o presente
        datasOrdenadas.forEach(timestamp => {
            let totalMomento = 0;
            saldos.forEach(conta => {
                const registroValido = conta.historico.find(reg => new Date(reg.data).getTime() <= timestamp);
                if (registroValido) {
                    totalMomento += registroValido.valor;
                }
            });
            seriesHistorico.push([timestamp, totalMomento]);
            saldoAtualTotal = totalMomento;
        });

        // Conecta o final do histórico exatamente com o segundo atual
        if (datasOrdenadas[datasOrdenadas.length - 1] < agoraTimestamp) {
            seriesHistorico.push([agoraTimestamp, saldoAtualTotal]);
        }

        // 4. PROJEÇÃO (O Truque da Sincronização)
        const dataHoje = new Date();
        dataHoje.setHours(0, 0, 0, 0); // O motor precisa da meia-noite para calcular contas recorrentes do dia

        const eventosGerados = gerarEventos(entradas, saidas, metas, dataHoje, 12);
        const { seriesProjecao, seriesMetas } = calcularProjecao(dataHoje, saldoAtualTotal, eventosGerados);

        // CORREÇÃO VISUAL: Forçamos o primeiro ponto do futuro a nascer EXATAMENTE de onde o histórico parou
        if (seriesProjecao.length > 0) {
            seriesProjecao[0] = [agoraTimestamp, saldoAtualTotal];
        }
        if (seriesMetas.length > 0) {
            seriesMetas[0] = [agoraTimestamp, seriesMetas[0][1]];
        }

        // 5. Opções do Gráfico
        const options: ApexOptions = {
            series: [
                { name: 'Saldo Histórico', type: 'line', data: seriesHistorico },
                { name: 'Metas Acumuladas', type: 'line', data: seriesMetas },
                { name: 'Saldo Projetado', type: 'area', data: seriesProjecao }
            ],
            chart: {
                height: 350,
                type: 'line',
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    dynamicAnimation: { enabled: true, speed: 350 } // Faz a linha subir fluidamente ao editar
                },
                toolbar: { show: true },
                zoom: { enabled: true },
                fontFamily: 'Kadwa, serif',
            },
            colors: ['#00002a', '#FF9800', '#96c7cf'],
            stroke: {
                curve: ['stepline', 'stepline', 'smooth'],
                width: [3, 2, 4]
            },
            fill: {
                type: ['solid', 'solid', 'gradient'],
                gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 100] }
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
                floating: true,
                title: { text: undefined },
                labels: {
                    style: { fontSize: '12px', fontWeight: 'bold' },
                    offsetX: -10,
                    formatter: (value) => {
                        const val = Math.abs(value);
                        if (val >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
                        if (val >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
                        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
                    }
                }
            },
            grid: {
                borderColor: '#e7e7e7', strokeDashArray: 4,
                padding: { left: 0, right: 0 }
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

        // 6. GARANTIA DE RE-RENDER: Limpa a "tela" antes de desenhar o gráfico atualizado
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
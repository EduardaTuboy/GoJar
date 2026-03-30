import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts'; // Importamos a biblioteca Pura
import type { ApexOptions } from 'apexcharts';

const MeuGrafico = () => {
    // 1. Criamos uma referência para a <div> onde o gráfico vai ser desenhado
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Se a div ainda não existe na tela, paramos por aqui
        if (!chartRef.current) return;

        // 2. Colocamos as opções e os dados (igualzinho antes)
        const options: ApexOptions = {
            series: [
                { name: 'TEAM A', type: 'column', data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30] },
                { name: 'TEAM B', type: 'area', data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43] },
                { name: 'TEAM C', type: 'line', data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39] }
            ],
            chart: {
                height: 350,
                type: 'line',
                stacked: false,
            },
            stroke: { width: [0, 2, 5], curve: 'smooth' },
            plotOptions: { bar: { columnWidth: '50%' } },
            fill: {
                opacity: [0.85, 0.25, 1],
                gradient: {
                    inverseColors: false,
                    shade: 'light',
                    type: "vertical",
                    opacityFrom: 0.85,
                    opacityTo: 0.55,
                    stops: [0, 100, 100, 100]
                }
            },
            labels: [
                '01/01/2003', '02/01/2003', '03/01/2003', '04/01/2003', '05/01/2003', '06/01/2003',
                '07/01/2003', '08/01/2003', '09/01/2003', '10/01/2003', '11/01/2003'
            ],
            xaxis: { type: 'datetime' },
            yaxis: { title: { text: 'Points' } },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (val: number) {
                        return val !== undefined && val !== null ? val.toFixed(0) + " points" : "0 points";
                    }
                }
            }
        };

        // 3. Instanciamos o gráfico manualmente apontando para a nossa div
        const chart = new ApexCharts(chartRef.current, options);

        // 4. Mandamos renderizar
        chart.render();

        // 5. LIMPEZA (Crucial no React! Quando sair da tela, destruímos o gráfico)
        return () => {
            chart.destroy();
        };
    }, []); // O array vazio [] garante que isso rode apenas uma vez quando a tela carregar

    // Retornamos apenas uma div vazia com a referência anexada
    return (
        <div id="chart-container">
            <div ref={chartRef}></div>
        </div>
    );
};

export default MeuGrafico;
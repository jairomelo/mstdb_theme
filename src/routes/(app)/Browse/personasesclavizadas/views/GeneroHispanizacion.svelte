<script>
    import { generoHispanizacion } from '$lib/api';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { afterUpdate } from 'svelte';

    let plotDiv;
    let generoHisp = null;
    let error = null;
    let loading = true;
    let Plotly;
    let plotCreated = false;

    let resizeObserver;

    const processData = (rawData) => {
        const statusSet = new Set();
        rawData.forEach(item => {
            const status = item.hispanizacion__hispanizacion || 'No especificado';
            if (status !== 'No especificado') {
                statusSet.add(status);
            }
        });
        const statuses = Array.from(statusSet);

        const counts = {
            v: {},
            m: {},
            i: {}
        };

        statuses.forEach(status => {
            counts.v[status] = 0;
            counts.m[status] = 0;
            counts.i[status] = 0;
        });

        rawData.forEach(item => {
            const status = item.hispanizacion__hispanizacion || 'No especificado';
            if (status !== 'No especificado') {
                counts[item.sexo][status] = item.count;
            }
        });

        return { statuses, counts };
    };

    const createPlot = async (data) => {
        if (!Plotly || !plotDiv || plotCreated) return;

        const processedData = processData(data);
        
        const traces = [
            {
                x: processedData.statuses,
                y: processedData.statuses.map(status => processedData.counts.v[status]),
                name: 'Hombre',
                type: 'bar',
                marker: {
                    color: '#3780bf',
                    opacity: 0.8
                }
            },
            {
                x: processedData.statuses,
                y: processedData.statuses.map(status => processedData.counts.m[status]),
                name: 'Mujer',
                type: 'bar',
                marker: {
                    color: '#862a28',
                    opacity: 0.8
                }
            },
            {
                x: processedData.statuses,
                y: processedData.statuses.map(status => processedData.counts.i[status]),
                name: 'Indeterminado',
                type: 'bar',
                marker: {
                    color: '#5d534c',
                    opacity: 0.8
                }
            },
            // Table trace
            {
                type: 'table',
                header: {
                    values: [['Hispanización'], ['Hombre'], ['Mujer'], ['Indeterminado']],
                    align: 'center',
                    line: { width: 1, color: '#1d1916' },
                    fill: { color: '#3780bf' },
                    font: { color: '#f8f5f2', size: 12 }
                },
                cells: {
                    values: [
                        processedData.statuses,
                        processedData.statuses.map(status => processedData.counts.v[status]),
                        processedData.statuses.map(status => processedData.counts.m[status]),
                        processedData.statuses.map(status => processedData.counts.i[status])
                    ],
                    align: 'center',
                    line: { width: 1, color: '#1d1916' },
                    fill: { color: '#f8f5f2' },
                    font: { color: '#1d1916', size: 11 }
                },
                domain: { y: [0, 0.35] }
            }
        ];

        const layout = {
            grid: {
                rows: 2,
                columns: 1,
                pattern: 'independent',
                roworder: 'top to bottom'
            },
            title: 'Distribución por Género e Hispanización',
            barmode: 'group',
            xaxis: {
                title: 'Hispanización',
                tickangle: -45,
                domain: [0, 0.85]
            },
            yaxis: {
                title: 'Cantidad',
                domain: [0.75, 1]
            },
            hovermode: 'closest',
            showlegend: true,
            legend: {
                x: 1.05,
                y: 1,
                xanchor: 'left'
            },
            margin: {
                b: 10,
                l: 50,
                r: 150,
                t: 100
            },
            width: plotDiv.offsetWidth,
            height: plotDiv.offsetHeight,
            paper_bgcolor: '#f8f5f2',
            plot_bgcolor: '#f8f5f2',
            font: {
                color: '#1d1916'
            }
        };

        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false,
            locale: 'es',
            autosize: true
        };

        try {
            await Plotly.newPlot(plotDiv, traces, layout, config);
            plotCreated = true;
        } catch (e) {
            console.error('Error creating plot:', e);
        }
    };

    let resizeTimeout;

    const handleResize = () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(() => {
            if (plotDiv && Plotly && plotCreated) {
                Plotly.relayout(plotDiv, {
                    width: plotDiv.offsetWidth,
                    height: plotDiv.offsetHeight
                });
            }
        }, 200);
    };

    onMount(async () => {
        if (browser) {
            try {
                Plotly = (await import('plotly.js-dist')).default;
                loading = true;
                generoHisp = await generoHispanizacion();

                // Setup resize observer
                resizeObserver = new ResizeObserver(handleResize);
                if (plotDiv) {
                    resizeObserver.observe(plotDiv.parentElement);
                }
            } catch (e) {
                error = e.message;
                console.error('Error in component setup:', e);
            } finally {
                loading = false;
            }
        }

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    });

    afterUpdate(async () => {
        if (generoHisp && plotDiv && Plotly && !plotCreated) {
            await createPlot(generoHisp);
        }
    });
</script>

<div class="card shadow">
    <div class="card-header bg-primary text-white">
        <h3 class="card-title mb-0">Distribución por Género e Hispanización</h3>
    </div>
    <div class="card-body">
        {#if loading}
            <div class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        {:else if error}
            <div class="alert alert-danger" role="alert">
                Error: {error}
            </div>
        {:else if generoHisp}
            <div 
                bind:this={plotDiv} 
                class="hispanizacion-plot-container"
                id="plot-container"
            ></div>
        {/if}
    </div>
</div>

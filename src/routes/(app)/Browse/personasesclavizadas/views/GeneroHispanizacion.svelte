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

    const processData = (rawData) => {
        const statusSet = new Set();
        rawData.forEach(item => {
            const status = item.hispanizacion__hispanizacion || 'No especificado';
            statusSet.add(status);
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
            counts[item.sexo][status] = item.count;
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
                name: 'Masculino',
                type: 'bar',
                marker: {
                    color: 'rgb(54, 162, 235)',
                    opacity: 0.8
                }
            },
            {
                x: processedData.statuses,
                y: processedData.statuses.map(status => processedData.counts.m[status]),
                name: 'Femenino',
                type: 'bar',
                marker: {
                    color: 'rgb(255, 99, 132)',
                    opacity: 0.8
                }
            },
            {
                x: processedData.statuses,
                y: processedData.statuses.map(status => processedData.counts.i[status]),
                name: 'No especificado',
                type: 'bar',
                marker: {
                    color: 'rgb(150, 150, 150)',
                    opacity: 0.8
                }
            }
        ];

        const layout = {
            title: 'Distribución por Género e Hispanización',
            barmode: 'group',
            xaxis: {
                title: 'Hispanización',
                tickangle: -45
            },
            yaxis: {
                title: 'Cantidad'
            },
            hovermode: 'closest',
            showlegend: true,
            legend: {
                x: 0,
                y: 1.2
            },
            margin: {
                b: 150,
                l: 50,
                r: 50,
                t: 100
            },
            width: plotDiv.offsetWidth,
            height: plotDiv.offsetHeight
        };

        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false,
            locale: 'es'
        };

        try {
            await Plotly.newPlot(plotDiv, traces, layout, config);
            plotCreated = true;
        } catch (e) {
            console.error('Error creating plot:', e);
        }
    };

    afterUpdate(async () => {
        if (generoHisp && plotDiv && Plotly && !plotCreated) {
            await createPlot(generoHisp);
        }
    });

    onMount(async () => {
        if (browser) {
            try {
                Plotly = (await import('plotly.js-dist')).default;
                loading = true;
                generoHisp = await generoHispanizacion();
            } catch (e) {
                error = e.message;
                console.error('Error in component setup:', e);
            } finally {
                loading = false;
            }
        }
    });
</script>

<div class="card shadow mt-4">
    <div class="card-header bg-primary text-white">
        <h4 class="card-title mb-0">Distribución por Género e Hispanización</h4>
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
                style="width: 100%; height: 60vh;"
                id="plot-container"
            ></div>
        {/if}
    </div>
</div>

<style>
    :global(.js-plotly-plot) {
        width: 100%;
    }
</style>
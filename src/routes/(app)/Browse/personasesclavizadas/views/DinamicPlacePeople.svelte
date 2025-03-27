<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { placePeopleDistribution } from '$lib/api';

    let Plotly;
    let plotDiv;
    let tableDiv;
    let placePeople = null;
    let selectedPlace = 'all';
    let searchTerm = '';
    let showDropdown = false;
    let places = [];
    let filteredPlaces = [];

    const processData = (rawData) => {
        places = ['all', ...new Set(rawData.map(d => d.lugar).filter(Boolean))];
        updateFilteredPlaces();
        
        const filteredData = selectedPlace === 'all' 
            ? rawData 
            : rawData.filter(d => d.lugar === selectedPlace);

        const maxCount = Math.max(...filteredData.map(d => d.count));
        const minCount = Math.min(...filteredData.map(d => d.count));
        
        const addJitter = (value, amount = 0.3) => {
            return value + (Math.random() - 0.5) * amount;
        };

        const groupedByYear = filteredData.reduce((acc, d) => {
            if (d.lugar === null || d.year === null) return acc;
            const key = `${d.year}-${d.count}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(d);
            return acc;
        }, {});

        const processedData = {};
        Object.entries(groupedByYear).forEach(([key, points]) => {
            const [year] = key.split('-');
            if (!processedData[year]) processedData[year] = [];
            
            points.forEach(d => {
                const sizeScale = (count) => {
                    const minSize = 15;
                    const maxSize = 45;
                    return minSize + ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize);
                };

                processedData[year].push({
                    x: parseInt(year),
                    y: points.length > 1 ? addJitter(d.count) : d.count,
                    originalY: d.count,
                    text: `${d.lugar} (${d.tipo})<br>Count: ${d.count}`,
                    size: sizeScale(d.count),
                    tipo: d.tipo
                });
            });
        });

        return Object.keys(processedData)
            .sort()
            .map(year => ({
                year: parseInt(year),
                data: processedData[year]
            }));
    };

    const updateFilteredPlaces = () => {
        filteredPlaces = places.filter(place => 
            place.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const handleSearch = (event) => {
        searchTerm = event.target.value;
        updateFilteredPlaces();
        showDropdown = true;
    };

    const handleSelect = (place) => {
        selectedPlace = place;
        searchTerm = place === 'all' ? 'Todos los Lugares' : place;
        showDropdown = false;
        
        if (browser && placePeople && Plotly) {
            const processedData = processData(placePeople);
            renderPlot(processedData);
        }
    };

    const handleClickOutside = (event) => {
        const select = event.target.closest('.custom-select');
        if (!select) {
            showDropdown = false;
        }
    };

    const renderPlot = (processedData) => {
        if (!browser || !Plotly) return;

        const frames = processedData.map(yearData => ({
            name: yearData.year,
            data: [{
                x: yearData.data.map(d => d.x),
                y: yearData.data.map(d => d.y),
                text: yearData.data.map(d => d.text),
                customdata: yearData.data.map(d => d.originalY),
                mode: 'markers+text',
                textposition: 'top',
                textfont: { size: 10 },
                marker: {
                    size: yearData.data.map(d => d.size),
                    color: '#3780bf',
                    opacity: 0.8
                },
                hovertemplate: '%{text}<extra></extra>',
                showlegend: false
            }]
        }));

        const layout = {
            title: {
                text: selectedPlace === 'all' 
                    ? 'Personas Asociadas a Lugares a lo Largo del Tiempo'
                    : `Personas Asociadas a ${selectedPlace} a lo Largo del Tiempo`,
                font: { size: 24 }
            },
            xaxis: { 
                title: { text: 'Año', font: { size: 16 }},
                range: [Math.min(...processedData.map(d => d.year)) - 2, 
                       Math.max(...processedData.map(d => d.year)) + 2],
                gridcolor: '#E1E1E1',
                zerolinecolor: '#969696',
                domain: [0, 0.85]
            },
            yaxis: { 
                title: { text: 'Número de Personas', font: { size: 16 }},
                gridcolor: '#E1E1E1',
                zerolinecolor: '#969696',
                range: [-0.5, Math.max(...processedData.flatMap(d => d.data.map(item => item.originalY))) * 1.1],
                tickformat: 'd'
            },
            updatemenus: [{
                x: 0, y: 0,
                yanchor: 'top',
                xanchor: 'left',
                showactive: false,
                direction: 'left',
                type: 'buttons',
                pad: {t: 87, r: 10},
                buttons: [{
                    method: 'animate',
                    args: [null, {
                        fromcurrent: true,
                        frame: {duration: 1000},
                        transition: {duration: 500}
                    }],
                    label: '▶'
                }, {
                    method: 'animate',
                    args: [[null], {
                        mode: 'immediate',
                        transition: {duration: 0},
                        frame: {duration: 0}
                    }],
                    label: '⏸'
                }]
            }],
            sliders: [{
                y: 0, x: 0.15,
                len: 0.7,
                currentvalue: {
                    visible: true,
                    prefix: 'Año: ',
                    xanchor: 'right',
                    font: {size: 20, color: '#666'}
                },
                steps: processedData.map(yearData => ({
                    method: 'animate',
                    label: yearData.year,
                    args: [[yearData.year], {
                        mode: 'immediate',
                        transition: {duration: 300},
                        frame: {duration: 300, redraw: false}
                    }]
                }))
            }],
            plot_bgcolor: '#FFFFFF',
            paper_bgcolor: '#FFFFFF',
            hovermode: 'closest',
            showlegend: false,
            margin: { b: 100, l: 50, r: 150, t: 100 },
            width: plotDiv.offsetWidth,
            height: plotDiv.offsetHeight
        };

        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false,
            locale: 'es',
            autosize: true
        };

        Plotly.newPlot(plotDiv, frames[0].data, layout, config)
            .then(() => Plotly.addFrames(plotDiv, frames));

        const allData = processedData.flatMap(yearData => yearData.data);
        const uniquePlaces = [...new Set(allData.map(d => d.text.split(' (')[0]))];
        const summaryData = uniquePlaces.map(place => {
            const placeData = allData.filter(d => d.text.split(' (')[0] === place);
            const total = placeData.reduce((sum, d) => sum + d.originalY, 0);
            const years = [...new Set(placeData.map(d => d.x))].sort();
            return {
                place,
                total,
                yearRange: years.length > 0 ? `${Math.min(...years)} - ${Math.max(...years)}` : 'N/A',
                avgPerYear: years.length > 0 ? (total / years.length).toFixed(1) : 'N/A',
                yearsCount: years.length
            };
        }).sort((a, b) => b.total - a.total);

        const tableLayout = {
            title: 'Sumario',
            showlegend: false,
            height: 400
        };

        const tableData = [{
            type: 'table',
            header: {
                values: [
                    ['<b>Lugar</b>'], 
                    ['<b>Total</b>'], 
                    ['<b>Periodo</b>'], 
                    ['<b>Promedio por Año</b>'], 
                    ['<b>Años con Registros</b>']
                ],
                align: 'center',
                line: { width: 1, color: '#1d1916' },
                fill: { color: '#3780bf' },
                font: { color: '#f8f5f2', size: 12 }
            },
            cells: {
                values: [
                    summaryData.map(d => d.place),
                    summaryData.map(d => d.total),
                    summaryData.map(d => d.yearRange),
                    summaryData.map(d => d.avgPerYear),
                    summaryData.map(d => d.yearsCount)
                ],
                align: ['left', 'right', 'center', 'right', 'right'],
                line: { width: 1, color: '#1d1916' },
                fill: { color: '#f8f5f2' },
                font: { color: '#1d1916', size: 11 }
            }
        }];

        Plotly.newPlot(tableDiv, tableData, tableLayout);
    };

    onMount(async () => {
        if (browser) {
            Plotly = await import('plotly.js-dist');
            placePeople = await placePeopleDistribution();
            const processedData = processData(placePeople);
            renderPlot(processedData);
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            if (browser) {
                document.removeEventListener('click', handleClickOutside);
            }
        };
    });
</script>

<div class="place-filter-container">
    <div class="custom-select">
        <input
            type="text"
            class="place-filter-input"
            placeholder="Buscar lugar..."
            value={searchTerm}
            on:input={handleSearch}
            on:focus={() => showDropdown = true}
        />
        {#if showDropdown && filteredPlaces.length > 0}
            <div class="place-filter-list">
                {#each filteredPlaces as place}
                    <button
                        type="button"
                        class="place-filter-item"
                        class:selected={place === selectedPlace}
                        on:click={() => handleSelect(place)}
                        on:keydown={e => e.key === 'Enter' && handleSelect(place)}
                    >
                        {place === 'all' ? 'Todos los Lugares' : place}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>

<div class="place-view-container" bind:this={plotDiv} style="height: 80vh; width: 100%;"></div>
<div class="place-view-container" bind:this={tableDiv} style="height: 400px; width: 100%; margin-top: 20px;"></div>


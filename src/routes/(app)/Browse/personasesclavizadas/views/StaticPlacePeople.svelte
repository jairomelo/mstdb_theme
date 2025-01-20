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

        // Scale for bubble sizes
        const maxCount = Math.max(...filteredData.map(d => d.count));
        const minCount = Math.min(...filteredData.map(d => d.count));
        
        const sizeScale = (count) => {
            const minSize = 15;
            const maxSize = 45;
            return minSize + ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize);
        };

        // Process data for static view
        return filteredData.map(d => ({
            x: d.year,
            y: d.count,
            text: `${d.lugar} (${d.tipo})<br>Count: ${d.count}`,
            size: sizeScale(d.count),
            tipo: d.tipo
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

        const data = [{
            x: processedData.map(d => d.x),
            y: processedData.map(d => d.y),
            text: processedData.map(d => d.text),
            mode: 'markers',
            textposition: 'top',
            textfont: { size: 10 },
            marker: {
                size: processedData.map(d => d.size),
                color: '#3780bf',
                opacity: 0.8
            },
            hovertemplate: '%{text}<extra></extra>',
            showlegend: false
        }];

        const layout = {
            title: {
                text: selectedPlace === 'all' 
                    ? 'Personas Asociadas a Lugares a lo Largo del Tiempo'
                    : `Personas Asociadas a ${selectedPlace} a lo Largo del Tiempo`,
                font: { size: 24 }
            },
            xaxis: { 
                title: { text: 'Año', font: { size: 16 }},
                gridcolor: '#E1E1E1',
                zerolinecolor: '#969696'
            },
            yaxis: { 
                title: { text: 'Número de Personas', font: { size: 16 }},
                gridcolor: '#E1E1E1',
                zerolinecolor: '#969696',
                tickformat: 'd'
            },
            plot_bgcolor: '#FFFFFF',
            paper_bgcolor: '#FFFFFF',
            hovermode: 'closest',
            showlegend: false,
            margin: { b: 100, l: 50, r: 50, t: 100 },
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

        Plotly.newPlot(plotDiv, data, layout, config);

        const years = [...new Set(processedData.map(d => d.x))];
        
        const summaryData = processedData.reduce((acc, d) => {
            const place = d.text.split(' (')[0];
            const existing = acc.find(item => item.place === place);
            
            if (existing) {
                existing.total += d.y;
            } else {
                acc.push({
                    place,
                    total: d.y,
                    yearRange: `${Math.min(...years)} - ${Math.max(...years)}`,
                    avgPerYear: (d.y / years.length).toFixed(1),
                    yearsCount: years.length
                });
            }
            return acc;
        }, []).sort((a, b) => b.total - a.total);

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


<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { placePeopleDistribution } from '$lib/api';
    import * as d3 from 'd3';

    let plotContainer;
    let tableContainer;
    let rawData = [];
    let filteredData = [];
    let placeSummary = [];
    
    let selectedPlace = 'all';
    let searchTerm = '';
    let showDropdown = false;
    let places = [];
    let filteredPlaces = [];
    
    let minYear = Infinity;
    let maxYear = -Infinity;
    let yearRangeMin = Infinity;
    let yearRangeMax = -Infinity;

    let sortConfig = { field: 'total', direction: 'desc' };
    let tooltip; // Reusable tooltip

    const processPlaceSummary = (data) => {
        const grouped = d3.group(data, d => d.lugar);
        return Array.from(grouped.entries()).map(([lugar, items]) => {
            const years = items.map(d => d.year);
            const total = d3.sum(items, d => d.count);
            const periodo = `${Math.min(...years)} - ${Math.max(...years)}`;
            const lugar_id = items[0].lugar_id; // All items in group have same lugar_id
            return { lugar, lugar_id, total, periodo, tipo: items[0].tipo };
        });
    };

    const updateFilteredData = () => {
        filteredData = rawData.filter(d => {
            const placeMatch = selectedPlace === 'all' || d.lugar === selectedPlace;
            const yearMatch = d.year >= yearRangeMin && d.year <= yearRangeMax;
            return placeMatch && yearMatch;
        });
        updatePlaceSummary();
        renderVisualization();
        renderTable();
    };

    const updatePlaceSummary = () => {
        placeSummary = processPlaceSummary(filteredData)
            .sort(sortByField);
    };

    const sortByField = (a, b) => {
        const aVal = a[sortConfig.field];
        const bVal = b[sortConfig.field];
        const mult = sortConfig.direction === 'asc' ? 1 : -1;
        return (aVal > bVal ? 1 : -1) * mult;
    };

    const toggleSort = (field) => {
        if (sortConfig.field === field) {
            sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortConfig.field = field;
            sortConfig.direction = 'desc';
        }
        updatePlaceSummary();
        renderTable();
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
        updateFilteredData();
    };

    const handleClickOutside = (event) => {
        const select = event.target.closest('.place-filter-container');
        if (!select) {
            showDropdown = false;
        }
    };

    const handleYearRangeChange = (event) => {
        const { name, value } = event.target;
        const newValue = parseInt(value);
        
        if (name === 'yearMin') {
            if (newValue <= yearRangeMax) {
                yearRangeMin = newValue;
            } else {
                // Reset to previous valid value if invalid
                event.target.value = yearRangeMin;
                return;
            }
        }
        if (name === 'yearMax') {
            if (newValue >= yearRangeMin) {
                yearRangeMax = newValue;
            } else {
                // Reset to previous valid value if invalid
                event.target.value = yearRangeMax;
                return;
            }
        }
        updateFilteredData();
    };

    const navigateToSearch = (lugar, lugar_id, year) => {
        const searchParams = new URLSearchParams({
            tab: 'personaesclavizada',
            procedencia: lugar_id,
            fecha_documento__gte: year,
            fecha_documento__lte: year + 1
        });
        window.location.href = `/Search?${searchParams.toString()}`;
    };

    const renderVisualization = () => {
        if (!browser || !plotContainer || filteredData.length === 0) return;

        const margin = { top: 40, right: 30, bottom: 60, left: 60 };
        const width = plotContainer.clientWidth - margin.left - margin.right;
        const height = plotContainer.clientHeight - margin.top - margin.bottom;

        // Clear previous content
        d3.select(plotContainer).selectAll('svg').remove();

        const svg = d3.select(plotContainer)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.year))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.count)])
            .range([height, 0]);

        const sizeScale = d3.scaleSqrt()
            .domain([0, d3.max(filteredData, d => d.count)])
            .range([4, 20]);

        // X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
            .append('text')
            .attr('x', width / 2)
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1d1916')
            .text('Año');

        // Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d3.format('d')))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1d1916')
            .text('Número de Personas');

        // Reuse or create tooltip (only once per app lifecycle)
        if (!tooltip) {
            tooltip = d3.select('body')
                .append('div')
                .attr('role', 'tooltip')
                .style('position', 'absolute')
                .style('background', '#1d1916')
                .style('color', '#f8f5f2')
                .style('padding', '8px 12px')
                .style('border-radius', '4px')
                .style('pointer-events', 'none')
                .style('display', 'none')
                .style('z-index', 1000)
                .style('font-size', '12px');
        }

        // Circles
        svg.selectAll('circle')
            .data(filteredData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.year))
            .attr('cy', d => yScale(d.count))
            .attr('r', d => sizeScale(d.count))
            .attr('fill', '#3780bf')
            .attr('opacity', 0.7)
            .attr('stroke', '#2a5a8f')
            .attr('stroke-width', 1.5)
            .style('cursor', 'pointer')
            .attr('role', 'button')
            .attr('tabindex', 0)
            .attr('aria-label', d => `${d.lugar}, ${d.year}: ${d.count} personas. Presione Enter para filtrar por este lugar y año.`)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('opacity', 1)
                    .attr('stroke-width', 2.5);
                
                tooltip.style('display', 'block')
                    .html(`<strong>${d.lugar}</strong><br/>Tipo: ${d.tipo}<br/>Año: ${d.year}<br/>Personas: ${d.count}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('opacity', 0.7)
                    .attr('stroke-width', 1.5);
                tooltip.style('display', 'none');
            })
            .on('click', (event, d) => {
                navigateToSearch(d.lugar, d.lugar_id, d.year);
            })
            .on('keydown', (event, d) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigateToSearch(d.lugar, d.lugar_id, d.year);
                }
            });
    };

    const renderTable = () => {
        if (!browser || !tableContainer) return;

        tableContainer.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'summary-table';
        table.setAttribute('role', 'table');
        table.setAttribute('aria-label', 'Resumen de personas por lugar');

        // Header
        const thead = table.createTHead();
        const headerRow = thead.insertRow();

        ['Lugar', 'Total', 'Periodo'].forEach((text, idx) => {
            const th = document.createElement('th');
            th.setAttribute('role', 'columnheader');
            th.setAttribute('scope', 'col');
            th.textContent = text;
            th.style.cursor = 'pointer';
            th.style.userSelect = 'none';
            
            const field = ['lugar', 'total', 'periodo'][idx];
            const direction = sortConfig.field === field ? sortConfig.direction : 'none';
            const indicator = direction !== 'none' 
                ? (direction === 'asc' ? ' ▲' : ' ▼')
                : '';
            
            th.textContent = text + indicator;
            th.setAttribute('aria-sort', direction);
            th.setAttribute('tabindex', 0);
            
            const clickHandler = () => toggleSort(field);
            th.onclick = clickHandler;
            th.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clickHandler();
                }
            };
            
            headerRow.appendChild(th);
        });

        // Body
        const tbody = table.createTBody();
        placeSummary.forEach(row => {
            const tr = tbody.insertRow();
            tr.setAttribute('role', 'row');
            
            const cellData = [row.lugar, row.total, row.periodo];
            cellData.forEach((value, idx) => {
                const td = tr.insertCell();
                td.setAttribute('role', 'cell');
                td.textContent = value;
            });
        });

        tableContainer.appendChild(table);
    };

    onMount(async () => {
        if (browser) {
            try {
                rawData = await placePeopleDistribution();
                
                if (rawData.length > 0) {
                    const years = rawData.map(d => d.year);
                    minYear = Math.min(...years);
                    maxYear = Math.max(...years);
                    yearRangeMin = minYear;
                    yearRangeMax = maxYear;

                    places = ['all', ...new Set(rawData.map(d => d.lugar).filter(Boolean))];
                    updateFilteredPlaces();
                    updateFilteredData();
                }
            } catch (error) {
                console.error('Error loading place-people data:', error);
            }

            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            if (browser) {
                document.removeEventListener('click', handleClickOutside);
            }
        };
    });
</script>

<div class="place-visualization-container">
    <div class="controls">
        <div class="control-group">
            <label for="place-search">Buscar Lugar:</label>
            <div class="place-filter-container">
                <input
                    id="place-search"
                    type="text"
                    class="place-filter-input"
                    placeholder="Escribe para buscar..."
                    value={searchTerm}
                    aria-label="Buscar lugar por nombre"
                    aria-describedby="place-search-hint"
                    on:input={handleSearch}
                    on:focus={() => (showDropdown = true)}
                />
                <div id="place-search-hint" style="display: none;">Ingresa el nombre de un lugar para filtrar la visualización</div>
                {#if showDropdown && filteredPlaces.length > 0}
                    <div class="place-filter-list" role="listbox">
                        {#each filteredPlaces as place}
                            <button
                                type="button"
                                class="place-filter-item"
                                class:selected={place === selectedPlace}
                                role="option"
                                aria-selected={place === selectedPlace}
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

        <div class="control-group">
            <label for="year-min">Año Mínimo:</label>
            <input
                id="year-min"
                name="yearMin"
                type="number"
                min={minYear}
                max={maxYear}
                value={yearRangeMin}
                aria-label="Año mínimo del rango de filtrado"
                aria-describedby="year-range-hint"
                on:change={handleYearRangeChange}
            />
        </div>

        <div class="control-group">
            <label for="year-max">Año Máximo:</label>
            <input
                id="year-max"
                name="yearMax"
                type="number"
                min={minYear}
                max={maxYear}
                value={yearRangeMax}
                aria-label="Año máximo del rango de filtrado"
                aria-describedby="year-range-hint"
                on:change={handleYearRangeChange}
            />
            <div id="year-range-hint" style="display: none;">Selecciona un rango de años válido</div>
        </div>
    </div>

    <div class="viz-wrapper">
        <div class="plot-container" bind:this={plotContainer} style="height: 500px; width: 100%;" role="img" aria-label="Gráfico de burbujas mostrando personas asociadas a lugares por año"></div>
    </div>

    <div class="summary-section">
        <h3>Resumen por Lugar</h3>
        <div class="table-container" bind:this={tableContainer}></div>
    </div>
</div>

<style>
    .place-visualization-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
    }

    .controls {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        align-items: center;
        background: #f8f5f2;
        padding: 1rem;
        border-radius: 4px;
    }

    .control-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .control-group label {
        font-weight: 600;
        color: #1d1916;
        font-size: 0.9rem;
    }

    .control-group input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #d4cec6;
        border-radius: 4px;
        font-size: 0.9rem;
        background: #fff;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .control-group input:focus {
        outline: none;
        border-color: #3780bf;
        box-shadow: 0 0 0 2px rgba(55, 128, 191, 0.1);
    }

    .place-filter-container {
        position: relative;
        width: 250px;
    }

    .place-filter-input {
        width: 100% !important;
        padding: 0.5rem 0.75rem;
    }

    .place-filter-input:focus {
        outline: none;
        border-color: #3780bf !important;
        box-shadow: 0 0 0 2px rgba(55, 128, 191, 0.1);
    }

    .place-filter-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #d4cec6;
        border-top: none;
        border-radius: 0 0 4px 4px;
        max-height: 250px;
        overflow-y: auto;
        z-index: 100;
    }

    .place-filter-item {
        width: 100%;
        text-align: left;
        padding: 0.75rem;
        border: none;
        background: #fff;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s;
    }

    .place-filter-item:hover {
        background: #f0ebe5;
    }

    .place-filter-item:focus {
        outline: 2px solid #3780bf;
        outline-offset: -1px;
        background: #f0ebe5;
    }

    .place-filter-item.selected {
        background: #3780bf;
        color: #f8f5f2;
        font-weight: 600;
    }

    .place-filter-item.selected:focus {
        outline: 2px solid #f8f5f2;
        outline-offset: -1px;
    }

    .viz-wrapper {
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .plot-container {
        padding: 1rem;
    }

    .summary-section {
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
    }

    .summary-section h3 {
        margin: 0 0 1rem 0;
        color: #1d1916;
        font-size: 1.1rem;
    }

    .table-container {
        width: 100%;
        overflow-x: auto;
    }

    :global(.summary-table) {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
    }

    :global(.summary-table th) {
        background: #3780bf;
        color: #f8f5f2;
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
        border: 1px solid #2a5a8f;
        cursor: pointer;
        transition: background 0.2s, box-shadow 0.2s;
    }

    :global(.summary-table th:hover) {
        background: #2a5a8f;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    :global(.summary-table th:focus) {
        outline: 2px solid #f8f5f2;
        outline-offset: -2px;
    }

    :global(.summary-table td) {
        padding: 0.75rem;
        border: 1px solid #d4cec6;
        background: #fff;
    }

    :global(.summary-table tbody tr:nth-child(odd)) {
        background: #f8f5f2;
    }

    :global(.summary-table tbody tr:hover) {
        background: #ede7df;
        transition: background 0.1s ease;
    }

    :global(.summary-table tbody tr:focus-within) {
        outline: 2px solid #3780bf;
        outline-offset: -1px;
    }
</style>
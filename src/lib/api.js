import queryString from 'query-string';

import { getCookie } from './csrf';

import config from '../config';

const fetchWithBaseUrl = async (endpoint, options = {}) => {
    const url = `${config.apiBaseUrl}${endpoint}`;
    const response = await fetch(url, {...options, credentials: "include"});
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export { fetchWithBaseUrl };

export const postWithBaseUrl = async (endpoint, payload = {}) => {
	const url = `${config.apiBaseUrl}${endpoint}`;
	const csrfToken = getCookie("csrftoken");

	// For logging endpoint, fail silently if no CSRF token is available
	if (endpoint === 'log/' && !csrfToken) {
		throw new Error('CSRF token not available for logging');
	}

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": csrfToken || "",
		},
		credentials: "include",
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
	}

	return await response.json();
};

const _writeRequest = async (method, endpoint, payload = {}) => {
	const url = `${config.apiBaseUrl}${endpoint}`;
	const csrfToken = getCookie("csrftoken");
	const response = await fetch(url, {
		method,
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": csrfToken || "",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw Object.assign(new Error(`HTTP error! status: ${response.status}`), { data: errorData });
	}
	// 204 No Content has no body
	if (response.status === 204) return null;
	return await response.json();
};

export const putWithBaseUrl   = (endpoint, payload) => _writeRequest('PUT',   endpoint, payload);
export const patchWithBaseUrl = (endpoint, payload) => _writeRequest('PATCH', endpoint, payload);
export const deleteWithBaseUrl = async (endpoint) => {
	const url = `${config.apiBaseUrl}${endpoint}`;
	const csrfToken = getCookie("csrftoken");
	const response = await fetch(url, {
		method: "DELETE",
		headers: { "X-CSRFToken": csrfToken || "" },
		credentials: "include",
	});
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw Object.assign(new Error(`HTTP error! status: ${response.status}`), { data: errorData });
	}
	return null;
};

// Log endpoint
export const log = (level, message) => postWithBaseUrl('log/', { level, message });

// Initialize API for logging
export const initializeLogging = async () => {
	try {
		await setCsrfCookie();
		return true;
	} catch (error) {
		console.warn('Failed to initialize logging API:', error);
		return false;
	}
};

// set the CSRF cookie
export const setCsrfCookie = async () => {
	const url = `${config.apiBaseUrl}csrf/`;
	const response = await fetch(url, {
		method: "GET",
		credentials: "include"
	});

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
	return await response.json();
};

// User admin endpoints
export const login = async (username, password, csrfToken = null) => {
    const token = csrfToken || getCookie("csrftoken") || "";
    if (!token) {
        throw new Error("CSRF token is required for login.");
    }
    
    return await fetch(`${config.apiBaseUrl}login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
        },
        credentials: "include",
        body: JSON.stringify({ username, password })
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
};

export const logout = async (csrfToken = null) => {
    const token = csrfToken || getCookie("csrftoken") || "";
    if (!token) {
        throw new Error("CSRF token is required for logout.");
    }

    return await fetch(`${config.apiBaseUrl}logout/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
        },
        credentials: "include",
        body: JSON.stringify({})
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
};

/*
* This function fetches the list of users from the API.
* @returns {Promise<Array>} A promise that resolves to the list of users.
*/
export const whoami = async () => {
    try {
        const response = await fetchWithBaseUrl("whoami/");
        return response;
    } catch (error) {
        if (error.message.includes("403")) {
            console.log("User not authenticated. If there's a session, it might be expired.");
            return null; 
        }
        throw error; 
    }
};



// Search endpoints
export const searchAll = (params) => {
    // Filter out empty or null parameters
    const filteredParams = {};
    for (const key in params) {
        if (params[key] !== null && params[key] !== '' && params[key] !== undefined) {
            filteredParams[key] = params[key];
        }
    }

    const querystring = queryString.stringify(filteredParams);
    console.log('Final Query String:', querystring);
    return fetchWithBaseUrl(`search/?${querystring}`);
};

// Browse endpoints

const ENTITY_ENDPOINT_MAP = {
    personaesclavizada: 'personas-esclavizadas',
    personanoesclavizada: 'personas-no-esclavizadas',
    documento: 'documentos',
    lugar: 'lugares',
    corporacion: 'corporaciones',
};

export const browseEntities = (entityType, params) => {
    const endpoint = ENTITY_ENDPOINT_MAP[entityType];
    if (!endpoint) throw new Error(`Unknown entity type: ${entityType}`);

    const filteredParams = {};
    for (const key in params) {
        if (params[key] !== null && params[key] !== '' && params[key] !== undefined) {
            filteredParams[key] = params[key];
        }
    }
    const qs = queryString.stringify(filteredParams);
    return fetchWithBaseUrl(`${endpoint}/?${qs}`);
};

export const fetchCounts = () => fetchWithBaseUrl('counts/');

export const exportCsv = (entityType, { query, exactSearch, filters, ordering } = {}) => {
    const params = { type: entityType, export_format: 'csv' };
    if (query) {
        params.q = exactSearch
            ? `"${query.replace(/^"|"$/g, '')}"`
            : query.replace(/^"|"$/g, '');
    }
    if (ordering) params.ordering = ordering;
    if (filters) {
        for (const [key, value] of Object.entries(filters)) {
            if (value !== null && value !== '' && value !== undefined) {
                params[key] = value;
            }
        }
    }
    const qs = queryString.stringify(params);
    return `${config.apiBaseUrl}search/?${qs}`;
};

export const personasescfull = (params) => {
    // Filter out empty or null parameters
    const filteredParams = {};
    for (const key in params) {
        if (params[key] !== null && params[key] !== '' && params[key] !== undefined) {
            filteredParams[key] = params[key];
        }
    }

    const querystring = queryString.stringify(filteredParams);
    console.log('personasescfull query string:', querystring);
    return fetchWithBaseUrl(`personas-esclavizadas/?${querystring}`);
};

// Archivo list (with documento_count)
export const archivos = () => fetchWithBaseUrl('archivos/');

// Detail endpoints
export const documentos = (params) => fetchWithBaseUrl(`documentos/${params}/`);
export const peresclavizadas = (params) => fetchWithBaseUrl(`personas-esclavizadas/${params}/`);
export const pernoesclavizadas =  (params) => fetchWithBaseUrl(`personas-no-esclavizadas/${params}/`);
export const corporaciones = (params) => fetchWithBaseUrl(`corporaciones/${params}/`);
export const lugares = (params) => fetchWithBaseUrl(`lugares/${params}/`);
export const lugarPersonasRelacionadas = (lugarId, page = 1) => 
    fetchWithBaseUrl(`lugares/${lugarId}/personas/?page=${page}`);
export const lugarProcedencia = (lugarId, page = 1) =>
    fetchWithBaseUrl(`lugares/${lugarId}/procedencia/?page=${page}`);
export const documentoPersonas = (documentoId, page = 1) =>
    fetchWithBaseUrl(`documentos/${documentoId}/personas/?page=${page}`);
export const personaLugarRel = (personaxlugarId) => fetchWithBaseUrl(`relaciones-lugares/${personaxlugarId}/`);
export const personaPersonasRel = (personaxpersonaId) => fetchWithBaseUrl(`relaciones-personas/${personaxpersonaId}/`);

// Visualization endpoints for detail views
export const personaNetwork = (personaId) => fetchWithBaseUrl(`personas-esclavizadas/${personaId}/network/`);
export const personaTrajectory = (personaId) => fetchWithBaseUrl(`personas-esclavizadas/${personaId}/trajectory/`);

// Aggregated trajectory endpoints
export const aggregatedTrajectories = (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchWithBaseUrl(`travel-trajectories/aggregated/${qs ? '?' + qs : ''}`);
};
export const routeDetail = (fromId, toId, page = 1, params = {}) => {
    const extra = new URLSearchParams(params).toString();
    const base = `travel-trajectories/route_detail/?from_lugar_id=${fromId}&to_lugar_id=${toId}&page=${page}`;
    return fetchWithBaseUrl(extra ? `${base}&${extra}` : base);
};

// Data Visualization endpoints
export const generoHispanizacion = async () => {
    try {
        const data = await fetchWithBaseUrl(`gender-status-distribution/`);
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format received from server');
        }
        return data;
    } catch (error) {
        console.error('Error fetching género hispanización data:', error);
        throw error;
    }
};


export const placePeopleDistribution = async () => {
    try {
        const data = await fetchWithBaseUrl(`places-people-distribution/`);
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format received from server');
        }
        return data;
    } catch (error) {
        console.error('Error fetching place people distribution data:', error);
        throw error;
    }
};
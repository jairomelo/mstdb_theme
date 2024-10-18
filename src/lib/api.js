import config from '../config';

const fetchWithBaseUrl = async (endpoint, options = {}) => {
    const url = `${config.apiBaseUrl}${endpoint}`;
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

const postWithBaseUrl = async (endpoint, options = {}) => {
    const url = `${config.apiBaseUrl}${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
    });
    return await response.json();
};

// Log endpoint
export const log = (level, message) => postWithBaseUrl('log/', { level, message });

// Search endpoints
export const searchAll = (params) => fetchWithBaseUrl(`search/?${params}`);

// Detail endpoints
export const documentos = (params) => fetchWithBaseUrl(`documentos/${params}/`);
export const peresclavizadas = (params) => fetchWithBaseUrl(`peresclavizadas/${params}/`);
export const pernoesclavizadas =  (params) => fetchWithBaseUrl(`pernoesclavizadas/${params}/`);
export const corporaciones = (params) => fetchWithBaseUrl(`corporaciones/${params}/`);
export const lugares = (params) => fetchWithBaseUrl(`lugares/${params}/`);
export const lugarPersonasRelacionadas = (lugarId, page = 1) => 
    fetchWithBaseUrl(`lugares/${lugarId}/personas_relacionadas/?page=${page}/`);

import queryString from 'query-string';

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

// Detail endpoints
export const documentos = (params) => fetchWithBaseUrl(`documentos/${params}/`);
export const peresclavizadas = (params) => fetchWithBaseUrl(`peresclavizadas/${params}/`);
export const pernoesclavizadas =  (params) => fetchWithBaseUrl(`pernoesclavizadas/${params}/`);
export const corporaciones = (params) => fetchWithBaseUrl(`corporaciones/${params}/`);
export const lugares = (params) => fetchWithBaseUrl(`lugares/${params}/`);
export const lugarPersonasRelacionadas = (lugarId, page = 1) => 
    fetchWithBaseUrl(`lugares/${lugarId}/personas_relacionadas/?page=${page}/`);
export const personaLugarRel = (personaxlugarId) => fetchWithBaseUrl(`personas_lugares/${personaxlugarId}/`);
export const personaPersonasRel = (personaxpersonaId) => fetchWithBaseUrl(`personas_relaciones/${personaxpersonaId}/`);

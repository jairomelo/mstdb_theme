import config from '../config';

const fetchWithBaseUrl = async (endpoint, options = {}) => {
    const url = `${config.apiBaseUrl}${endpoint}`;
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

// Search endpoints
export const searchAll = (params) => fetchWithBaseUrl(`search/?${params}`);

// Detail endpoints
export const documentos = (params) => fetchWithBaseUrl(`documentos/${params}/`);
export const peresclavizadas = (params) => fetchWithBaseUrl(`peresclavizadas/${params}/`);
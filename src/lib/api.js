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

export const postWithBaseUrl = async (endpoint, payload = {}) => {
	const url = `${config.apiBaseUrl}${endpoint}`;
	const csrfToken = getCookie("csrftoken");

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

// Log endpoint
export const log = (level, message) => postWithBaseUrl('log/', { level, message });

// User admin endpoints
export const login = async (username, password) => {
    return await postWithBaseUrl(
        "login/",
        {
            username,
            password
        }
    );
};

export const logout = async () => {
	return await postWithBaseUrl("logout/", {});
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
    return fetchWithBaseUrl(`peresclavizadas/?${querystring}`);
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
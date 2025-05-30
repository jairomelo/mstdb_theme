const config = {
    // Use the environment variable if available, otherwise fall back to a default API URL
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://db.trayectoriasafro.org/api/v1/'
};

export default config;
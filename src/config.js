const config = {
    // Use relative path for API in production (Docker container)
    // In development, Vite proxy will forward /api/v2/ to localhost:8000
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v2/'
};

export default config;
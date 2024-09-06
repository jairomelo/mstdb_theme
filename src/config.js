const config = {
    development: {
        apiBaseUrl: 'http://localhost:81/mdb/api/'
    },
    production: {
        apiBaseUrl: 'https://msdb.abcng.org/api/'
    }
};

const environment = import.meta.env.MODE || 'development';

export default config[environment];

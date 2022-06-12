import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import VueAxios from 'vue-axios';
import { createPinia } from 'pinia';

// create vue app
let app = createApp(App);
const pinia = createPinia();
app.use(pinia)

import { useOfflineStore } from './stores/offlineStore'

// axios login interceptor
axios.interceptors.request.use(function (config: AxiosRequestConfig) {
    const offline_store = useOfflineStore(); 
    config.timeout = 1000;
    config.validateStatus = function () {
        return true;
    }
    let scanner_uuid: string | null = offline_store.scanner_uuid;
    if (scanner_uuid !== null && scanner_uuid != "null") {
        if (config.headers) {
            config.headers['Authorization'] = scanner_uuid;
        } else {
            config.headers = {'Authorization': scanner_uuid }
        }
    }
    return config;
}, function (error) {
    if (!error) error = new Error("axios interceptor failed")
    return Promise.reject(error);
});

// add axios to the vue app instance
app.use(VueAxios, { $http: axios })
app.provide('$http',  app.config.globalProperties.$http)

// add vue-router
app.use(router)

// import boostrap for look
import 'bootstrap/dist/css/bootstrap.min.css';

app.mount('#app');
// @ts-nocheck
import Vue from 'vue';
import App from './App.vue';
import router from './router';

// http connection

import axios from 'axios';
Vue.prototype.$http = axios;

// vue config
Vue.config.productionTip = false;

// adding qrscanner lib
import jsQR from "jsqr";
Vue.prototype.$jsqr = jsQR;

// import boostrap for look
import 'bootstrap/dist/css/bootstrap.min.css';

// create vue app
let vm = new Vue({
    data: {
        station_name: null,
        station_id: null
    },
    router,
    render: h => h(App),
    localStorage: {
        station_name: {
            type: String,
            default: null
        },
        station_id: {
            type: String,
            default: null
        },
        scanner_uuid: {
            type: String,
            default: null
        },
        offline_codes: {
            type: String,
            default: ''
        }
    }
}).$mount('#app');

// axios login interceptor
vm.$http.interceptors.request.use(function (config: any) {
    config.timeout = 1000;
    config.validateStatus = function (status: number) {
        return true;
    }
    let scanner_uuid: String | null = vm.$localStorage.get('scanner_uuid', null);
    if (scanner_uuid !== null && scanner_uuid != "null") {
        config.headers['Authorization'] = scanner_uuid;
    }
    return config;
}, function (error: any) {
    return Promise.reject(error);
});






// @ts-nocheck
import Vue from 'vue';
import App from './App.vue';
import router from './router';

// Mint UI
import { Tabbar, TabItem } from 'mint-ui';
Vue.component(Tabbar.name, Tabbar);
Vue.component(TabItem.name, TabItem);

// http connection

import axios from 'axios';
import cookie from 'cookie';
Vue.prototype.$http = axios;

// vue config
Vue.config.productionTip = false;

// adding qrscanner lib
import jsQR from "jsqr";
Vue.prototype.$jsqr = jsQR;

// import boostrap for look
import 'bootstrap/dist/css/bootstrap.min.css';

// local stoarge for offline usage
import VueLocalStorage from 'vue-localstorage';
Vue.use(VueLocalStorage);

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
        }
    }
}).$mount('#app');

// axios login interceptor
vm.$http.interceptors.request.use(function (config: any) {
    config.timeout = 1000;
    config.validateStatus = function (status: number) {
        return true;
    };
    let sid: { [key: string] : string } = cookie.parse(document.cookie);
    if (sid['connect.id']) {
        config.headers.cookie += cookie.serialize('connect.id', sid['connect.id'], {
            secure: true,
        }) + ";";
    }
    return config;
}, function (error: any) {
    return Promise.reject(error);
});






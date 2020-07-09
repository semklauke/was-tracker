import Vue from 'vue';
import App from './App.vue';
import router from './router';

// Mint UI

//@ts-ignore
import { Tabbar, TabItem } from 'mint-ui';

Vue.component(Tabbar.name, Tabbar);
Vue.component(TabItem.name, TabItem);

// http connection

import axios from 'axios';
import cookie from 'cookie';

Vue.config.productionTip = false;

Vue.prototype.$http = axios;

// create vue app
let vm = new Vue({
    router,
    render: h => h(App),
}).$mount('#app');

//@ts-ignore
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






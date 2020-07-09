import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

// import views from single file components
import Scan from '../views/Scan.vue';
import Info from '../views/Info.vue';
import HistoryComponent from '../views/History.vue';
import Lostqr from '../views/Lostqr.vue';
import Help from '../views/Help.vue';

import Login from '../views/Login.vue'

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'login',
        component: Login
    },
    { path: '/scan', name: 'tab-scan', component: Scan },
    { path: '/info', name: 'tab-info', component: Info },
    { path: '/history', name: 'tab-history', component: HistoryComponent },
    { path: '/lostqr', name: 'tab-lostqr', component: Lostqr },
    { path: '/help', name: 'tab-help', component: Help }
]

const router = new VueRouter({
  routes
});

export default router;

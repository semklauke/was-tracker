import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

// import views from single file components
import Scan from '@/views/Scan.vue';
import Info from '@/views/Info.vue';
import HistoryComponent from '@/views/History.vue';
import Lostqr from '@/views/Lostqr.vue';
import Help from '@/views/Help.vue';
import Login from '@/views/Login.vue';
import Mobile from '@/views/Mobile.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/app/login',
        meta: { nl: true }
    },
    {
        path: '/app/',
        component: Mobile,
        children: [
            {
                path: 'login',
                name: 'mobile-login',
                component: Login,
                meta: { nl: true }
            },
            {
                path: 'scan',
                name: 'tab-scan',
                component: Scan,
                meta: { l: true }
            },
            {
                path: 'info',
                name: 'tab-info',
                component: Info,
                meta: { nl: true }
            },
            {
                path: 'history',
                name: 'tab-history',
                component: HistoryComponent,
                meta: { nl: true }
            },
            {
                path: 'lostqr',
                name: 'tab-lostqr',
                component: Lostqr,
                meta: { l: true }
            },
            {
                path: 'help',
                name: 'tab-help',
                component: Help,
                meta: { nl: true }
            }
        ]
    },
]

const router = createRouter({
    routes,
    history: createWebHistory(), //import.meta.env.BASE_URL
});

router.beforeEach((to, from, next) => {
    if(to.name !== "mobile-login" &&
       to.matched.some(record => record.meta.l)) {
        if (localStorage.getItem('station_id') === null ||
            localStorage.getItem('station_id') === '') {
            next({ name: 'mobile-login' });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;

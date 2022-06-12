<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { useOfflineStore } from '@/stores/offlineStore'
import type { OfflineStore } from '@/stores/offlineStore'
import { onMounted } from 'vue';

const router = useRouter()
const route = useRoute()

/* --- data --- */
const offline_store = useOfflineStore();
const { station_name } = storeToRefs(offline_store)

/* --- component hooks --- */
onMounted(() => {
    // if there is already saved state in localStorage - load it
    const localStorage_string = localStorage.getItem('offlineStore')
    if (localStorage_string !== null) {
        let localStorage_json = JSON.parse(localStorage_string) as OfflineStore
        offline_store.$patch(state => {
            for (const key in localStorage_json) {
                //@ts-ignore
                state[key] = localStorage_json[key]
            }
        })

    } 
})

// sync offlineStore with localStorage
offline_store.$subscribe((_, state: OfflineStore) => {
    localStorage.setItem('offlineStore', JSON.stringify(state))
}, { detached: true })

/* --- frontend methods --- */
function clearStation() {
    if (window.confirm("Ausloggen?")) {
        offline_store.$reset()
    }
}

function goToLogin() {
    if (route.path != "/") {
        router.push({ name: 'login' });
    }
}
</script>

<template>
<div id="app">
    <nav class="navbar navbar-light bg-light border-bottom" id="navbar">
        <span class="navbar-brand mb-0 h1" id="wastrackerbrand">WaS-Tracker</span>
        <form class="form-inline" v-show="station_name == 'null' || station_name == null">
            <button class="btn btn-primary btn-sm" type="submit" @click="goToLogin">Login</button>
        </form>
    </nav>

    <div class="fixed-bottom bg-primary text-white" v-show="station_name != 'null' && station_name != null" id="station_info">
        <div id="station_info_name">{{ station_name }}</div>
        <div id="station_info_dismiss_span" @click="clearStation">
            &#215;
        </div> 
        <span class="clearfix"></span>
    </div>

    <router-view v-slot="{ Component }">
        <transition
            enter-active-class="animated fadeIn faster"
            leave-active-class="animated fadeOut faster"
            mode="out-in"
        >
            <component :is="Component" />
        </transition>
    </router-view>


    <!--/*UPGRADE*/mt-tabbar v-model="activetab">
        <mt-tab-item id="tab-scan">
            <img slot="icon" class="tabbaricon" src="/assets/scan.svg" />
            SuS
        </mt-tab-item>
        <mt-tab-item id="tab-info">
            <img slot="icon" class="tabbaricon" src="/assets/info.svg" />
            Info
        </mt-tab-item>
        <mt-tab-item id="tab-history">
            <img slot="icon" class="tabbaricon" src="/assets/history.svg" />
            History
        </mt-tab-item>
        <mt-tab-item id="tab-lostqr">
            <img slot="icon" class="tabbaricon" src="/assets/lostqr.svg" />
            Kein QR
        </mt-tab-item>
        <mt-tab-item id="tab-help">
            <img slot="icon" class="tabbaricon" src="/assets/help.svg" />
            Help
        </mt-tab-item>
    </mt-tabbar-->
</div>
</template>


<style>

body {
    height: 100%;
}
#app {
    height: 100%;
}
.tabbaricon {
    width: 100%;
    height: 100%;
}
#station_info {
    width: 100%;
    padding: 0px;
    margin: 0px;
    min-height: 40px;
    max-height: 45px;
    font-size: 1.3em;
    position: absolute;
    left: 0px;
    top: 56px;
    box-shadow: 0 .125rem .25rem rgba(0,0,0,.425)!important;
    border-radius: 0px 0px 10px 10px;
}
#wastrackerbrand {
    /*width: 100%;
    text-align: center;*/
    font-size: 1.4em;
}
#station_info_name {
    width: 60%;
    display: inline-block;
    height: 100%;
    line-height: 45px;
    padding-left: 15px;
}
#station_info_dismiss_span {
    width: 30%;
    float: right;
    font-weight: lighter;
    color: #BFBFBF;
    text-align: right;
    padding-right: 15px;
    /*display: inline-block;*/
    height: 100%;
    line-height: 38px;
    font-size: 2em;
}
.filler {
    width: 100%;
}
#navbar {
    margin-bottom: 70px;
}
</style>



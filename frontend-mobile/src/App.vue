<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { useOfflineStore } from '@/stores/offlineStore'
import type { OfflineStore } from '@/stores/offlineStore'
import { onMounted } from 'vue';

// import components
import { IonApp, IonRouterOutlet } from '@ionic/vue';

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
<ion-app>
    <ion-router-outlet />
</ion-app>
</template>
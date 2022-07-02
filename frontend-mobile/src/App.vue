<script lang="ts" setup>
import { useOfflineStore } from '@/stores/offlineStore'
import type { OfflineStore } from '@/stores/offlineStore'
import { onMounted } from 'vue';

// import components
import { IonApp, IonRouterOutlet } from '@ionic/vue';

/* --- data --- */
const offline_store = useOfflineStore();

/* --- component hooks --- */
onMounted(() => {
    // if there is already saved state in localStorage - load it
    const localStorage_string = localStorage.getItem('offlineStore')
    if (localStorage_string !== null) {
        let localStorage_json = JSON.parse(localStorage_string) as OfflineStore
        offline_store.$patch((state: OfflineStore) => {
            for (const key in localStorage_json) {
                //@ts-ignore
                state[key] = localStorage_json[key]
            }
        })
    } else {
        localStorage.setItem('offlineStore', JSON.stringify(offline_store.$state))
    }

    // init dark mode
    // from: https://ionicframework.com/docs/theming/dark-mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    toggleDarkTheme(prefersDark.matches);
    prefersDark.onchange = (event) => toggleDarkTheme(event.matches);

    // sync offlineStore with localStorage
    offline_store.$subscribe((_, state: OfflineStore) => {
        console.log("SYNC")
        localStorage.setItem('offlineStore', JSON.stringify(state))
    }, { detached: true })


})




/* --- methodes --- */
function toggleDarkTheme(shouldAdd: boolean) {
  document.body.classList.toggle('dark', shouldAdd);
}
</script>

<template>
<ion-app>
    <ion-router-outlet />
</ion-app>
</template>
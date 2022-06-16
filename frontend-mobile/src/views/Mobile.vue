<script lang="ts" setup>
import { notNull } from '@/includes/helper'
import { onMounted } from 'vue';
import { useOfflineStore } from '@/stores/offlineStore'
import type { OfflineStore } from '@/stores/offlineStore'
import { useRouter } from 'vue-router'
// import components
import { 
    IonPage, 
    IonRouterOutlet, 
    IonContent, 
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,  
    IonButtons
} from '@ionic/vue';
// import icons
import { 
    qrCodeOutline, 
    informationCircleOutline, 
    listOutline,
    closeOutline,
    //helpCircleOutline
} from 'ionicons/icons';
import { noneQrCodeOutline } from '@/includes/custom_svg'

/* --- data --- */
/* --- composables and injects --- */
let offline_store = useOfflineStore();
let router = useRouter();

/* --- lifecylce hooks --- */
// DEBUG
onMounted(() => {
    offline_store.$patch((state: OfflineStore) => {
        state.station_name = "Station 1";
        state.station_uuid = "1";
    })
})

/* --- frontend methods --- */
function displayStation() {
    return notNull(offline_store.station_name) && offline_store.station_name != ''
}

function logout() {
    if (window.confirm("Ausloggen ?")) {
        offline_store.$reset()
        router.push('/') 
    }
    
}
</script>

<template>
<ion-page>
    <ion-header v-show="displayStation()" id="TS_DEFAULT_HEADER">
        <ion-toolbar>
            <ion-title>{{ offline_store.station_name }}</ion-title>
            <ion-buttons slot="end" color="light">
                <ion-button @click="logout">
                    <ion-icon slot="icon-only" :icon="closeOutline" />
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" slot="fixed" scroll="false" forceOverscroll="false">
        <ion-tabs>
            <ion-router-outlet ></ion-router-outlet>
            <ion-tab-bar slot="bottom">
              <ion-tab-button tab="scan" href="/app/scan">
                <ion-icon :icon="qrCodeOutline" />
                <ion-label>Scan QR</ion-label>
              </ion-tab-button>

              <ion-tab-button tab="info" href="/app/info">
                <ion-icon :icon="informationCircleOutline" />
                <ion-label>Infos</ion-label>
              </ion-tab-button>

              <ion-tab-button tab="history" href="/app/history">
                <ion-icon :icon="listOutline" />
                <ion-label>Historie</ion-label>
              </ion-tab-button>

              <ion-tab-button tab="lostqr" href="/app/lostqr">
                <ion-icon :icon="noneQrCodeOutline" />
                <ion-label>Kein QR</ion-label>
              </ion-tab-button>

              <!--ion-tab-button tab="help" href="/app/help">
                <ion-icon :icon="helpCircleOutline" />
                <ion-label>Hilfe</ion-label>
              </ion-tab-button-->
            </ion-tab-bar>
        </ion-tabs>
    </ion-content>
</ion-page>
</template>

<style scoped>
</style>
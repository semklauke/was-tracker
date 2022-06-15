<script lang="ts" setup>
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
} from '@ionic/vue';
// import icons
import { 
    qrCodeOutline, 
    informationCircleOutline, 
    listOutline,
    //helpCircleOutline
} from 'ionicons/icons';
import { noneQrCodeOutline } from '@/includes/custom_svg'


/* --- data --- */
/* --- component hooks --- */
/* --- frontend methods --- */
</script>

<template>
<ion-page>
    <ion-content>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
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
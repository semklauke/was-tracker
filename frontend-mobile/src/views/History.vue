<script lang="ts" setup>
import { ref, inject } from 'vue';
import { onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue';
import type { AxiosInstance } from 'axios';
import { useOfflineStore } from '@/stores/offlineStore';
import type { OfflineCode, Code } from '@/stores/offlineStore';
// import components
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonGrid,
    IonCol,
    IonRow,
    IonIcon,
    IonButton,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOption,
    IonItemOptions,
    IonLabel,
    actionSheetController
} from '@ionic/vue';
// import icons
import { 
    cloudUploadOutline,
    closeCircleOutline
} from 'ionicons/icons';

/* --- composable and inject --- */
const $http: AxiosInstance = inject('$http') as AxiosInstance
const offline_store = useOfflineStore();

/* --- data --- */


/* --- lifecycle hooks --- */
onIonViewWillEnter(() => {
    // offline_store.$patch(state => {
    //     state.offline_codes.push({ uuid: "uuid1", timestamp: "01.01.2001", station_uuid: "suuid1" });
    //     state.offline_codes.push({ uuid: "uuid2", timestamp: "02.02.2002", station_uuid: "suuid2" });
    //     state.offline_codes.push({ uuid: "uuid3", timestamp: "03.03.2003", station_uuid: "suuid3" });
    //     state.codes.push({ uuid: "uuid4", timestamp: "04.04.2004", station_uuid: "suuid4", firstname: "first4",lastname: "lastname4", class: "class4" });
    //     state.codes.push({ uuid: "uuid5", timestamp: "05.05.2005", station_uuid: "suuid5", firstname: "first5",lastname: "lastname5", class: "class5" });
    // })
})

onIonViewWillLeave(() => {

})

/* --- methods --- */
function isCode(c: Code | OfflineCode) : c is Code {
    return Object.keys(c).includes("firstname") && Object.keys(c).includes("lastname")
} 

async function clearHistoryButton() {
    const actionSheet = await actionSheetController.create({
        header: 'Löschen',
        cssClass: 'clear_action_sheet',
        buttons: [
            {
                text: 'Offline Scans löschen',
                role: 'offline',
                handler: () => {
                    offline_store.$patch(state => {
                        state.offline_codes = [];
                    });
                }
            },
            {
                text: 'Gesicherte Scans löschen',
                role: 'online',
                handler: () => {
                    offline_store.$patch(state => {
                        state.codes = [];
                    });
                }
            },
            {
                text: 'Alle löschen',
                role: 'destructive',
                handler: () => {
                    offline_store.$patch(state => {
                        state.offline_codes = [];
                        state.codes = [];
                    });
                }
            },
            {
                text: 'Cancel',
                role: 'cancel',
            },
        ],
    });
    await actionSheet.present();
    const { role } = await actionSheet.onDidDismiss();
    if (role != "cancle") {
        // we did performe a clear, update user interface here
        // TODO
    }
}
</script>
<template>
    <ion-page>
        <ion-header translucent>
            <ion-toolbar>
              <ion-title>History</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content fullscreen scroll-x="false">
            <ion-grid>
                <ion-row id="button_row">
                    <ion-col>
                        <ion-button color="light">
                            <ion-icon slot="start" :icon="cloudUploadOutline"></ion-icon>
                            Upload 
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button color="light" @click="clearHistoryButton">
                            <ion-icon slot="start" :icon="closeCircleOutline"></ion-icon>
                            Löschen  
                        </ion-button>
                    </ion-col>
                </ion-row>
                <ion-row id="history_row">
                    <ion-list>
                        <ion-item-sliding v-for="code in offline_store.allCodes">
                            <ion-item>
                                <ion-label>ksdjfksdjfkdjsfkdjs</ion-label>
                            </ion-item>
                        </ion-item-sliding>
                    </ion-list>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>    
</template>
<style scoped>
</style>
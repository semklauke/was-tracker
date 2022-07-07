<script lang="ts" setup>
import { ref, inject } from 'vue';
import { onIonViewWillEnter, onIonViewWillLeave, onIonViewDidEnter } from '@ionic/vue';
import type { AxiosInstance } from 'axios';
import { useOfflineStore } from '@/stores/offlineStore';
import type { OfflineCode, Code } from '@/stores/offlineStore';
import { notNull, isCode, was_alert } from '@/includes/helper'
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
    actionSheetController,
    IonListHeader,
    IonPopover,
    toastController
} from '@ionic/vue';
// import icons
import { 
    cloudUploadOutline,
    closeCircleOutline,
    checkmarkOutline,
    checkmarkDoneOutline,
    helpCircleOutline,
    trashOutline
} from 'ionicons/icons';

/* --- composable and inject --- */
const $http: AxiosInstance = inject('$http') as AxiosInstance
const offline_store = useOfflineStore();

/* --- data --- */
let header = ref()
let list = ref()
let loading = ref(false)

/* --- lifecycle hooks --- */
onIonViewWillEnter(() => {
    // display header if there is no station header to display
    if (notNull(offline_store.station_name) && offline_store.station_name != '') {
        header?.value?.$el.setAttribute("translucent", "")
        header?.value?.$el.removeAttribute("collapse")
    } else {
        header?.value?.$el.removeAttribute("translucent")
        header?.value?.$el.setAttribute("collapse", "fade")
    }
    console.log("History will enter")
})

onIonViewDidEnter(() => {
    offline_store.$patch(state => {
        state.offline_codes.push({ uuid: "uuid1", timestamp: "01.01.2001", station_uuid: "suuid1" });
        state.offline_codes.push({ uuid: "uuid2", timestamp: "02.02.2002", station_uuid: "suuid2" });
        state.offline_codes.push({ uuid: "uuid3", timestamp: "03.03.2003", station_uuid: "suuid3" });
        state.codes.push({ uuid: "uuid4", timestamp: "04.04.2004", station_uuid: "suuid4", firstname: "first4",lastname: "lastname4", class: "class4" });
        state.codes.push({ uuid: "uuid5", timestamp: "05.05.2005", station_uuid: "suuid5", firstname: "first5",lastname: "lastname5", class: "class5" });
    })
});

onIonViewWillLeave(() => {

})

/* --- methods --- */
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

function delete_code(code: Code | OfflineCode) : void {
    list.value.$el.closeSlidingItems();
    offline_store.delete_code(code);
}

async function upload_code(code: OfflineCode) {
    list.value.$el.closeSlidingItems();
    loading.value = true;
    
    try {
    if (!navigator.onLine) {
        loading.value = false;
    } else {

        let res = await $http.post(`/api/checkin/station/${code.station_uuid}`, );
        loading.value = false;

        if (res.status != 200 && 
            res?.data?.errorid && 
            res?.data?.error) {
            // handle error
            console.error(res?.data?.error)
            switch (res?.data?.errorid) {
                case 287:
                    was_alert("Fehler! Station nicht bekannt. Code wurde nicht hochgeladen", "Fehler")
                    break;
                case 4058:
                    was_alert("Fehler! QR-Code/Läufer*in nicht bekannt. Code wurde nicht hochgeladen", "Fehler")
                    break;
                default:
                    was_alert("Fehler aufgetreten. Code wurde nicht hochgeladen. Bitte erneut probieren.", "Fehler")
                    break;
            }
        } else if (res?.data?.success) {
            // request success
            // if got an walker object back, add it to online 
            if (res?.data?.walker) {
                offline_store.codes.push({
                    uuid: code.uuid,
                    timestamp: code.timestamp,
                    station_uuid: code.station_uuid,
                    firstname: res?.data?.walker?.firstname || "Firstname missing",
                    lastname: res?.data?.walker?.lastname || "Lastname missing",
                    class: res?.data?.walker?.class || "Class missing"
                })
                offline_store.delete_offlineCode(code);
            } 
            const toast = await toastController.create({
                message: 'Scan wurde hochgeladen!',
                duration: 3000,
                color: "success",
                icon: checkmarkOutline
            })
            toast.present();
        } else if (res.status >= 400) {
            was_alert("Server konnte nicht erreicht werden. An Admin melden", "Fehler")
        }
    } } catch (err: any) {
        if (!navigator.onLine && err?.code === "ERR_NETWORK") {
            was_alert("Keine Internet Verbindung", "Info")
        } else {
            if (!err) err = new Error("API request error")
            console.error(err)
            was_alert("Server konnte nicht erreicht werden. An Admin melden", "Fehler")
        }
    } finally {
        loading.value = false;
    }
}
</script>
<template>
    <ion-page>
        <ion-header translucent ref="header">
            <ion-toolbar>
              <ion-title>History</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content fullscreen scroll-x="false" forceOverscrolle="false">
            <ion-grid>
                <ion-row id="button_row">
                    <ion-col>
                        <ion-button color="light" size="small">
                            <ion-icon slot="start" :icon="cloudUploadOutline" />
                            Upload 
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button color="light" 
                                    size="small" 
                                    @click="clearHistoryButton">
                            <ion-icon slot="start" :icon="closeCircleOutline" />
                            Löschen  
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
            
            <ion-list lines="inset" ref="list">
                <ion-list-header lines="inset">
                    <ion-label>Gescannte Codes</ion-label>
                    <ion-button id="help_popover_btn">
                        <ion-icon slot="icon-only" :icon="helpCircleOutline" />
                    </ion-button>
                </ion-list-header>
                <transition-group name="list">
                <ion-item-sliding v-for="code in offline_store.allCodes" :key="code.uuid">
                    <ion-item-options side="start">
                        <ion-item-option color="danger" @click="delete_code(code)">
                            <ion-icon slot="icon-only" :icon="trashOutline" />
                        </ion-item-option>
                    </ion-item-options>
                    <ion-item-options v-if="!isCode(code)" side="end">
                        <ion-item-option color="warning" @click="upload_code(code)">
                            <ion-icon slot="icon-only" :icon="cloudUploadOutline" />
                        </ion-item-option>
                    </ion-item-options>
                    <ion-item>
                        <ion-label> 
                            <h1 class="code_name" v-if="isCode(code)">
                                {{ code?.firstname }} {{ code?.lastname }}, {{ code?.class }}
                            </h1>
                            <h1 class="code_uuid" v-else> {{ code.uuid }}</h1>
                            <h3 class="code_timestamp">
                                {{ code.timestamp }}
                            </h3>
                        </ion-label>
                        <ion-icon slot="end" 
                                  :icon="isCode(code) ? checkmarkDoneOutline : checkmarkOutline"
                                  :color="isCode(code) ? 'success' : 'warning'">
                        </ion-icon>
                    </ion-item>
                </ion-item-sliding>
                </transition-group>
            </ion-list>
            
            <ion-popover 
                trigger="help_popover_btn" 
                trigger-action="click"
                showBackdrop="true" 
                id="help_popover"
            >
                <ion-content 
                    class="ion-padding" 
                    scroll="false" 
                    forceOverscroll="false"
                    part="help_popover_part"
                    scroll-x="false"
                >
                    <ion-icon :icon="checkmarkDoneOutline" color="success" style="margin-right: 3px;"/>
                    Bereits hochgeladen<br />
                    <ion-icon :icon="checkmarkOutline" color="warning" style="margin-right: 3px;" />
                    Nur offline auf diesem Gerät gespeicherte. Bitte hochladen<br /><br />
                    - Tippe auf einen Eintrag für mehr Infos<br />
                    - Swipe einen Eintrag nach rechts zum löschen<br />
                    - Swipe einen offline Eintrag nach links um nur diesen Hochzuladen<br />
                </ion-content>
            </ion-popover>
        </ion-content>
    </ion-page>    
</template>
<style scoped>
#button_row ion-button {
    width:  100%;
}
#button_row ion0-col {
    margin:  0px;
}
#help_popover {
    --backdrop-opacity: 0.40;
    --offset-y: 3px;
    --min-width: 240px;
    --background: var(--ion-color-step-100);
    font-size: 1.1em;
}
#help_popover ion-content {
    min-width: 220px;
}
#help_popover ion-content::part(background) {
    background-color: var(--ion-color-step-100);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  transform: translateX(100vw);
}
</style>
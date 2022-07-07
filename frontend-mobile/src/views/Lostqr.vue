<script lang="ts" setup>
import { ref, inject } from 'vue';
import type { AxiosInstance } from 'axios';
import { useOfflineStore } from '@/stores/offlineStore';
import { was_alert } from '@/includes/helper'
import { 
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonListHeader,
    IonButton,
    IonIcon,
    IonLoading,
    toastController
} from '@ionic/vue';
// import icons
import { 
    cloudUploadOutline,
    checkmarkOutline
} from 'ionicons/icons';

/* --- data --- */
let firstname = ref("")
let lastname = ref("")
let class_ = ref("")
let loading = ref(false)

/* --- composable and inject --- */
const $http: AxiosInstance = inject('$http') as AxiosInstance
const offline_store = useOfflineStore();

/* --- methods --- */
function clearForm() {
    firstname.value = "";
    lastname.value = "";
    class_.value = "";
}

async function sendForm() {
    // validate form
    // TODO

    loading.value = true;
    try {
    if (!navigator.onLine) {
        was_alert("Keine Internet Verbindung", "Info")
        loading.value = false;
    } else {
        let res = await $http.post(`/api/checkin/temp`, {
            walker: {
                firstname: firstname.value,
                lastname: lastname.value,
                class: class_.value 
            },
            station_uuid: offline_store.station_uuid ?? undefined
        });
        
        loading.value = false;

        if (res.status != 200 && 
            res?.data?.errorid && 
            res?.data?.errorid) {
            // handle error
            console.error(res?.data?.error)
            if (res.data.errorid == 2503 || res.data.errorid == 457)
                was_alert("Station ist ungültig. Melden sie sich bitte neu an oder kontaktiren sie den/die Admin", "Fehler")
            else
                was_alert("Fehler beim Upload. Admin kontaktiren. Fehler " + res.data.errorid, "Fehler")
        } else if (res?.data?.success) {
            // request success 
            const toast = await toastController.create({
                message: `Läudfer*in hochgeladen!`,
                duration: 3000,
                color: "success",
                icon: checkmarkOutline
            })
            toast.present();
        } else if (res.status >= 400) {
            was_alert(`Server konnte nicht erreicht werden. An Admin melden [${res.status}]`, "Fehler")
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
              <ion-title>Kein QR-Code</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content fullscreen scroll-x="false" forceOverscrolle="false">
            <div class="ion-padding">
                Gebe Daten ein, wenn jemand seinen QR-Code vergeseen hat
            </div>
            <ion-list lines="full">
                <ion-list-header>
                    <ion-label>Läufer*in</ion-label>
                    <ion-button @click="clearForm">Clear</ion-button>
                </ion-list-header>
                <ion-item>
                    <ion-label>Vorname:</ion-label>
                    <ion-input
                        autocomplete="off"
                        autocorrect="off"
                        placeholder="..."
                        v-model="firstname"
                    ></ion-input>
                </ion-item>
                <ion-item>
                    <ion-label>Nachname:</ion-label>
                    <ion-input
                        autocomplete="off"
                        autocorrect="off"
                        placeholder="..."
                        v-model="lastname"
                    ></ion-input>
                </ion-item>
                <ion-item>
                    <ion-label>Klasse:</ion-label>
                    <ion-input
                        autocapitalize="on"
                        autocomplete="off"
                        autocorrect="off"
                        placeholder="..."
                        v-model="class_"
                    ></ion-input>
                </ion-item>
            </ion-list>
            <ion-button 
                @click="sendForm"
                color="success"
                id="send_form_button"
                class="ion-float-end ion-margin"
            >
                <ion-icon :icon="cloudUploadOutline" slot="start" />
                Speichern
            </ion-button>
            <ion-loading
                :is-open="loading"
                cssClass="walker_loading"
                message="Sende an server..."
            >
            </ion-loading>
        </ion-content>
    </ion-page>
</template>

<style scoped>
</style>
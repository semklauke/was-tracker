<script lang="ts" setup>
import { ref, inject } from 'vue';
import { onIonViewDidEnter } from '@ionic/vue';
import QrScanner from 'qr-scanner'
import type { AxiosInstance, AxiosError } from 'axios'
import { useOfflineStore } from '@/stores/offlineStore';
import { isNull } from '@/includes/helper'
import { useRouter, onBeforeRouteLeave } from 'vue-router';
// import components
import {
    IonPage,
    IonContent,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonGrid,
    IonCol,
    IonRow,
    IonButtons,
    IonButton,
    IonIcon
} from '@ionic/vue';
// import icons
import { 
    camera,
    cameraOutline,
    flashlightOutline
} from 'ionicons/icons';

/* --- composable and inject --- */
const $http: AxiosInstance = inject('$http') as AxiosInstance
let qrScanner: QrScanner | null;
const offline_store = useOfflineStore();
const router = useRouter();

/* --- data --- */
let foundQr = ref(false)
let showModal = ref(true)
let showVideo = ref(false)
let hasFlash = ref(false)
let cameras = ref<QrScanner.Camera[]>([])

/* --- lifecycle hooks --- */
onIonViewDidEnter(() => {
    if (!foundQr.value) {
        qrScanner?.start();
        if (qrScanner) showVideo.value = true;
    } else {
        showVideo.value = false;
    }
})

onBeforeRouteLeave((to, from ,next) => {
    foundQr.value = false;
    showVideo.value = false;
    qrScanner?.stop();
    next();
});

function onModalMounted() {
    QrScanner.hasCamera().then(async () => {
        QrScanner.listCameras().then(cams => {
            cameras.value = cams
        }) 
        if (!qrScanner) {
            let videoElem = document.getElementById("login_scan_video") as HTMLVideoElement
            qrScanner = new QrScanner(videoElem, loginWithCode, {
                highlightScanRegion: true,
                highlightCodeOutline: true,
                returnDetailedScanResult: true,
                onDecodeError: () => {}
            });
        }
        await qrScanner?.start();
        hasFlash.value = await qrScanner.hasFlash();
        showVideo.value = true;
    }).catch(() => {
        showVideo.value = false;
        alert("Ihr Brwoser unterstützt keine Cameras bzw. hat nicht die Berechtigung diese zu nutzen");
    });
}

/* --- methods --- */
function loginWithCode(result: QrScanner.ScanResult) : void {
    // stop scanner
    if (result.data == "" || foundQr.value === true || !qrScanner) return;
    foundQr.value = true;
    showVideo.value = false;
    qrScanner?.stop();

    // gather data for the login api
    let login_data: { station: string; scanner?: string } = {
        station: result.data
    };
    if (!isNull(offline_store.scanner_uuid)) {
        login_data.scanner = offline_store.scanner_uuid;
    }
    // send code to api
    $http.post("/api/scanner", login_data).then(res => {
        if (res.status == 400 || res.status == 404) {
            // provied data was faulty
            handleOffline()
            if (res?.data?.errorid && res?.data?.error) {
                alert(`[ERROR ${res.data?.errorid}] ${res.data?.error}`)
            } else {
                alert("The api backend seems to be offline. Contact admin")
            }
            foundQr.value = false;
            qrScanner?.start();
        } else if (res.status == 401) {
            // scanner uuid is bad, try without
            offline_store.scanner_uuid = null;
            foundQr.value = false; // needed for the recusive call, meh
            loginWithCode(result);
        } else if (res.status != 200) {
            // unknow error
            console.error("Unknown /api/scanner error: "+res.status)
            alert("An unknown error occured. Please try again")
            foundQr.value = false;
            qrScanner?.start();
        } else {
            // 200 sucess
            offline_store.$patch(state => {
                state.scanner_uuid = res.data.scanner_uuid;
                if (!isNull(res.data.station_name)) {
                    state.station_name = res.data.station_name
                }
                //@ts-ignore
                state.station_uuid = result.data;
            });
            qrScanner?.destroy();
            qrScanner = null;
            // naviatge away from login
            router.push({ name: 'tab-scan' });
        }
    }).catch((err: AxiosError) => {
        console.error(err)
        if (!navigator.onLine && err?.code === "ERR_NETWORK") {
            alert("No Internert connection!!")
        }
        foundQr.value = false;
        qrScanner?.start();
    })
    
}

function handleOffline() : boolean {
    if (!navigator.onLine) {
        alert("No Internet connection!!")
    }
    return !navigator.onLine
}

function dismissModal() {
    showModal.value = false;
    setTimeout(() => { 
        //router.back();
        router.push('/')
    }, 200);
}

async function changeCam(cam_id: QrScanner.DeviceId) : Promise<void> {
    showVideo.value= false;
    await qrScanner?.setCamera(cam_id)
    showVideo.value = true;
    let cams = await QrScanner.listCameras();
    cameras.value = cams;

}

</script>

<template>
<ion-page>
    <ion-modal :is-open="showModal" 
               :canDismiss="true" 
               :swipe-to-close="false"
               @didPresent="onModalMounted">
        <ion-header translucent>
            <ion-toolbar>
              <ion-title>Login</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="dismissModal">Cancle</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
        <ion-content fullscreen>
            <ion-grid>
                <ion-row class="login_header_row">
                    <ion-col>
                        <h4 class="ion-text-center">Scanne Stations QR-Code</h4>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <div class="ion-justify-content-center ion-align-items-center" 
                             id="login_scan_container"
                        >
                            <ion-icon :icon="camera" id="login_scan_icon" v-show="!showVideo" />
                            <video 
                                id="login_scan_video"
                                disablepictureinpicture
                                muted
                                playsinline
                            ></video>
                        </div>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-justify-content-around cam_button_row">
                    <ion-col v-if="hasFlash">
                        <ion-button  @click="qrScanner?.toggleFlash" color="light">
                            <ion-icon slot="icon-only" :icon="flashlightOutline"></ion-icon>
                        </ion-button>
                    </ion-col>
                    <ion-col v-for="(cam, index) in cameras" >
                        <ion-button @click="changeCam(cam.id)" color="medium">
                            <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
                            #{{index+1}}
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-modal>
</ion-page>
</template>

<style>
#login_scan_icon {
    display: inline;
}

#login_scan_video {
    width: 100%;
    max-width: 100%;
}
.cam_button_row ion-col {
    padding-top: 0px;
    padding-bottom: 0px;
}

.cam_button_row {
    padding: 0px 10px;
} 
.cam_button_row ion-button,
.cam_button_row button {
    width: 100%;
}

#login_scan_container {
    max-height: 70vh;
    padding: 5px 16px 5px 16px;
}

.login_header_row h4 {
    margin-top: 8px;
    margin-bottom: 6px;
}
</style>
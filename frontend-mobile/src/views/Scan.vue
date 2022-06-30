<script lang="ts" setup>
import { ref, inject, onMounted } from 'vue';
import type { Ref, ComponentPublicInstance } from 'vue';
import { onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue';
import QrScanner from 'qr-scanner';
import type { AxiosInstance } from 'axios';
import { useOfflineStore } from '@/stores/offlineStore';
import type { ScanCode } from '@/stores/offlineStore';
import { dateToSqliteTimestamp, was_alert } from '@/includes/helper';
// import components
import {
    IonPage,
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
    IonButton,
    IonIcon,
    IonText
} from '@ionic/vue';
// import icons
import { 
    camera,
    cameraOutline,
    flashlightOutline
} from 'ionicons/icons';

type Timer = number

/* --- composable and inject --- */
const $http: AxiosInstance = inject('$http') as AxiosInstance
let qrScanner: QrScanner | null;
const offline_store = useOfflineStore();

/* --- data --- */
let showVideo = ref(true)
let hasFlash = ref(false)
let loading = ref(false)
let showInfotext = ref(false)
let cameras = ref<QrScanner.Camera[]>([])
let infotext_color = ref("success")
let toggleCamButton = ref() as Ref<ComponentPublicInstance<typeof IonButton>>
let infotext = ref("")
let infotext_timer: Timer | undefined;

/* --- lifecycle hooks --- */
onMounted(() => {
    showVideo.value = false;
    QrScanner.hasCamera().then(async () => {
        cameras.value = await QrScanner.listCameras()
    }).catch(() => {
        alert("Ihr Brwoser unterstützt keine Cameras bzw. hat nicht die Berechtigung diese zu nutzen");
    });
})

onIonViewWillEnter(async () => {
    startCam();
    displayInfotext("✓ QR-Code gesendet!", "success")
})

onIonViewWillLeave(() => {
    stopCam();
})


/* --- methods --- */

async function scannedCode(result: QrScanner.ScanResult) {
    qrScanner?.pause();
    // todo: add waiting animation here
    loading.value = true;

    // parse qr
    let qrData = result.data.split(";");
    if (qrData.length != 2 || qrData[0].toLowerCase() != 'walker') {
        was_alert("QR Code enthält feherlhafte Informationen", "Info");
        qrScanner?.start();
        return;
    }

    try {
    if (!navigator.onLine) {
        loading.value = false;
        await saveCodeOffline(qrData[1])
    } else {
        let station = offline_store.station_uuid || "error"
        let res = await $http.post(`/api/checkin/station/${station}`, );
        loading.value = false;

        if (res.status != 200 && 
            res?.data?.errorid && 
            res?.data?.error) {
            // handle error
            console.error(res?.data?.error)
            switch (res?.data?.errorid) {
                case 287:
                    was_alert("Station nicht bekannt", "Fehler")
                    break;
                case 4058:
                    was_alert("QR-Code/Läufer*in nicht bekannt.", "Fehler")
                    break;
                default:
                    was_alert("Fehler aufgetreten. Bitte erneut probieren.", "Fehler")
                    break;
            }
            displayInfotext("✗ Nicht gespeichert", "danger")
        } else if (res?.data?.success) {
            // request success
            displayInfotext("✓ QR-Code gesendet!", "success")
        }
    } } catch (err: any) {
        if (!navigator.onLine && err?.code === "ERR_NETWORK") {
            was_alert("Keine Internet Verbindung", "Info")
        } else {
            if (!err) err = new Error("API request error")
            console.error(err)
        }
        displayInfotext("✗ Nicht gespeichert", "danger")
    } finally {
        qrScanner?.start();
        loading.value = false;
    }
}

async function saveCodeOffline(uuid: string) {
    let timestamp = dateToSqliteTimestamp(new Date());
    let station_uuid = offline_store.station_uuid || "error"
    let newCode: ScanCode = {
        uuid,
        timestamp,
        station_uuid
    }
    offline_store.offline_codes.push(newCode)
    displayInfotext("(✓) Offline Gespeichert", "warning")
}

function toggleCam() {
    if (showVideo.value)
        stopCam();
    else
        startCam();
}

function startCam() {
    if (!qrScanner) initCam();
    qrScanner?.start().then(async () => {
        showVideo.value = true;
        hasFlash.value = <boolean> await qrScanner?.hasFlash();
    }).catch((e: any) => {
        if (!e) e = new Error("QR-Scanner konnte nicht starten")
        console.error(e)
    })
}

function stopCam() {
    qrScanner?.stop();
    showVideo.value = false;
}

function initCam(force = false) {
    if (qrScanner && force) {
        qrScanner?.destroy();
        qrScanner = null;
    } else if (!qrScanner) {
        let videoElem = document.getElementById("scan_video") as HTMLVideoElement
        qrScanner = new QrScanner(videoElem, scannedCode, {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
            onDecodeError: () => {}
        });
    }
}


async function changeCam(cam_id: QrScanner.DeviceId) : Promise<void> {
    if (toggleCamButton.value) 
        toggleCamButton.value.$el.disabled = true;
    await qrScanner?.setCamera(cam_id)
    cameras.value = await QrScanner.listCameras();
    if (toggleCamButton.value) 
        toggleCamButton.value.$el.disabled = false;
}

async function displayInfotext(text: string, color = "") {
    showInfotext.value = true;
    infotext.value = text;
    infotext_color.value = color;
    clearTimeout(infotext_timer);
    infotext_timer = setTimeout(() => {
        showInfotext.value = false;
    }, 3000)
}

</script>

<template>
    <ion-page>
        <ion-content fullscreen scroll-y="false">
            <ion-grid>
                <ion-row class="scan_header_row">
                    <ion-col>
                        <h4 class="ion-text-center">QR-Code Scannen</h4>
                    </ion-col>
                </ion-row>
                <ion-row class="scan_header_row">
                    <ion-col>
                        <ion-button expand="block" color="primary" @click="toggleCam" ref="toggleCamButton" id="toggleCamButton">
                            <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
                            Kamera {{ showVideo ? "Aus" : "An" }}
                        </ion-button>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <div class="ion-justify-content-center ion-align-items-center" 
                             id="scan_container"
                        >
                            <ion-icon :icon="camera" id="scan_icon" v-show="!showVideo" />
                            <video 
                                id="scan_video"
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
                <ion-row class="ion-justify-content-center ion-text-center infotext">
                    <ion-col>
                        <Transition name="fade">
                        <ion-text :color="infotext_color" v-show="showInfotext">
                            {{ infotext }}
                        </ion-text>
                        </Transition>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<style scoped>
#scan_icon {
    display: inline;
}
#scan_container {
    max-height: 40vh;
    padding-top: 5px;
    padding-bottom: 5px;
}
#scan_video {
    width: 100%;
    max-width: 100%;
}

.scan_header_row h4 {
    margin-top: 8px;
    margin-bottom: 6px;
}
.cam_button_row ion-col {
    padding-top: 0px;
    padding-bottom: 0px;
}

.cam_button_row {
    padding: 2px 0px;
} 
.cam_button_row ion-button,
.cam_button_row button {
    width: 100%;
}
#toggleCamButton {
    /*width: calc(100% - 32px);
    margin: 5px 16px 5px 16px;*/
    width: 100%;
}
.infotext {
    font-size: 1.2em;
    padding: 10px 0px;
}
.invisible {
    visibility: hidden;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-leave-from,
.fade-enter-to {
    opacity: 1;
}
</style>
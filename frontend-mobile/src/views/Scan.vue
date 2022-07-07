<script lang="ts" setup>
import { ref, inject, onMounted } from 'vue';
import type { Ref, ComponentPublicInstance } from 'vue';
import { onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue';
import QrScanner from 'qr-scanner';
import type { AxiosInstance } from 'axios';
import { useOfflineStore } from '@/stores/offlineStore';
import type { OfflineCode } from '@/stores/offlineStore';
import { dateToSqliteTimestamp, was_alert } from '@/includes/helper';
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
    IonButton,
    IonIcon,
    IonText,
    IonLoading
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
let added_walker = ref("Sem Klauke, Q2")
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
            // if got an walker object back, save and display it
            if (res?.data?.walker) {
                offline_store.codes.push({
                    uuid: qrData[1],
                    timestamp: dateToSqliteTimestamp(new Date()),
                    station_uuid: offline_store.station_uuid || "error",
                    firstname: res?.data?.walker?.firstname || "Firstname missing",
                    lastname: res?.data?.walker?.lastname || "Lastname missing",
                    class: res?.data?.walker?.class || "Class missing"
                })
                added_walker.value = 
                    `${res?.data?.walker?.firstname} ${res?.data?.walker?.lastname}, ${res?.data?.walker?.class}`;
            } else {
                added_walker.value = "";
            }
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
    let newCode: OfflineCode = {
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
    loading.value = false;
    showInfotext.value = true;
    infotext.value = text;
    infotext_color.value = color;
    clearTimeout(infotext_timer);
    infotext_timer = setTimeout(() => {
        showInfotext.value = false;
        added_walker.value = "";
    }, 3000)
}

</script>

<template>
    <ion-page>
        <ion-header translucent>
            <ion-toolbar>
              <ion-title>QR-Code Scannen</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content scroll-y="false">
            <ion-grid>
                <!--ion-row class="scan_header_row">
                    <ion-col>
                        <h4 class="">QR-Code Scannen</h4>
                    </ion-col>
                </ion-row-->
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
                        <ion-button  @click="qrScanner?.toggleFlash" color="light" size="small">
                            <ion-icon slot="icon-only" :icon="flashlightOutline"></ion-icon>
                        </ion-button>
                    </ion-col>
                    <ion-col v-for="(cam, index) in cameras" >
                        <ion-button @click="changeCam(cam.id)" color="medium" size="small">
                            <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
                            #{{index+1}}
                        </ion-button>
                    </ion-col>
                </ion-row>
                <ion-row class="infotext">
                    <Transition name="fade">
                    <div id="infotext_background" v-show="showInfotext">
                        <ion-text :color="infotext_color"  >
                            <div id="infotext_walker" v-if="added_walker != ''">
                                {{ added_walker }}
                            </div>
                            <span id="infotext_info">
                                {{ infotext }}
                            </span>
                        </ion-text>
                    </div>
                    </Transition>
                </ion-row>
            </ion-grid>
            <ion-loading
                :is-open="loading"
                cssClass="scan_loading"
                message="Sende an server..."
            >
            </ion-loading>
        </ion-content>
    </ion-page>
</template>

<style scoped>
#scan_icon {
    display: inline;
}
#scan_container {
    padding-top: 5px;
    padding-bottom: 5px;
}
#scan_video {
    width: 100%;
    max-width: 100%;
    max-height: 55vh;
}

.scan_header_row h4 {
    margin-top: 4px;
    margin-bottom: 4px;
    margin-left: 5px;
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
    margin: 0px;
}

#toggleCamButton {
    margin: 0px;
}

.infotext {
    padding: 0px 0px;
    position: absolute;
    top: 120px;
    width: 100%;
    margin: 0px -5px;
    text-align: center;
    display: flex;
    justify-content: center;
}


.infotext #infotext_background {
    --pad: 30px;
    background-color: rgba(0,0,0,0.85);
    /*width: calc(100% - 2*var(--pad));*/
    border-radius: 14px;
    padding: 15px var(--pad) 15px var(--pad);
    margin: 0px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(0, 0, 0, 1.0);
}

body.dark .infotext #infotext_background {
    background-color: rgba(0,0,0,0.90);
    border: 1px solid rgba(255, 255, 255, 0.32);
}

#infotext_walker {
    font-size: 1.6em;
    margin-bottom: 12px;
}

#infotext_info {
    font-weight: bold;
    font-size: 1.1em;
}

.invisible {
    visibility: hidden;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.7s ease;
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
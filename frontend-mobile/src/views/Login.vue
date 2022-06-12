<script lang="ts" setup>
import { onMounted, ref, inject } from 'vue'
import QrScanner from 'qr-scanner'
import type { AxiosInstance, AxiosError } from 'axios'
import { useOfflineStore } from '@/stores/offlineStore';
import { isNull } from '@/includes/helper'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

const $http: AxiosInstance = inject('$http') as AxiosInstance
let qrScanner: QrScanner;
const offline_store = useOfflineStore();
const rounter = useRouter();

/* --- data --- */
let foundQr = ref(false)

/* --- lifecycle hooks --- */
onMounted(() => {
    if (navigator === undefined 
     || navigator.mediaDevices === undefined 
     || navigator.mediaDevices.getUserMedia === undefined) {
        alert("Ihr Brwoser unterstützt keine Cameras bzw. hat nicht die Berechtigung diese zu nutzen");
        return;
    }
    let videoElem = document.getElementById("login-scan-video") as HTMLVideoElement
    qrScanner = new QrScanner(videoElem,loginWithCode, {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        onDecodeError: () => {}
    });
    qrScanner.start();
});

onBeforeRouteLeave((to, from ,next) => {
    foundQr.value = false;
    qrScanner.stop();
    next();
});

/* --- methods --- */
function loginWithCode(result: QrScanner.ScanResult) : void {
    // stop scanner
    if (result.data == "" || foundQr.value === true) return;
    foundQr.value = true;
    qrScanner.stop();

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
            qrScanner.start();
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
            qrScanner.start();
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
            // naviatge away from login
            rounter.push({ name: 'tab-scan' });
        }
    }).catch((err: AxiosError) => {
        console.error(err)
        if (!navigator.onLine && err?.code === "ERR_NETWORK") {
            alert("No Internert connection!!")
        }
        foundQr.value = false;
        qrScanner.start();
    })
    
}

function handleOffline() : boolean {
    if (!navigator.onLine) {
        alert("No Internet connection!!")
    }
    return !navigator.onLine
}
</script>

<template>
<div id="tab-login-container" class="container-xl">
    <div class="row">
        <div class="col-12" id="login-heading">
            <h2>Stations Code scannen</h2>
        </div>
    </div>
    <div class="row">
        <div class="col-12" id="login-scan-container">
            <video 
                id="login-scan-video"
                disablepictureinpicture
                muted
                playsinline
            ></video>
        </div>
    </div>
</div> 
</template>

<style scoped>
#login-heading {
    width: 100%;
}

#login-scan-video {
    width: 100%;
    max-width: 100%;
}
</style>
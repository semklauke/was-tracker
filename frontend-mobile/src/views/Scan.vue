<template>
    <div id="tab-scan-container" class="container-xl">
        <div class="row">
            <div class="col-12" id="scan-heading">
                <h2>
                    SuS scannen
                    <span class="scan-cancel-button" v-if="animate">
                        <button type="button" class="btn btn-dark" @click="closeCamera">
                            &#215;
                        </button>
                    </span>
                </h2>
            </div>
        </div>
        <div class="row">
            <div class="col-12" >
                <div id="scan-scan-container" :class="{ scanBackground: !animate }" @click="openCamera">
                    <canvas id="scan-scan-canvas" hidden></canvas>
                </div>
            </div>
        </div>
        <div class="row scan-info" v-if="request_info">
            <div class="col">
                <div class="alert " :class="request_info_classes" role="alert">
                    {{ request_info_text }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/*UPGRADE*/
//import { Toast } from 'mint-ui';
function Toast({ message, duration }) {}

export default {
    data: function () {
        return {
            animate: false,
            stop_cam: false,
            request_info: false,
            request_info_classes: {
                'alert-success': false,
                'alert-danger': false,
                'alert-warning': false
            },
            request_info_text: ''
        };
    },
    _canvas: null, 
    _stream: null,
    _lastcode: null,
    _codecount: null,
    _rAF: null,
    components: {
    },
    mounted() {
        if (navigator === undefined 
         || navigator.mediaDevices === undefined 
         || navigator.mediaDevices.getUserMedia === undefined) {
            alert("Ihr Brwoser unterstützt keine Cameras bzw. hat nicht die Berechtigung diese zu nutzen");
            return;
        }
    },
    methods: {
        drawQRInfo(location) {
            let canvas = this.$options._canvas;
            canvas.lineWidth = 5;
            canvas.strokeStyle = "#FF2D2D";
            canvas.beginPath();
            canvas.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
            let f = corner => {
                canvas.lineTo(corner.x, corner.y);
                canvas.moveTo(corner.x, corner.y);
            }
            f(location.topRightCorner);
            f(location.bottomRightCorner);
            f(location.bottomLeftCorner);
            f(location.topLeftCorner);
            canvas.stroke();
        },
        openCamera() {
            if (this.animate == true)
                return;

            let video = document.createElement("video");
            let canvasElement = document.getElementById("scan-scan-canvas");
            let canvas = canvasElement.getContext("2d");
            this.$options._canvas = canvas;

            let fps_then;
            let fps_start;
    
            let tick = () => {
                if (this.stop_cam) {
                    this.stop_cam = false;
                    cancelAnimationFrame(this.$options._rAF);
                    return;
                }

                this.$options._rAF = requestAnimationFrame(tick);

                let fps_now = Date.now().valueOf();
                let fps_elapsed = fps_now - fps_then;
                
                if (fps_elapsed > 120) {
                    fps_then = fps_now - (fps_elapsed % 120);

                    if (video.readyState == video.HAVE_ENOUGH_DATA) {
                        canvas.clearRect(0,0,canvasElement.width,canvasElement.height);
                        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                        let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
                        let code = this.$jsqr(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: "dontInvert",
                        });

                        if (code) {
                            if (this.$options._lastcode === null) {
                                this.$options._lastcode = code.data;
                            } else if (code.data == this.$options._lastcode) {
                                saveCode(code.data);
                            }
                            
                        }
                    }
                }
                         
            }
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
                this.animate = true;
                this.stop_cam = false;
                this.$options._stream = stream;
                video.srcObject = stream;
                video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
                video.play();
                let tickSetup = () => {
                    if (video.readyState == video.HAVE_ENOUGH_DATA) {
                        canvasElement.hidden = false;
                        canvasElement.height = video.videoHeight;
                        canvasElement.width = video.videoWidth;
                        fps_then = Date.now();
                        fps_start = fps_then;
                        this.$options._rAF = requestAnimationFrame(tick);
                    } else {
                        this.$options._rAF = requestAnimationFrame(tickSetup);
                    }
                } 
                this.$options._rAF = requestAnimationFrame(tickSetup);
            });
        },
        saveCode(code) {
            this.animate = false;
            this.stop_cam = true;
            cancelAnimationFrame(this.$options._rAF);
            this.drawQRInfo(code.location);
            this.$http.post(
                "/api/checkin/station/" + this.$localStorage.get('station_id', 'error'), 
                { code_uuid: code }
            ).then(res => {
                if (res.status == 404) {
                    this.saveCodeOffline(code);
                    this.request_info_text = "Läufer offline gespeichert!";
                    this.toggleRequestClass('alert-warning');
                    /*UPGRADE*/
                    Toast({
                        message: '✓',
                        duration: 3500
                    });            
                } else if (res.status != 200) {
                    this.request_info_text = "Fehler aufgetreten!";
                    this.toggleRequestClass('alert-danger');
                    /*UPGRADE*/
                    Toast({
                        message: '✗',
                        duration: 3500,
                    }); 
                } else {
                    // worked 
                    this.request_info_text = "Läufer regrestriert!";
                    this.toggleRequestClass('alert-success');
                    /*UPGRADE*/
                    Toast({
                        message: '✓',
                        duration: 3500,
                    });
                }
                this.request_info = true;
                this.closeCamera();
                this.resetRequestInfo();
            }).catch(e => {
                alert(e.toString());
                this.request_info_text = "Fehler aufgetreten!";
                this.toggleRequestClass('alert-danger');
                this.request_info = true;
                this.closeCamera();
                this.resetRequestInfo();
            });
        },
        saveCodeOffline(code) {
            /*UPGRADE*/
            let keys = this.$localStorage.get('offline_codes', '');
            this.$localStorage.set('offline_codes', keys+code+";");
            let value = Math.floor(Date.now()/1000).toString() + ";";
            value += this.$localStorage.get('station_id', 'null');
            localStorage.setItem(code, value);
        },
        closeCamera() {
           cancelAnimationFrame(this.$options._rAF);
           if (this.$options._stream != null) {
               this.$options._stream.getTracks().forEach(track => { track.stop(); });
               this.$options._stream = null;
           }
           this.animate = false;
           this.stop_cam = true;
           let canvasElement = document.getElementById("scan-scan-canvas");
           let canvas = canvasElement.getContext("2d");
           canvas.clearRect(0,0,canvasElement.width,canvasElement.height);
        },
        toggleRequestClass(c) {
            this.request_info_classes['alert-success'] = false;
            this.request_info_classes['alert-warning'] = false;
            this.request_info_classes['alert-danger'] = false;
            if (c) this.request_info_classes[c] = true;
        },
        resetRequestInfo() {
            setTimeout(() => {
                this.request_info = false;
                this.toggleRequestClass();
                this.request_info_text = '';
            }, 3500);
        }
    },
    beforeRouteLeave(to, from, next) {
        this.closeCamera();
        next();
    }
};
</script>

<style>
#scan-heading {
    width: 100%;
    text-align: center;
}
.scanBackground {
    background-color: rgba(0,0,0,0.3);
    background-image: url('/assets/scan.svg');
}
#scan-scan-container {
    max-height: 800px;
    min-height: 350px;
    background-size: 50%;
    background-repeat: no-repeat;
    background-position: center; 
    z-index: 10;
}
#scan-scan-canvas {
    width: 100%;
    max-height: 800px;
    max-width: 100%;
    z-index: 100;
}
.scan-cancel-button button {
    min-width: 40px;
    float: right;
}
.scan-info {
    margin-top: 15px;
}
.mint-toast-text {
    font-size: 3em;
}
</style>
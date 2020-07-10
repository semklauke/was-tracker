<template>
    <div id="tab-scan-container" class="container-xl">
        <div class="row">
            <div class="col-12" id="scan-heading">
                <h2>SuS scannen</h2>
            </div>
        </div>
        <div class="row">
            <div class="col-12" >
                <div id="scan-scan-container" :class="{ scanBackground: !animate }">
                    <canvas id="scan-scan-canvas" hidden></canvas>
                </div>
            </div>
        </div>
</div>
</template>

<script>
export default {
    data: function () {
        return {
            animate: false
        };
    },
    _canvas: null, 
    _stream: null,
    _lastcode: null,
    components: {
    },
    mounted() {
        if (navigator === undefined 
         || navigator.mediaDevices === undefined 
         || navigator.mediaDevices.getUserMedia === undefined) {
            alert("Ihr Brwoser unterstützt keine Cameras bzw. hat nicht die Berechtigung diese zu nutzen");
            return;
        }

        let video = document.createElement("video");
        let canvasElement = document.getElementById("scan-scan-canvas");
        let canvas = canvasElement.getContext("2d");
        this.$options._canvas = canvas;

        let tick = () => {
            if (video.readyState == video.HAVE_ENOUGH_DATA) {
                canvasElement.hidden = false;
                canvasElement.height = video.videoHeight;
                canvasElement.width = video.videoWidth;
                canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
                let code = this.$jsqr(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                    if (this.$options._lastcode === null) {
                        this.$options._lastcode = code.data;
                    } else if (code.data == this.$options._lastcode) {
                        this.animate = false;
                        this.drawQRInfo(code.location);
                        console.log(code.data);
                        setTimeout(() => {
                            this.$options._lastcode = null;
                            this.animate = true;
                            requestAnimationFrame(tick);
                        }, 1000);
                    }
                    
                }
            }
            if (this.animate) requestAnimationFrame(tick);            
        }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
            this.animate = true;
            this.$options._stream = stream;
            video.srcObject = stream;
            video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
            video.play();
            requestAnimationFrame(tick);
        });
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
        }
    },
    beforeRouteLeave (to, from, next) {
        if (this.$options._stream != null) {
            this.$options._stream.getTracks().forEach(track => { track.stop(); });
            this.$options._stream = null;
        }
        this.animate = false;
        next();
    }
};
</script>

<style scoped>
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
</style>
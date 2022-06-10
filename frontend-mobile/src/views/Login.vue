<template>
<div id="tab-login-container" class="container-xl">
    <div class="row">
        <div class="col-12" id="login-heading">
            <h2>Stations Code scannen</h2>
        </div>
    </div>
    <div class="row">
        <div class="col-12" id="login-scan-container">
            <canvas id="login-scan-canvas" hidden></canvas>
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
        let canvasElement = document.getElementById("login-scan-canvas");
        let canvas = document.getElementById("login-scan-canvas").getContext("2d");
        this.$options._canvas = canvas;

        let tick = async () => {
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
                    this.animate = false;
                    this.drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
                    this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
                    this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
                    this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");

                    let login_data = {
                        station: code.data
                    };
                    /*UPGRADE*/
                    let localScanner = this.$localStorage.get('scanner_uuid', null);
                    if (localScanner !== null && localScanner != "null") {
                        login_data['scanner'] = localScanner;
                    }
                    this.$http.post("/api/scanner", login_data).then(res => {
                        if (res.status != 200) {
                            alert(res.data.error ? res.data.error : "ERROR. The API Seems to be offline");
                            this.animate = true;
                            requestAnimationFrame(tick);
                        } else {
                            /*UPGRADE*/
                            this.$localStorage.set('scanner_uuid', res.data.scanner_uuid); 
                            if (res.data.station_name &&
                                res.data.station_name !== null && 
                                res.data.station_name != "null") {
                                this.$root.station_name = res.data.station_name;
                            } else {
                                res.data.station_name = null;
                            }
                            this.$root.station_id = code.data;
                            this.$router.push({ name: 'tab-scan' });
                        }
                    }).catch(e => {
                        alert(e.toString());
                        this.animate = true;
                        requestAnimationFrame(tick);
                    });
                    /*
                    Api request
                        pass -> route push scan; return
                        fail -> continue
                    */

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
    beforeRouteLeave (to, from, next) {
        if (this.$options._stream != null) {
            this.$options._stream.getTracks().forEach(track => { track.stop(); });
            this.$options._stream = null;
        }
        this.animate = false;
        next();
    },
    methods: {
        drawLine(begin, end, color) {
            let canvas = this.$options._canvas;
            canvas.beginPath();
            canvas.moveTo(begin.x, begin.y);
            canvas.lineTo(end.x, end.y);
            canvas.lineWidth = 4;
            canvas.strokeStyle = color;
            canvas.stroke();
        }
    }
};
</script>

<style scoped>
#login-heading {
    width: 100%;
}

#login-scan-canvas {
    width: 100%;
    max-width: 100%;
}
</style>
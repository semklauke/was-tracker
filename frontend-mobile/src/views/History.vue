<template>
    <div id="tab-history-container" class="container-xl">
        <div class="row" id="history-upload-row">
            <div class="col">
                <button type="button"
                        class="btn btn-light btn-block" 
                        @click="uploadOffline" 
                        id="history-upload-btn"
                >
                    Upload <img src="/assets/sync.svg" alt="upload"/>
                </button>
            </div>
            <div class="col">
                <button type="button" 
                        class="btn btn-light btn-block" 
                        @click="clearOffline"
                        id="history-clear-btn"
                >
                    Clear <img src="/assets/dismiss.svg" alt="dismiss"/>
                </button>
            </div>
        </div>
        <table class="table table-striped history-table"> 
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="code in codes">
                <td>{{code.code_uuid.substring(0,10)}}</td>
                <td>{{ Math.floor(code.stamp*1000).toString() }}</td>
              </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
// we removed mint-ui /*UPGRADE*/
//import { MessageBox } from 'mint-ui'; 
export default {
    data: function () {
        return {
            codes: [],
        };
    },
    components: {
    },
    mounted() {
    },
    methods: {
        uploadOffline() {
            this.$http.post("/api/checkin/offline/", { 
                codes: this.codes, 
                length: this.codes.length
            }).then(res => {
                if (res.status == 404) {
                    /*UPGRADE*/   
                    /*MessageBox.*/alert("Immernoch kein Verbindung :/", 'Fehler');         
                } else if (res.status != 200) {
                    /*MessageBox.*/alert("Server Fehler", 'Fehler');
                } else {
                    /*MessageBox.*/alert(
                        res.data.count + "/" + this.codes.length +
                        " checkins hochgeladen. Bei 100% specher bitte leeren",
                        "Erfolg"
                    );
                }
            }).catch(e => {
                /*UPGRADE*/
                /*MessageBox.*/alert(e.toString(), 'Fehler#');
            });
        },
        clearOffline() {
            for (c of this.codes) {
                localStorage.removeItem(c.code_uuid);
            }
            /*UPGRADE*/
            this.$localStorage.set('offline_codes', '');
            this.codes = [];
        }
    },
    beforeRouteLeave(to, from, next) {
        this.codes = [];
        next();
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            /*UPGRADE*/
            let keys = vm.$localStorage.get('offline_codes', '');
            if (keys != '')
            for (k of keys.split(';')) {
                let d = localStorage.getItem(k);
                if (d) {
                    let dd = d.split(';');
                    this.codes.push({ 
                        code_uuid: k, 
                        stamp: dd[0],
                        station_uuid: dd[1]
                    });
                }
            }
        });
}
};
</script>

<style>
#tab-history-container {
    overflow: scroll;
    max-height: calc(100vh - 200px);
}
.history-table {
    overflow-y: scroll;
    
}
#history-upload-row {
    margin-bottom: 15px;
}
#history-upload-row img {
    width: 1.2em;
    height: 1.2em;
}
</style>
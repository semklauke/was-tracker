<template>
<div id="app">
    <nav class="navbar navbar-light bg-light border-bottom">
        <span class="navbar-brand mb-0 h1 " id="wastrackerbrand">WaS-Tracker</span>
    </nav>

    <div class="fixed-bottom bg-primary text-white" id="station_info">
        <div id="station_info_name">Station 3</div>
        
        <div id="station_info_dismiss_span">
            &#215;
        </div> 
        <span class="clearfix"></span>
    </div>
    <mt-tabbar v-model="activetab">
        <mt-tab-item id="tab-scan">
            <img slot="icon" class="tabbaricon" src="assets/scan.svg" />
            SuS
        </mt-tab-item>
        <mt-tab-item id="tab-info">
            <img slot="icon" class="tabbaricon" src="assets/info.svg" />
            Info
        </mt-tab-item>
        <mt-tab-item id="tab-history">
            <img slot="icon" class="tabbaricon" src="assets/history.svg" />
            History
        </mt-tab-item>
        <mt-tab-item id="tab-lostqr">
            <img slot="icon" class="tabbaricon" src="assets/lostqr.svg" />
            Kein QR
        </mt-tab-item>
        <mt-tab-item id="tab-help">
            <img slot="icon" class="tabbaricon" src="assets/help.svg" />
            Help
        </mt-tab-item>
    </mt-tabbar>
    <transition
        enter-active-class="animated fadeIn faster"
        leave-active-class="animated fadeOut faster"
        mode="out-in"
    >
        <router-view></router-view>
    </transition>
</div>
</template>

<style>
.tabbaricon {
    width: 100%;
    height: 100%;
}
#station_info {
    width: 100%;
    padding: 0px;
    margin: 0px;
    min-height: 40px;
    max-height: 45px;
    font-size: 1.3em;
    position: absolute;
    left: 0px;
    top: 56px;
    box-shadow: 0 .125rem .25rem rgba(0,0,0,.425)!important;
    border-radius: 0px 0px 10px 10px;
}
#wastrackerbrand {
    width: 100%;
    text-align: center;
    font-size: 1.4em;
}
#station_info_name {
    width: 60%;
    display: inline-block;
    height: 100%;
    line-height: 45px;
    padding-left: 15px;
}
#station_info_dismiss_span {
    width: 30%;
    float: right;
    font-weight: lighter;
    color: #BFBFBF;
    text-align: right;
    padding-right: 15px;
    display: inline-block;
    height: 100%;
    line-height: 38px;
    font-size: 2em;
}
.filler {
    width: 100%;
}
</style>

<script>
export default {
    data: function () {
        return { 
            activetab: ''
        };
    },
    watch: {
        activetab: function(val) {
            this.$router.push({ name: val });
        }
    }
};

</script>


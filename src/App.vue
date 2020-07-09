<template>
<div id="app">
    <mt-tabbar v-model="activetab">
        <mt-tab-item id="tab-scan">
            <img slot="icon" class="tabbaricon" src="assets/scan.svg">
            SuS
        </mt-tab-item>
        <mt-tab-item id="tab-info">
            <img slot="icon" class="tabbaricon" src="assets/info.svg">
            Info
        </mt-tab-item>
        <mt-tab-item id="tab-history">
            <img slot="icon" class="tabbaricon" src="assets/history.svg">
            History
        </mt-tab-item>
        <mt-tab-item id="tab-lostqr">
            <img slot="icon" class="tabbaricon" src="assets/lostqr.svg">
            Kein QR
        </mt-tab-item>
        <mt-tab-item id="tab-help">
            <img slot="icon" class="tabbaricon" src="assets/help.svg">
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


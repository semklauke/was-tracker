import { defineStore, acceptHMRUpdate } from 'pinia';

export type ScanCode = {
    uuid: string;
    timestamp: string;
    station_uuid: string;
}
export type OfflineStore = {
    station_name: string | null;
    station_uuid: string | null;
    scanner_uuid: string | null;
    offline_codes: ScanCode[];
}

export const useOfflineStore = defineStore('offlineStore', {
    state: () => ({
        station_name: null,
        station_uuid: null,
        scanner_uuid: null,
        offline_codes: []
    }),
    actions: {
        
    }
});

// HMR
if (import.meta.hot) {
    import.meta.hot.accept(
        acceptHMRUpdate(useOfflineStore, import.meta.hot)
    );
}
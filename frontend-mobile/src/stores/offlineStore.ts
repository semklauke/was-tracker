import { defineStore, acceptHMRUpdate } from 'pinia';

export interface OfflineCode {
    uuid: string;
    timestamp: string;
    station_uuid: string;
}

export interface Code extends OfflineCode {
    firstname: string;
    lastname: string;
    class: string;
}

export type OfflineStore = {
    station_name: string | null;
    station_uuid: string | null;
    scanner_uuid: string | null;
    offline_codes: OfflineCode[];
    codes: (Code | OfflineCode)[];
}

export const useOfflineStore = defineStore('offlineStore', {
    state: (): OfflineStore => ({
        station_name: null,
        station_uuid: null,
        scanner_uuid: null,
        offline_codes: [],
        codes: []
    } as OfflineStore),
    actions: {
        
    },
    getters: {
        allCodes: (state) : (Code | OfflineCode)[] => {
            return state.codes.concat(state.offline_codes).sort((a,b) => {
                return new Date(a.timestamp).getTime() - 
                       new Date(b.timestamp).getTime();
            })    
        }
    }
});

// HMR
if (import.meta.hot) {
    import.meta.hot.accept(
        acceptHMRUpdate(useOfflineStore, import.meta.hot)
    );
}
import { defineStore, acceptHMRUpdate } from 'pinia';
import { isCode } from '@/includes/helper';

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
        delete_code(c: Code | OfflineCode) {
            if (isCode(c))
                return this.delete_onlineCode(c);
            else
                return this.delete_offlineCode(c);
        },
        delete_offlineCode(c: OfflineCode) : boolean {
            for (let i = 0; i<this.offline_codes.length; i++) {
                if (this.offline_codes[i].uuid == c.uuid) {
                    this.offline_codes.splice(i, 1)
                    return true;
                }
            }
            return false;
        },
        delete_onlineCode(c: Code) : boolean {
            for (let i = 0; i<this.codes.length; i++) {
                if (this.codes[i].uuid == c.uuid) {
                    this.codes.splice(i, 1)
                    return true;
                }
            }
            return false
        }
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
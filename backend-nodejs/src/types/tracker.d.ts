export interface Station {
    rec_id?: number,
    name: string,
    uuid: string,
    prev_station?: number,
    distance_m?: number,
    position?: string
}

export interface Code {
    rec_id?: number,
    qr: string,
    active: number
}

export interface Scanner {
    rec_id?: number,
    stamp: string,
    uuid: string,
    name?: string
}

export interface Checkin {
    rec_id?: number,
    code_id: number,
    station_id: number,
    scanner_id: number,
    stamp?: string
}

export interface SendWalker {
    firstname: string;
    lastname: string;
    class: string;
    uuid: string;
}
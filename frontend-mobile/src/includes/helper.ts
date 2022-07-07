import { alertController } from '@ionic/vue';
import type { Code, OfflineCode } from '@/stores/offlineStore'

export function notNull(obj: any) : boolean {
    return (
        obj && 
        obj != null &&
        obj !== null &&
        obj != 'null' &&
        obj !== 'null' &&
        typeof obj != 'undefined'
    )
}

export function isNull(obj: any) : obj is null {
    return !notNull(obj)
}

export function isCode(c: Code | OfflineCode) : c is Code {
    const keys = Object.keys(c);
    return keys.includes("firstname") && keys.includes("lastname")
} 

export function dateToSqliteTimestamp(date: Date) : string {
    // TODO
    return date.toISOString();
}

export async function was_alert(
    message: string, 
    header: string = "Info",
    btn: string  = "OK"
) {
    const al = await alertController.create({
        cssClass: 'was_alert',
        header,
        message,
        buttons: [btn],
    })
    return await al.present();
}

export async function was_confirm(
    message: string,
    header: string,
    btn: string[],
    btnCss: string[] = ["", ""]
) {
    const al = await alertController.create({
        cssClass: 'was_confirm',
        header,
        message,
        buttons: [
            {
                text: btn[1],
                role: 'cancel',
                cssClass: btnCss[1],
                id: 'was_confirm_cancel'
            },
            {
                text: btn[0],
                role: 'ok',
                cssClass: btnCss[0],
                id: 'was_confirm_ok'                
            }
        ]
    });
    await al.present();
    const { role } = await al.onDidDismiss();
    if ( role == "ok" ) return true;
    else if ( role == "cancel" ) return false;
}

export enum Course {
    DE = "DE", // Deutsch
    MA = "MA", // Mathe
    EN = "EN", // Englisch
    PA = "PA" // Paedagogik
}
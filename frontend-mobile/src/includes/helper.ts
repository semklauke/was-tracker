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
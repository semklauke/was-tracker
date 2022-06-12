export function isNull(obj: any) : obj is null {
    return (
        obj && 
        obj != null &&
        obj !== null &&
        obj != 'null' &&
        obj !== 'null' &&
        typeof obj != 'undefined'
    )
}
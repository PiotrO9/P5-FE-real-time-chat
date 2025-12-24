export function compareIds(
    id1: string | number,
    id2: string | number,
): boolean {
    return String(id1) === String(id2);
}

export function findById<T extends { id: string | number }>(
    items: T[],
    id: string | number,
): T | undefined {
    return items.find((item) => compareIds(item.id, id));
}

export function findIndexById<T extends { id: string | number }>(
    items: T[],
    id: string | number,
): number {
    return items.findIndex((item) => compareIds(item.id, id));
}

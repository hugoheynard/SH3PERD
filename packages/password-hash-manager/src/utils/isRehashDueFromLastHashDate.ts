export const isRehashDueFromLastHashDate = (input: { lastHashDate: string; rehashAfterDays: number }): boolean => {
    const { lastHashDate, rehashAfterDays } = input;

    const parsedDate = new Date(lastHashDate);
    const now = new Date();
    const diffMs = now.getTime() - parsedDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= rehashAfterDays;
};
export const sortEventsArrayPerAscendingTime = (array: any[]): any[] => { //TODO type event[]
    try {
        if (!array || !array.length) {
            return array;
        }

        return [...array].sort((a, b) => {
            return a.date.getTime() - b.date.getTime();
        });

    } catch (error: any) {
        console.error("Error while sorting planningBlocks", error.message);
        return array;
    }
};
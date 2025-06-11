export const sortEventsArrayPerAscendingTime = (array) => {
    try {
        if (!array || !array.length) {
            return array;
        }
        return [...array].sort((a, b) => {
            return a.date.getTime() - b.date.getTime();
        });
    }
    catch (error) {
        console.error("Error while sorting planningBlocks", error.message);
        return array;
    }
};
//# sourceMappingURL=sortEventsArrayPerAscendingTime.js.map
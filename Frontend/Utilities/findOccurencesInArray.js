const findOccurrencesInArray = (array) => {
    //outputs an object with pairs of {unique value: occurrences}
    return array.reduce((acc, curr) => (acc[curr] = -~(acc[curr]), acc), {});
};

export {findOccurrencesInArray};
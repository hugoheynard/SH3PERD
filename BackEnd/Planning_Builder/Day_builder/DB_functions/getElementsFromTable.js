const getElementsFromTable = (date, table) => {

    return table.filter(element => element.date.getFullYear() === date.getFullYear())
        .filter(element => element.date.getMonth() === date.getMonth())
        .filter(element => element.date.getDate() === date.getDate());

};

export {getElementsFromTable};
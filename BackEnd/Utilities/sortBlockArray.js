const sortBlockArrayPerTime = array => {

    return array.sort((a, b) => {

        // if same hour, compare minutes
        if (a.date.getHours() - b.date.getHours()) {

            return a.date.getHours() - b.date.getHours();
        }

        return a.date.getMinutes() - b.date.getMinutes();

    });
};


export {sortBlockArrayPerTime};
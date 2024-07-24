
class Filter_Block {
    constructor(parent) {




    }

}



//returns a list of all the block types needed for the time interval chosen

const getBlockFilterList = (arrayOfDays, index) => {

    const blockFilterList = [];

    // Generates the list of blocks
    for (const day of arrayOfDays) {



    }


    table.getDaysList().forEach(day => {

        table.getBlockList(day).forEach(block => {

            if(!blockFilterList.includes(block)) {

                blockFilterList.push(block);

            }

        });

    });

    return blockFilterList;
}

export {getBlockFilterList};
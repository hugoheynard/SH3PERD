const allMembersInBlockList = arrayOfBlocks => {

    const membersInBlocks = [];

    arrayOfBlocks.forEach(block => {

        //get all the members
        block.staff.forEach(member => {

            if(!membersInBlocks.includes(member)) {

                membersInBlocks.push(member);

            }

        });
    });

    return membersInBlocks;

};

export {allMembersInBlockList};
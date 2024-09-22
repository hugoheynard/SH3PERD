const staffConfigAllowsPerformance = (showObj, dayObj) => {

    return showObj.membersConfigurations.some(conf => {

        return conf.staff.every(staffMember => {

            return dayObj.staff.includes(staffMember);

        });

    });

};

export {staffConfigAllowsPerformance};


//test
const dayObj = {staff: ['hugo', 'alain', 'sophie', 'bernard']};

const showObj = {
    membersConfigurations: [
        {name:"config1", staff:['hugo', 'alain', 'sophie']},
        {name:"config2", staff:['hugo', 'alain']}
    ]}

console.log(staffConfigAllowsPerformance(showObj, dayObj));
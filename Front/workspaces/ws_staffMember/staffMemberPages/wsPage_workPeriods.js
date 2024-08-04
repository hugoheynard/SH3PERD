import {HTMLelem} from "../../../Classes/HTMLClasses/class_HTMLelem.js";


const mockupData = [
    {
        id: 1,
        contractType: 'resident', //temp event guest
        location: 'La Folie Douce Les Arcs',
        startDate: new Date(Date.now()),
        endDate: new Date(Date.now())
    },
    {
        id: 2,
        contractType: 'residency', //temp event guest
        location: 'La Folie Douce Les Arcs',
        startDate: new Date(Date.now()),
        endDate: new Date(Date.now())
    },
]

const wsPage_workPeriods = () => {
    const workPeriodsPage = new HTMLelem('div', 'workPeriodPage', '').render();

    for (const contract of mockupData) {

        const period = new HTMLelem('div', '', 'workPeriod');

        const yearBox = new HTMLelem('div', '', 'yearBox');
        yearBox.setText(`${2024}`);
        yearBox.isChildOf(period)

        const dataBox = new HTMLelem('div', '', 'dataBox').render()


        const dataLine = new HTMLelem('div', '', 'dataLine');
        dataLine.isChildOf(period)

        const locationData = new HTMLelem('span', '', 'elemData');
        locationData.setText(`${contract.location}`)
        locationData.isChildOf(dataLine)

        const type = new HTMLelem('span', '', 'elemData');
        type.setText(contract.type)
        type.isChildOf(dataLine)

        const date = new HTMLelem('span', '', 'elemData');
        date.setText(`
        ${contract.startDate.getFullYear()}-${contract.startDate.getMonth()}-${contract.startDate.getDay()} 
        :
        ${contract.startDate.getFullYear()}-${contract.startDate.getMonth()}-${contract.startDate.getDay()}`)
        date.isChildOf(dataLine)


        const completionBox = new HTMLelem('div', '', 'completionBox')
        completionBox.setText(`${100}%`);
        completionBox.isChildOf(period)

        workPeriodsPage.appendChild(period.render())
    }

    return workPeriodsPage
};

export {wsPage_workPeriods};
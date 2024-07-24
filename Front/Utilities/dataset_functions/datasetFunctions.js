const STEPDURATION = 5;

const getPositionFromDataset_Date = data => {

    const date = new Date(data);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return Number((hours * 60 + minutes) / STEPDURATION);

}


const getRowEndFromDatasetDuration = dataDuration => {

    return Number(dataDuration) / STEPDURATION;
}


export {getPositionFromDataset_Date, getRowEndFromDatasetDuration}









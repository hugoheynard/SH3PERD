import {DateMethod} from "../../../../../BackEnd/Utilities/class_DateMethods.js";

const addTime = (block) => {

    const date = new Date(block.date);

    const elemTime = document.createElement('span');
    const timeContent = document.createTextNode(`${DateMethod.standardizeTime(date.getHours())}:${DateMethod.standardizeTime(date.getMinutes())}`);

    elemTime.appendChild(timeContent);

    return elemTime;

};

const addBlockTitle = (block) => {

    if(!block.content) {

        //CREATES TITLE FROM BLOCKTYPE
        const content = document.createElement('span');
        const textNode = document.createTextNode(block.type);
        content.appendChild(textNode);
        return content

    }

    //CREATES TITLE FROM CONTENT
    const title = document.createElement('span');
    const textNode = document.createTextNode(block.content.title);
    title.appendChild(textNode);
    return title;


};

/*
/CREATES DESCRIPTION FROM CONTENT

const descList = document.createElement('ol');
descList.setAttribute('class', 'blockContentDescription');

block.content.description.forEach(descContent => {

    const description = document.createElement('li');

    description.innerHTML += descContent;

    descList.appendChild(description)

});

parent.appendChild(descList);
* */



export {addTime, addBlockTitle};


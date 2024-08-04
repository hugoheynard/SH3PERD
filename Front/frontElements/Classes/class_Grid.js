import {dragLeave, dragOver, drop} from "../../Utilities/DragNDropFunctions/dragAndDrop.js";

class Grid {

    constructor(cols = 1, rows = 1, id, containerId) {

        this.cols = cols;
        this.rows = rows;
        this.id = id;
        this.containerId = containerId;
        this.grid = document.createElement('div');

        this.createGrid(id);
        this.createGridElements();
        this.assignGridToContainer(containerId);

    }
    createGrid(id) {

        this.grid.setAttribute('id', id);

        this.grid.style.display = "grid";
        this.grid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        this.grid.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

    }

    createGridElements() {

        for (let row = 1; row <= this.rows; row++) {

            for (let col = 1; col <= this.cols; col++) {

                const gridElement = document.createElement('div');
                gridElement.setAttribute('id', `${col}_${row}`);
                //gridElement.appendChild(document.createTextNode(`${col}_${row}`))

                this.grid.appendChild(gridElement);

            }

        }

    }

    addDragAndDropReceiverEvents() {
        const gridElementsArray = Array.from(this.grid.querySelectorAll('div'));

        for (const element of gridElementsArray) {

            element.addEventListener('dragover', dragOver);
            element.addEventListener('dragleave', dragLeave);
            element.addEventListener('drop', drop);
        }
    }

    assignGridToContainer(containerID) {

        const container = document.getElementById(containerID);
        container.appendChild(this.grid);

    }

    addContent(array) {
        const gridElementsArray = Array.from(this.grid.querySelectorAll('div'));

        for (const element of gridElementsArray) {

            const index= gridElementsArray.indexOf(element);

            element.appendChild(document.createTextNode(array[index]));

        }

    }
}

export {Grid};
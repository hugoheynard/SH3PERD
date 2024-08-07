import {getPositionFromDataset_Date, getRowEndFromDatasetDuration} from "../../../../Utilities/dataset_functions/datasetFunctions.js";
import {addBlockTitle, addTime} from "./addBlockContent.js";

class GridBlock {

    constructor(blockObject, negativeOffset = 0) {

        this.blockObject = blockObject;
        this.negativeOffset = negativeOffset;

        this.block = (() => {
            const block = document.createElement('div');
            block.setAttribute('class', 'block color');
            return block;
        })();

        this.blockResume = (()=> {
            const blockResume = document.createElement('div');
            blockResume.setAttribute('class', 'block_resume');
            return blockResume;
        })();

        //creates a dataset
        for (const key in blockObject) {
            this.block.dataset[key] = blockObject[key];
        }

        this.rowStart = getPositionFromDataset_Date(this.block.dataset.date);
        this.span = getRowEndFromDatasetDuration(this.block.dataset.duration);

    }

    addBlockResume() {
        this.blockResume.appendChild(addTime(this.blockObject));
        this.blockResume.appendChild(addBlockTitle(this.blockObject));

        this.block.appendChild(this.blockResume);
    };

    squaredMiniBlock(width) {
        //we get the height of a row in the grid and insert it as width of this block;
        this.block.style.width = width;

    }

    resizeListener() {
        class ResizeController {
            constructor(block) {
                this.block = block;
                this.addResizeObserver();
            }

            addResizeObserver() {
                const resizeObserver = new ResizeObserver((entries) => {
                    for (let entry of entries) {
                        console.log('Element resized:', entry.target);
                        console.log('x', entry.contentRect.height);
                        // Your resize logic here
                    }
                });

                // Start observing the target element
                resizeObserver.observe(this.block);
            }
        }

        const resizeController = new ResizeController(this.block);
    }

    renderBlock() {
        //resetBlock
        this.block.innerHTML = '';

        //define position
        this.block.style.gridRowStart = (this.rowStart - this.negativeOffset).toString();
        this.block.style.gridRowEnd = (this.rowStart - this.negativeOffset + this.span).toString();

        //addContent
        this.addBlockResume();

        //resizertest//TODO: RESIZER
        //this.resizeListener();

        //return element gridBlock
        return this.block;
    };

}

export {GridBlock};
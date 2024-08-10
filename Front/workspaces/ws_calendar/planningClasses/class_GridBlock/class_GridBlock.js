import {addBlockTitle, addTime} from "./addBlockContent.js";
import {HTMLelem} from "../../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {dragOver, dragStart} from "../../../../Utilities/DragNDropFunctions/dragAndDrop.js";

class GridBlock {

    constructor(input) {
        this._blockData = input.blockData;

        this.block = new HTMLelem('div', undefined, 'block color').render();
        this.block.setAttribute('draggable', true);
        this.blockResume = new HTMLelem('div', undefined, 'block_resume').render();

        this.addBlockTypeInDataset();
    };

    get blockData(){
        return this._blockData;
    };

    addBlockTypeInDataset() {
        this.block.dataset.type = this.blockData.type;
    };

    addBlockResume() {
        this.blockResume.appendChild(addTime(this.blockData));
        this.blockResume.appendChild(addBlockTitle(this.blockData));

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
        this.block.innerHTML = '';

        //this.block.addEventListener('dragover', dragOver)
        //this.block.addEventListener('dragover', dragStart)

        //addContent
        this.addBlockResume();

        //resizertest//TODO: RESIZER
        //this.resizeListener();

        //return element gridBlock
        return this.block;
    };

}

export {GridBlock};
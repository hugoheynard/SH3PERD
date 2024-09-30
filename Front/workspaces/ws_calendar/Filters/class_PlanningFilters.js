import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";


class PlanningFilters {

    constructor(view) {
        this._view = view;
        this.filterList = [];
        this.filterContainer = new HTMLelem('div', 'filters').render();

        this.generateFilters();
    };

    get view() {
        return this._view;
    };

    getFilterTypeArray() {
        //identify the needed filters linked to the current view
        const filterArray = [];

        for (const planning of this.view.planningList) {

            for (const type of planning.artistBlockList.map(block => block.type)) {

                if (!filterArray.includes(type)) {
                    filterArray.push(type);
                }
            }
        }

        return filterArray;
    };

    buildLabel(blockType) {
        const label = new HTMLelem('div', undefined, 'filterLabel');
        label.setAttributes({'htmlFor': blockType});
        label.setText(blockType);
        return label.render();
    };

    buildCheckbox(blockType) {
        const checkbox = new HTMLelem('input', blockType, 'filterCheckbox');
        checkbox.setAttributes({
            'type': 'checkbox',
            'name': blockType,
            'checked': true
        });
        return checkbox.render();
    };

    generateFilters() {
        this.filterContainer.innerHTML = '';

        //generates the filters
        for (const blockType of this.getFilterTypeArray()) {

            const filter = new HTMLelem('div', undefined, 'filterDiv').render();
            const checkbox = this.buildCheckbox(blockType);
            filter.appendChild(checkbox);
            filter.appendChild(this.buildLabel(blockType));

            //add Event listener
            checkbox.addEventListener('change', () => {

                const documentsBlock = document.querySelectorAll(`[data-type=${blockType}]`);

                if (checkbox.checked) {

                    for (const block of documentsBlock) {
                        block.style.display = "block";
                    }

                } else {

                    for (const block of documentsBlock) {
                        block.style.display = "none";
                    }

                }
            });
            this.filterList.push(filter);
            this.filterContainer.appendChild(filter);
        }
    };

    render() {
        return this.filterContainer;
    };
}

export {PlanningFilters};
const colorGenerator_ColumnCells = (category, r, g, b, colNumber, subCatNumber) => {
    // we start with a base (dark preferred) color and generate a gradient depending of the divider
    // we export an object with pairs {css_class: rgba cell color)

    const oneOrLess = num => num <= 1;
    const isOne = num => num === 1;
    const zero = num => num === 0;

    const MAX_OPACITY = 1;
    const MIN_OPACITY = 0.4;
    const FIRST_COLUMN = 1;
    const divider = colNumber - FIRST_COLUMN;

    const obj = {};

    const generateColorColumns = (r, g, b, max_opacity, min_opacity) => {
        // we find the decrement per iteration
        const substractor = Math.round((max_opacity - min_opacity) / divider * 100) /100 ;

        // generates the pairs with the opacity decrement
        for (let i = 1; i <= colNumber; i++) {
            if (isOne(i)) {
                obj["columnColor"] = {};
                obj["columnColor"][category +`_${i}`] = `rgba(${r},${g},${b},${max_opacity})`;
            } else {
                let opacity = max_opacity - Math.round(substractor * (i - FIRST_COLUMN) * 100) / 100;
                obj["columnColor"][category +`_${i}`] = `rgba(${r},${g},${b},${opacity})`;
            }
        }
    }

    const generateColorCategory = (r, g, b, max_opacity) => {
        // the gradient starts from the darkest to the lightest nuance generated
        if (isOne(colNumber)) {

            obj["colorCategory"] = `rgba(${r},${g},${b},${max_opacity})`;

        } else {

            obj["colorCategory"] = `linear-gradient(0.25turn, ${Object.values(obj.columnColor)[0]}, ${Object.values(obj.columnColor).at(-1)})`;

        }
    }

    const generateColorSubCategories = (r, g, b, max_opacity) => {

        obj["colorSubCategories"] = `rgba(${r},${g},${b},${max_opacity})`;

    }

    try {

        if (zero(colNumber)) {

            throw new Error('Column number must be > 0');

        } else {

            generateColorColumns(r, g, b, MAX_OPACITY, MIN_OPACITY);
            generateColorCategory(r, g, b, MAX_OPACITY);
            generateColorSubCategories(r, g, b, MAX_OPACITY);

        }

    } catch (e) {

        console.error(e.message);

    }

    return obj;
}

export {colorGenerator_ColumnCells}
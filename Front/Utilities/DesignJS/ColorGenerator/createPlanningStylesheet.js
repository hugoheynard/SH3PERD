import {colorGenerator_ColumnCells} from "./ColorCSSClassesGenerator.js";

const generateCssColors  = (colorScheme, staffPoolArray) => {

    const colorContent = {};

    const existsInPool = (key, array) => array.filter(element => element.category === key).length > 0;

    for (const cat in colorScheme) {

        if (existsInPool(cat, staffPoolArray)) {

            // find length of cat
            const catColFilter = staffPoolArray.filter(staffMember => staffMember.category === cat);

            // find number of subCats
            const subCatArray = [];

            catColFilter.forEach(input => {

                if (!subCatArray.includes(input.subCategory)) {

                    subCatArray.push(input.subCategory)

                }

            });

            //generate the nuances of color
            colorContent[cat] = colorGenerator_ColumnCells(cat, colorScheme[cat].r, colorScheme[cat].g, colorScheme[cat].b, catColFilter.length, subCatArray.length);
        }
    }


    return colorContent;
}

export {generateCssColors};
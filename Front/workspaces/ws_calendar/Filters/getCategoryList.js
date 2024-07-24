const getCategoryList = (array) => {

    const categoryList = [];

    array.forEach(element => {

        if(!categoryList.includes(element.category)) {

            categoryList.push(element.category);
        }

    });

    return categoryList;

};

export {getCategoryList};
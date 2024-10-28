export class StaffSortingAlgorithms{
    sortByHierarchy(input) {
        const { users, customOrder } = input;

        return users.sort((a, b) => {

            //1 -> service
            const serviceOrderA = customOrder[a.functions.service]
                ?.order || Infinity;
            const serviceOrderB = customOrder[b.functions.service]
                ?.order || Infinity;

            if (serviceOrderA !== serviceOrderB) {
                return serviceOrderA - serviceOrderB;
            }

            //2 -> category
            const categoryOrderA = customOrder[a.functions.service]
                ?.categories[a.functions.category]
                ?.order || Infinity;
            const categoryOrderB = customOrder[b.functions.service]
                ?.categories[b.functions.category]
                ?.order || Infinity;

            if (categoryOrderA !== categoryOrderB) {
                return categoryOrderA - categoryOrderB;
            }

            //3 -> subCategory
            const subCategoryOrderA = customOrder[a.functions.service]
                ?.categories[a.functions.category]
                ?.subCategories[a.functions.subCategory] || Infinity;
            const subCategoryOrderB = customOrder[b.functions.service]
                ?.categories[b.functions.category]
                ?.subCategories[b.functions.subCategory] || Infinity;

            if (subCategoryOrderA !== subCategoryOrderB) {
                return subCategoryOrderA - subCategoryOrderB;
            }

            //4 -> last and firstname
            if (a.lastName < b.lastName) {
                return -1;
            }

            if (a.lastName > b.lastName) {
                return 1;
            }


            if (a.firstName < b.firstName) {
                return -1;
            }

            if (a.firstName > b.firstName) {
                return 1;
            }

            return 0;
        });
    }

}
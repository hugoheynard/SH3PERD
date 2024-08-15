class ColorScheme {

    static defaultColor = 'rgba(40,66,94,1)';

    constructor() {

    };

    getColorData() {
        this.colorScheme = {
            default: 'rgba(40,66,94,1)',
            block: {
                getIn: {
                    backgroundColor: 'rgba(255, 32, 78, 0.2)',
                    borderColor: 'rgba(255, 32, 78, 1)',
                    textColor: 'rgba(255, 32, 78, 0.9)',
                },
            },
            category: {
                dj: 'rgba(53,77,103,1)',
                musician: 'rgba(60,112,77,1)',
                dancer: 'rgba(110,61,61,1)',
                singer: 'rgba(171,110,220,1)',
                others: '',
            },
            subCategory: {
                saxo: 'rgb(52,100,47)',
                guit: 'rgb(102,176,78)',
                cabaret: 'rgb(180,65,65)',
                aerial: 'rgba(194,121,121,1)',
                club: 'rgb(154,76,164)'
            },
            artist: {
                1: 'rgba(37,66,96,1)',
                2: 'rgba(75,114,154,1)',
                3: 'rgba(117,155,196,1)',
                4: 'rgba(64,108,40,1)',
                5: 'rgba(97,178,123,1)',
                6: 'rgba(121,47,47,1)',
                7: 'rgba(140,58,58,1)',
                8: 'rgba(173,76,76,1)',
                9: 'rgba(140,58,58,1)',
                10: 'rgba(213,120,120,1)',
                11: 'rgba(210,120,213,1)',
                12: 'rgba(210,120,213,1)',
                13: 'rgba(210,120,213,1)',
            }
        }

        return this
    };



    artistCategory(input) {
        return this.colorScheme.category[input.artistCategory] ?? ColorScheme.defaultColor;
    };
    artistSubCategory(input) {
        return this.colorScheme.subCategory[input.artistSubCategory];
    };
    artist(input) {
       return this.colorScheme.artist[input.artistID];
    };



}



export {ColorScheme};
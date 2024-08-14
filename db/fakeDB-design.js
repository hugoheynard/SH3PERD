class ColorScheme {

    static defaultColor = '#28425e';

    static async populateScheme() {
        this._colorScheme = {
            default: '#28425e',
            block: {
                getIn: {
                    backgroundColor: 'rgba(255, 32, 78, 0.2)',
                    borderColor: 'rgba(255, 32, 78, 1)',
                    textColor: 'rgba(255, 32, 78, 0.9)',
                },
            },
            category: {
                dj: '#05264a',
                musician: '',
                dancer: '',
                singer: '',
                others: '',
            },
            subCategory: {
                cabaret: '',
                aerial: '',

            },
            artist: {}
        }
    }

    get colorScheme() {
        return this._colorScheme;
    };
    set colorScheme(value) {
        this._colorScheme = value;
    };


    artistCategory(artistCategory) {
        return this.colorScheme.category[artistCategory] ?? ColorScheme.defaultColor;
    };
    artistSubCategory(artistSubCategory) {
        return this.colorScheme.category[artistSubCategory] ?? ColorScheme.defaultColor;
    };
    artistID(artistID) {
      return this.colorScheme.artist[artistID] ?? ColorScheme.defaultColor;
    };


}



export {ColorScheme};
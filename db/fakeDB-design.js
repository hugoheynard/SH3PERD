const catColors = {
    "dj": {
        r: 0,
        g: 34,
        b: 77
    },
    "musician": {
        r: 5,
        g: 146,
        b: 18
    },
    "dancer": {
        r: 160,
        g: 21,
        b: 62
    },
    "singer": {
        r: 255,
        g: 64,
        b: 125
    },
    "others": {
        r: 115,
        g: 98,
        b: 11
    }
}

const getColorScheme = () => {

    return catColors;

}


export {getColorScheme};
export default {
    presets: [
        [
            "@babel/preset-env",
            {
                targets: {
                    node: "current",
                },
                modules: false,
            },
        ],
    ],
    plugins: [
        "@babel/plugin-transform-class-properties",
        "@babel/plugin-transform-private-methods",
    ],
};
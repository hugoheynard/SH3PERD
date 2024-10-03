export default  {
    presets: ['@babel/preset-env', { targets: { node: 'current' } }],
    plugins: [
        "@babel/plugin-transform-private-methods",
        "@babel/plugin-transform-class-properties"
    ]
};
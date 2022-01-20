const path = require("path");
const copyplugin = require("copy-webpack-plugin");

module.exports = {
    mode: "production",
    entry: {
        index: "./src/app/js/index.js",
        watch: "./src/app/js/watch.js"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new copyplugin({
            patterns: [
                { from: "./src/app/css", to: "css" },
                { from: "./src/app/index.html", to: "" },
                { from: "./src/app/watch.html", to: "" }
            ],
        })
    ]
};

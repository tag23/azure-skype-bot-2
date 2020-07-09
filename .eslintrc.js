/* eslint-disable */
module.exports = {
    "extends": "eslint:recommended",
    "rules": {    
        "semi": [2, "always"],
        "indent": [2, 4],
        "no-return-await": 0,
        "space-before-function-paren": [2, {
            "named": "never",
            "anonymous": "never",
            "asyncArrow": "always"
        }],
        "template-curly-spacing": [2, "always"]
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "env": {
        "node": true,
        "es6": true
    },
    "parser": "babel-eslint"
};
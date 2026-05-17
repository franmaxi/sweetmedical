export default {
    {
        ignores: ["node_modules/**", "index.js","funcions.js"],

    }

    languageOptions: {
        parserOptions: {
            ecmaVersion: 2024,
            sourceType: "module",
            globals: {
                console: "readonly",
                process: "readonly",
            },
        },
    },
    rules: {
        "no-unused-vars": "warn",
        "no-console": "off",
        "no-undef": "error",
    }

}
import antfu from "@antfu/eslint-config";

export default antfu(
    {
        type: "app",
        typescript: true,
        formatters: true,
        stylistic: {
            indent: 4,
            semi: true,
            quotes: "double",
        },
        ignores: ["**/migrations/*"],
    },
    {
        rules: {
            "antfu/no-top-level-await": ["off"],
            "node/prefer-global/process": ["off"],
            "node/no-process-env": ["error"],
            "perfectionist/sort-imports": [
                "error",
                {
                    internalPattern: ["@/**"],
                },
            ],
            "unicorn/filename-case": [
                "error",
                {
                    case: "kebabCase",
                    ignore: ["README.md"],
                },
            ],
        },
    },
);

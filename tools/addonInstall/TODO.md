When the user runs `npx rwsdk-tools addon install`, we should:

1. Take the ./installAddon.mjs file and copy it into the project's `src/scripts` directory.

2. Add a script to the project's `package.json` file to run the installAddon.mjs file

```json
"scripts": {
    "addon:install": "node src/scripts/installAddon.mjs"
}
```


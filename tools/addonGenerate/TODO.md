When the user runs `npx rwsdk-tools addon generate`, we should:

1. Take the ./generateAddonConfig.mjs file and copy it into the project's `src/scripts` directory.

2. Add a script to the project's `package.json` file to run the generateAddonConfig.mjs file

```json
"scripts": {
    "addon:generate": "node src/scripts/generateAddonConfig.mjs"
}
```


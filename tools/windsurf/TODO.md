When the user runs `npx rwsdk-tools windsurf`, we should:

1. Create a `.windsurf` folder in the root of the user's directory (if it doesn't already exist

2. Copy the contents of `tools/windsurf/rules` and `tools/windsurf/workflows` to the user's `.windsurf` folder.

- If the `.windsurf/rules` folder already exists, don't overwrite, but you can still copy all the files into the existing folder.

- If the `.windsurf/workflows` folder already exists, don't overwrite, but you can still copy all the files into the existing folder.

3. Display a success message for the user
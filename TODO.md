- [x] Remove the current "GRAFTTHIS INSTALLER". If you run `npx graftthis` it should install all the tools.

- [x] Add a command line for generating routes
      When you run the command `npx graftthis routes` it should put the `generateRoutes.ts` file in the `src/other` directory of the project and add the `routes` script to the `package.json` file of the project.

- [x] Add a command for working with components
      I added this tool inside the tools/componentGenerator directory.
      When you run the command `npx graftthis component` it should: - prompt the user to install and run `pnpm install -D plop` if plop is not already installed. - put the `plopfile.mjs` file in the root of the project. - add the following to the `scripts` section of the project's package.json file:

        ```json
          "scripts" : {
            ...
            "plop": "plop",
            "component": "plop component",
            "restructure": "plop restructure",
            "restructure-all": "plop restructure-all"
          }
        ```

- [ ] Add a command for adding shadcn/ui

- [ ] Add a CHANGELOG
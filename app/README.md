# Next GEN App

> Deliver ULS

## Table of Contents

- [Gneral Information](#general-information)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Acknowledgements](#acknowledgements)

## General Information

- The NextGen thoughtcastowners shall be composed of the following Software Services. These are all logical divisions, actual deployment and bundling are determined by the specific deployment model.

- What problem does it (intend to) solve?
- What is the purpose of your project?

## Technologies Used

- Next.js
- Typescript
- Playwright Test

## Installation

### Initialize node_modules

```bash
> npm install --global yarn react-scripts
> yarn
```

## Rules of Engagement

- Commit to feature branches of form `feature/<JIRA_TICKET_ID>_<name>` or `bugfix/<JIRA_TICKET_ID>_<name>`
- Rebase against `develop` regularly (`git rebase develop`)
- Rebase and Squash against `main` before submitting pull-requests against `main` (`git rebase -i main`)

Direct pushes into `main` should be avoided and will be disallowed in future

### Precommit Hook

- Initialize precommit hook through a command `yarn pre-commit`, this will facilitate ESLint check / Prettier code format while building a new commit

## Start the development server

Start the development server:

```bash
> yarn start
```

### Development Mode

The `proxy` parameter is configured in `packages.json` to redirect all undefined routes to `http://localhost:5000`. This is how the `/api` and `/auth` routes are directed in development.

```bash
> yarn dev
```

### E2E test

We are using [Playwright](https://playwright.dev/) to facilitate the end-to-end test for the Next Gen app. The tests will be run on all 3 browsers, chromium, firefox and webkit using 3 workers.
Alternatively you can also get started and run your tests using the [VS Code Extension](https://playwright.dev/docs/getting-started-vscode).

#### Run e2e test

```bash
> yarn test:e2e
```

#### Show e2e test report

```bash
> yarn test:report
```

### E2E test

**Note:** Add `// @ts-check` at the start of each test file when using JavaScript in VS Code to get automatic type checking.

## Acknowledgements

- This project has wrote by Next.js. For more information, visit [here](https://nextjs.org/docs)
- How to wright test in Playwright?
  Please simply visit [here](https://playwright.dev/docs/writing-tests)

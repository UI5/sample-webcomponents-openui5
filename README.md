[![REUSE status](https://api.reuse.software/badge/github.com/UI5/sample-webcomponents-openui5)](https://api.reuse.software/info/github.com/UI5/sample-webcomponents-openui5)

# sample-webcomponents-openui5

## About this project

Reference app for using UI5 Web Components in OpenUI5/SAPUI5 as first-class citizen within OpenUI5/SAPUI5 programming model

A Todo application built with the **OpenUI5/SAPUI5 programming model** consuming **[UI5 Web Components](https://github.com/UI5/webcomponents)**.

It is the OpenUI5/SAPUI5 counterpart of the existing framework samples and is feature-identical to them:

- [React sample](https://github.com/UI5/sample-webcomponents-react)
- [Angular sample](https://github.com/UI5/sample-webcomponents-angular)
- [Vue sample](https://github.com/UI5/sample-webcomponents-vue)

![Todo app](webapp/img/logo.png)

## Features

- Add a todo (text + deadline) via **Input**, **DatePicker** and an **Emphasized Button**
- Two **Panels** — *Incompleted Tasks* and *Completed Tasks* — populated from a JSON model and kept in sync with a `done` flag
- Mark items done / not-done by selecting them in the multi-selection **List** (an item selected in *Incompleted* moves to *Completed*, and vice-versa)
- **Edit** and **Delete** actions per item; editing opens a **Dialog** (TextArea + DatePicker)
- **ShellBar** with a logo, a theme-switcher **Popover** (Horizon / Quartz, incl. high-contrast variants) and a profile **Popover**
- Profile popover opens **Settings** and **Help** dialogs
- **RTL** toggle and **compact content density** toggle in Settings

## Requirements and Setup

### Requirements

- [Node.js](https://nodejs.org/) — `^20.19.0` or `>=22.12.0`
- npm (bundled with Node.js)

The [UI5 CLI](https://sap.github.io/ui5-tooling/) and all tooling are installed locally as dev dependencies — no global install needed.

### Getting started

```sh
npm install
npm start
```

`npm start` runs `ui5 serve` and opens the app in your browser. To build a self-contained production bundle into `dist/`:

```sh
npm run build
```

To type-check the TypeScript sources without emitting:

```sh
npm run ts-typecheck
```

## How the integration works

UI5 Web Components are consumed exactly the way the official documentation describes in [Using Web Components](https://sdk.openui5.org/#/topic/1c80793df5bb424091954697fc0b2828?q=Using%20Web%20Components).

### 1. Tooling (`ui5.yaml`)

Two UI5 CLI extensions do the work, at both dev-server and build time:

- **[`ui5-tooling-transpile`](https://www.npmjs.com/package/ui5-tooling-transpile)** — transpiles the TypeScript sources (`.ts`) to JavaScript. Plain `ui5 serve` does **not** transpile TypeScript, so this middleware/task is required.
- **[`ui5-tooling-modules`](https://www.npmjs.com/package/ui5-tooling-modules)** — resolves and bundles the `@ui5/webcomponents-*` npm packages, generates a **SAPUI5 control wrapper** for each Web Component, and (via `includeAssets`) registers each package's theme parameters and translations.

The transpile step runs **before** the modules step.

### 2. Using the components in the XML view

Web Components are declared as **XML nodes** using a namespace per package. The namespaces must include the `/dist` path:

```xml
<mvc:View
    xmlns:webc="@ui5/webcomponents/dist"
    xmlns:fiori="@ui5/webcomponents-fiori/dist">

    <webc:Button design="Emphasized" text="Add Todo" click=".onAdd" />

    <fiori:ShellBar primaryTitle="..." profileClick=".onProfileClick">
        <!-- Slots are expressed as aggregation wrapper elements, NOT slot="..." -->
        <fiori:profile>
            <webc:Avatar initials="JD" />
        </fiori:profile>
        <fiori:logo>
            <Image src="./img/logo.png" />
        </fiori:logo>
    </fiori:ShellBar>
</mvc:View>
```

Key rules (they differ from the framework samples):

- **Properties** map to control properties (e.g. `design`, `headerText`).
- **Slots** are expressed as **aggregation wrapper elements** (`<fiori:profile>…</fiori:profile>`), *not* an HTML `slot="profile"` attribute. The default slot is plain nesting (e.g. `List` → `ListItemStandard`).
- **Events** map to SAPUI5 event handlers (`profile-click` → `profileClick=".onHandler"`).

### 3. Using the components in the controller

Because each Web Component is a generated **SAPUI5 control wrapper**, the controller uses standard UI5 accessors — **not** the raw DOM API:

```ts
// read/write values via getters/setters
input.getValue();  input.setValue("");

// open dialogs/popovers via setOpen
this.byId("editDialog").setOpen(true);

// read event data via getParameter
const selected = event.getParameter("selectedItems");

// map a list item back to its model row via the binding context
const id = event.getSource().getBindingContext().getProperty("id");
```

### 4. Bootstrap

`webapp/index.html` boots via `sap/ui/core/ComponentSupport`, and `webapp/Component.ts` sets up the JSON model with the initial todos. The Web Components themselves are pulled in through the XML namespaces + `ui5-tooling-modules` — there is no manual per-component `import` list.

## Project structure

```
webapp/
├── index.html                     # bootstraps OpenUI5 (ComponentSupport)
├── Component.ts                   # UIComponent + the todo JSON model
├── manifest.json                  # app descriptor (i18n model, rootView)
├── controller/App.controller.ts   # all todo behaviors (UI5 accessors)
├── view/App.view.xml              # the full UI (Web Components as XML nodes)
├── css/style.css
├── i18n/i18n.properties
├── img/logo.png
└── favicon.ico
ui5.yaml                           # ui5-tooling-transpile + ui5-tooling-modules
tsconfig.json
```

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/UI5/sample-webcomponents-openui5/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Security / Disclosure
If you find any bug that may be a security problem, please follow our instructions at [in our security policy](https://github.com/UI5/sample-webcomponents-openui5/security/policy) on how to report it. Please do not create GitHub issues for security-related doubts or problems.

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/SAP/.github/blob/main/CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2026 SAP SE or an SAP affiliate company and sample-webcomponents-openui5 contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/UI5/sample-webcomponents-openui5).

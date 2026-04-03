# Flowable Angular Standalone Portal

This application is a lightweight Angular portal for working with Flowable tasks and process start forms. It provides a simple UI for browsing available work, opening a task or process form, and submitting outcomes back to a Flowable backend.

## Features

- Displays available tasks from the Flowable backend.
- Displays available process definitions that can be started from the portal.
- Supports searching tasks and processes from the side menu.
- Opens task forms by route at `/task/:taskId`.
- Opens process start forms by route at `/process/:processId`.
- Falls back to simple action buttons when a task or process has no renderable form.
- Renders Flowable forms through `@flowable/forms`.
- Refreshes the task list after a task is completed.
- Uses Angular routing with proxy-backed API calls to a remote or local Flowable environment.

## Application Structure

- [`src/app/menu`](/Users/greg.harley/dev/frontend/angular-apps/flowable-angular-standalone/src/app/menu): task and process navigation with search.
- [`src/app/task`](/Users/greg.harley/dev/frontend/angular-apps/flowable-angular-standalone/src/app/task): task details, variables, and completion flow.
- [`src/app/process`](/Users/greg.harley/dev/frontend/angular-apps/flowable-angular-standalone/src/app/process): process start form and process creation flow.
- [`src/app/flwform`](/Users/greg.harley/dev/frontend/angular-apps/flowable-angular-standalone/src/app/flwform): Angular wrapper around the Flowable form renderer.
- [`src/proxy.conf.json`](/Users/greg.harley/dev/frontend/angular-apps/flowable-angular-standalone/src/proxy.conf.json): development proxy configuration for backend APIs.

## Backend APIs

The development server proxies these paths to your Flowable environment:

- `/platform-api`
- `/process-api`
- `/core-api`
- `/my-custom-api`

By default they point to `http://localhost:8090`.

## Local Development

Install dependencies:

```bash
npm install
```

Update the proxy target in [`src/proxy.conf.json`](/Users/greg.harley/dev/frontend/angular-apps/flowable-angular-standalone/src/proxy.conf.json) if your Flowable backend is running on a different host or port.

Start the development server:

```bash
npm start
```

The app will be available at `http://localhost:4200/`.

## Available Scripts

- `npm start`: run the Angular dev server with the configured proxy.
- `npm run build`: create a production build in `dist/standalone-app`.
- `npm run watch`: run a development build in watch mode.
- `npm test`: run unit tests with Karma.

## Notes

- The app currently uses Basic Authorization headers in the client for local/demo usage.
- Flowable form rendering is loaded lazily so the main Angular bundle stays smaller on first load.
- Clicking the Flowable logo 3 times within 1.5 seconds toggles Flowable form debug mode for local troubleshooting.

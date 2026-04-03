import '@flowable/forms/polyfill.js';
import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as ReactDOM from 'react-dom';
import {createRoot} from 'react-dom/client';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

// React 19 removed the legacy react-dom.render(...) and
// react-dom.unmountComponentAtNode(...) APIs. Flowable 2025.2 still invokes
// that older surface internally, so we provide a narrow compatibility shim
// that maps those calls onto createRoot(...).
type ReactDOMCompat = typeof ReactDOM & {
  render?: (node: unknown, container: Element) => unknown;
  unmountComponentAtNode?: (container: Element) => boolean;
};

const reactDomCompat = ReactDOM as ReactDOMCompat;
// Keep one React root per container so repeated Flowable renders reuse the
// same mount point and unmount cleanly.
const reactRoots = new WeakMap<Element, ReturnType<typeof createRoot>>();

if (typeof reactDomCompat.render !== 'function') {
  reactDomCompat.render = (node: unknown, container: Element) => {
    let root = reactRoots.get(container);

    if (!root) {
      root = createRoot(container);
      reactRoots.set(container, root);
    }

    root.render(node);
    return node;
  };
}

if (typeof reactDomCompat.unmountComponentAtNode !== 'function') {
  reactDomCompat.unmountComponentAtNode = (container: Element) => {
    const root = reactRoots.get(container);

    if (!root) {
      return false;
    }

    root.unmount();
    reactRoots.delete(container);
    return true;
  };
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).catch((err: unknown) => console.error(err));

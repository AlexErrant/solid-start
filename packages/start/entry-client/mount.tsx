import type { JSX } from "solid-js";
import { createComponent, hydrate, render } from "solid-js/web";

import mountRouter from "../islands/router";

if (import.meta.env.DEV) {
  localStorage.setItem("debug", import.meta.env.DEBUG ?? "start*");
  const { default: createDebugger } = await import("debug");
  window.DEBUG = createDebugger("start:client");

  DEBUG(`import.meta.env.DEV = ${import.meta.env.DEV}`);
  DEBUG(`import.meta.env.PROD = ${import.meta.env.PROD}`);
  DEBUG(`import.meta.env.START_SSR = ${import.meta.env.START_SSR}`);
  DEBUG(`import.meta.env.START_ISLANDS = ${import.meta.env.START_ISLANDS}`);
  DEBUG(`import.meta.env.START_ISLANDS_ROUTER = ${import.meta.env.START_ISLANDS_ROUTER}`);
  DEBUG(`import.meta.env.SSR = ${import.meta.env.SSR}`);
}

export default function mount(code?: () => JSX.Element, element?: Document) {
  if (import.meta.env.START_ISLANDS) {
    mountRouter();

    async function mountIsland(el: HTMLElement) {
      let Component = window._$HY.islandMap[el.dataset.island];
      if (!Component) {
        await import(/* @vite-ignore */ el.dataset.component);
        Component = window._$HY.islandMap[el.dataset.island];
      }

      DEBUG(
        "hydrating island",
        el.dataset.island,
        el.dataset.hk.slice(0, el.dataset.hk.length - 1) + `2-`,
        el
      );

      hydrate(() => createComponent(Component, JSON.parse(el.dataset.props)), el, {
        renderId: el.dataset.hk.slice(0, el.dataset.hk.length - 1) + `2-`
      });
    }

    window._$HY.hydrateIslands = () => {
      document.querySelectorAll("solid-island").forEach((el: HTMLElement) => {
        if (el.dataset.when === "idle") {
          requestIdleCallback(() => mountIsland(el));
        } else {
          mountIsland(el as HTMLElement);
        }
      });
    };

    window._$HY.hydrateIslands();

    return;
  } else if (import.meta.env.START_ISLANDS_ROUTER) {
    mountRouter();
    return;
  }

  if (import.meta.env.START_SSR) {
    hydrate(code, element);
  } else {
    render(code, element === document ? element.body : element);
  }
}

// @ts-check


/**
 * Finds all elements that have id="..."
 * The id is key into this hash
 * @returns {Object.<string,Element>|{}} hash of elements with ids
 */
export function thingsWithId() {
  const ret = {};
  const list = document.querySelectorAll("[id]");
  list.forEach(e => {
    ret[e.id] = e;
  })
  return ret;
}


export function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    } else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2));
      }
    }
  };
}
export const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);

export const $ = id => document.getElementById(id);
export const create = tag => document.createElement(tag);
export const qs = rule => document.querySelector(rule);
export const qsa = rule => document.querySelectorAll(rule);
export const fill = (selector, v) => qsa(selector).forEach(e => e.innerHTML = String(v));
export const wipe = (selector) => fill(selector, '');


// assumes div.toast and css with --width ...
export function toast(
  message,
  {
    delay = 3,  // before skittering away
    background = "aliceblue",
    boxshadow = "red",
    width = 18,
    top = 0,
    left = 0,
    move = false,
    close = false,
  } = {}
) {
  const div = qs(".toast");
  if (!div) return;
  if (delay === 0) {
    div.style.visibility = "hidden";
    return;
  }

  div.style.visibility = "visible";
  div.innerHTML = message;
  div.classList.remove("toast");
  void div.offsetWidth;
  div.classList.add("toast");
  if (left) div.style.setProperty("--left", left + "px");
  if (top) div.style.setProperty("--top", top + "px");
  div.style.setProperty("--boxshadow", boxshadow);
  div.style.setProperty("--background", background);
  div.style.setProperty("--delay", delay + "s");
  div.style.setProperty("--width", width + "rem");
  if (close) {
    const divAbove = document.createElement("div");
    div.prepend(divAbove);
    divAbove.innerHTML = '<span id="notoast">close</span>';
    div.removeEventListener("click", closeMe);
    div.addEventListener("click", closeMe);
  }
}

function closeMe(e) {
  if (e.target.id === "notoast") {
    const div = qs(".toast")
    div.style.visibility = "hidden";
  }
}

export const nice = (n,d) => {
  if (!Number.isFinite(+n)) return n;
  if (Number.isInteger(+n)) return Number(n);
  return Number(n.toFixed(d));
}

export const colorscale1 = ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0"];
export const colorscale2 = ["#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78"];
export const colorscale3 = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"];
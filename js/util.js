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
    // @ts-ignore
    ret[e.id] = e;
  })
  return ret;
}


/**
 * Group array by keys - keys created by cb
 * @param {Array<any>} arr array of items
 * @param {function} cb  create key-value from item
 * @returns {object} array grouped by keys
 */
export function group(arr, cb) {
  let index = 0;
  let key, value;
  const target = {};
  let length = arr.length;
  for (; length > index; index++) {
    value = arr[index];
    key = cb(value);
    // @ts-ignore
    if (key in target) (target[key].push(value));
    // @ts-ignore
    else target[key] = [value];
  }
  return target;
}


/**
 * @param {string} pre
 * @param {string} str
 */
export function unprefix(pre,str) {
  // unprefix("_",XXX_yyyy) => yyyy
  // unprefix("_",XXXyyyy) => XXXyyyy
  if (str.includes(pre)) {
    return str.split(pre).slice(1).join('');
  }
  return str;
}

/**
 * @param {{ (f1: number, f2: number, X: number): number; length?: any; apply?: any; }} func
 */
export function curry(func) {
  return function curried(/** @type {any[]} */ ...args) {
    if (args.length >= func.length) {
      // @ts-ignore
      return func.apply(this, args);
    } else {
      // @ts-ignore
      return function (/** @type {ConcatArray<any>} */ ...args2) {
        // @ts-ignore
        return curried.apply(this, args.concat(args2));
      }
    }
  };
}
export const compose = (/** @type {any[]} */ ...fns) => (/** @type {any} */ x) => fns.reduceRight((y, f) => f(y), x);


export const chunk = (/** @type {any[]} */ arr, /** @type {number} */ size) =>
  arr.reduce((/** @type {any} */ acc, /** @type {any} */ _, /** @type {number} */ i) => 
    i % size ? acc : [...acc, arr.slice(i, i + size)], []
  );


/**
 * @param {any[]} array
 */
export function shuffle(array) {
  const result = array.slice(); // copy to avoid mutating input
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // pick index 0..i
    [result[i], result[j]] = [result[j], result[i]]; // swap
  }
  return result;
}




/**
 * 
 * @param {string} id 
 * @returns any
 */
export const $ = id => /** @type {any} */(document.getElementById(id));
export const create = (/** @type {any} */ tag) => document.createElement(tag);
export const qs = (/** @type {string} */ rule) => document.querySelector(rule);
export const qsa = (/** @type {any} */ rule) => document.querySelectorAll(rule);
export const fill = (/** @type {any} */ selector, /** @type {string} */ v) => qsa(selector).forEach(e => e.innerHTML = String(v));
export const wipe = (/** @type {any} */ selector) => fill(selector, '');


// assumes div.toast and css with --width ...
/**
 * @param {string} message
 */
export function toast(
  message,
  {
    delay = 3,  // before skittering away
    background = "aliceblue",
    boxshadow = "red",
    width = 18,
    top = 0,
    left = 0,
    // @ts-ignore
    move = false,
    close = false,
  } = {}
) {
  const div = qs(".toast");
  if (!div) return;
  if (delay === 0) {
    // @ts-ignore
    div.style.visibility = "hidden";
    return;
  }

  // @ts-ignore
  div.style.visibility = "visible";
  div.innerHTML = message;
  div.classList.remove("toast");
  // @ts-ignore
  void div.offsetWidth;
  div.classList.add("toast");
  // @ts-ignore
  if (left) div.style.setProperty("--left", left + "px");
  // @ts-ignore
  if (top) div.style.setProperty("--top", top + "px");
  // @ts-ignore
  div.style.setProperty("--boxshadow", boxshadow);
  // @ts-ignore
  div.style.setProperty("--background", background);
  // @ts-ignore
  div.style.setProperty("--delay", delay + "s");
  // @ts-ignore
  div.style.setProperty("--width", width + "rem");
  if (close) {
    const divAbove = document.createElement("div");
    div.prepend(divAbove);
    divAbove.innerHTML = '<span id="notoast">close</span>';
    // @ts-ignore
    div.removeEventListener("click", closeMe);
    // @ts-ignore
    div.addEventListener("click", closeMe);
  }
}

export function bread() {
  const div = qs(".toast")
  // @ts-ignore
  div.style.visibility = "hidden";
}

/**
 * @param {{ target: { id: string; }; }} e
 */
function closeMe(e) {
  if (e.target.id === "notoast") {
    bread();
  }
}

export const nice = (/** @type {number} */ n, /** @type {number} */ d) => {
  if (!Number.isFinite(+n)) return n;
  if (Number.isInteger(+n)) return Number(n);
  return Number(n.toFixed(d));
}

export const colorscale1 = ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0"];
export const colorscale2 = ["#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78"];
export const colorscale3 = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"];


/**
 * @usage makeSelect("id","ski,dans,drama")
 * @usage makeSelect("id","ski:0,dans:1,drama:2")
 * @param {string} id
 * @param {string} elements
 * @return {string} html for a select, <select id="{id}"><option ...></option> .. </option></select>
 */
export function makeSelect(id, elements, chosen = "") {
  let etikettLo; // etiketten i lower_case
  let selected; // får verdien " selected" dersom dette er default element
  let list = elements.split(",");
  let t = '<select id="' + id + '">';
  for (let i = 0; i < list.length; i++) {
    let elm = list[i];
    let [etikett, value] = elm.split(":");
    etikettLo =
      value !== undefined ? value : etikett.toLowerCase();
    selected = etikettLo === chosen ? " selected" : "";
    t +=
      '<option value="' +
      etikettLo +
      '"' +
      selected +
      ">" +
      etikett +
      "</option>";
  }
  t += "</select>";
  return t;
}

/**
 * Lager en input av gitt type
 *  @param {string} id -  toLowerCase for DOM-id, brukt som fallback for ledetekst
 *  @param {string} type  text,number,date,button,select
 *  @param {object} alternativer { ledetekst:'skriv',klasse:'knapp',valg:'a,b,c',valgt:'a',min:0,max:10}
 */
export function makeInput(id = "myid", type = "text", alternativer = {}, value = "") {
  let myDiv = document.createElement("div");
  // @ts-ignore
  myDiv.className = alternativer.klasse || "inputDiv";
  // @ts-ignore
  let ledetekst = alternativer.ledetekst || id;
  // @ts-ignore
  let title = alternativer.title ? `title="${alternativer.title}"` : "";
  let valfield = value ? ` value="${value}"` : "";
  let t = "";
  let minMaxPlace = "";
  id = id.toLowerCase();
  value;
  switch (type) {
    case "textarea":
      t =
        `<label ${title} for"${id}">${ledetekst}</label>` +
        `<textarea id="${id}">${value}</textarea>`;
      break;
    case "output":
      t =
        `<label ${title} for"${id}">${ledetekst}</label>` +
        `<output id="${id}" ${valfield}></output>`;
      break;
    case "select":
      // @ts-ignore
      let options = alternativer.valg || "ja,nei";
      // @ts-ignore
      let choice = alternativer.valgt || value;
      t =
        `<label ${title} for="${id}">${ledetekst}</label>` +
        makeSelect(id, options, choice);
      break;
    case "checkbox":
      // @ts-ignore
      const chk = alternativer.valgt === "ja" ? "checked" : "";
      t =
        `<label ${title} for="${id}">${ledetekst}</label>` +
        `<input type="checkbox" id="${id}" ${chk}>`;
      break;
    case "button":
      // @ts-ignore
      let klass = alternativer.button || "button";
      t = `<button ${title} type="button" id="${id}" class="${klass}">${ledetekst}</button>`;
      break;
    case "label":
      t = '<label id="' + id + '">' + ledetekst + "</label>";
      break;
    case "number":
      // @ts-ignore
      if (isFinite(alternativer.min)) {
        // @ts-ignore
        minMaxPlace += " min=" + +alternativer.min;
      }
      // @ts-ignore
      if (isFinite(alternativer.max)) {
        // @ts-ignore
        minMaxPlace += " max=" + +alternativer.max;
      }
    // TODO we drop thru on purpose
    default:
      // @ts-ignore
      if (alternativer.placeholder) {
        // @ts-ignore
        minMaxPlace += ' placeholder="' + alternativer.placeholder + '"';
      }
      t = `<label ${title} for="${id}">${ledetekst}</label><input id="${id}" type="${type}" ${valfield} ${minMaxPlace} >`;
      break;
  }
  myDiv.innerHTML = t;
  return myDiv;
}
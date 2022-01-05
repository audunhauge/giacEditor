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
export const fill = (selector,v) => qsa(selector).forEach(e => e.innerHTML = String(v));
export const wipe = (selector) => fill(selector,'');
// @ts-check

/**
 * exports 
 *   thingsWithId           returns { names for things with id}
 *   updateMyProperties     returns a proxy object, pro 
 *   Keys                   Keys.has("ArrowUp")
 * getLocalJSON(k)      get localStorage + JSON.parse with catch
 * setLocalJSON(k,v)    set localStorage + JSON.stringify
 * wrap(arr,tag)        wraps each element in arr with tag, wrap([1,2],"li") => '<li>1</li><li>2</li>'
 * $(id)                short for document.getElementById
 * create(tag)          short for document.createElement(tag)
 * qs(rule)             short for document.querySelector(rule)
 * qsa(rule)            short for document.querySelectorAll(rule)
 * preCalc()            triggers calc of all expressions
 */

/**
 * interpolate fills this hash with elements that have
 * innerHTML containing {variables}
 * These are replaced with spans so that mind() can update
 * on change of minded(properties)
 */


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



const namedVariables = {};
const valueOfNamedVars = {};
const expressions = {};
const namedExpressions = {};
const inputs = {};
const styled = {}; // stylish things
const repeatList = {}; // things that need repeating

export const $ = id => document.getElementById(id);
export const create = tag => document.createElement(tag);
export const qs = rule => document.querySelector(rule);
export const qsa = rule => document.querySelectorAll(rule);
export const fill = (v) => qsa(".ok_gold").forEach(e => e.innerHTML = String(v));
export const wipe = () => fill('');

// pushes value into prop, will create array if prop not array
//const putit = (obj,prop,val) => Array.isArray(obj[prop]) ? obj[prop].push(val) : obj[prop] = [val];



/**
 * Replace {x} with <span>x</span> 
 * Prepare for use with mind({x}) so that
 * any changes to x will be shown as span.innerHTML
 * @example  html='<div>{x}</div>', js='let x=1;interpolate(); let o = mind({x});'
 * html changed to <div><span></span></div>
 * changes to o.x will be updated into span.innerHTML
 * NOTE: start state not set, change o.x to set span.innerHTML
 */
function prepTheWebPage(klas="minos") {
    let idnum = 0;
    const allnames = {}; // all {names} and {exp + pressions}
    // will be filtered to seperate names/expressions


    // pick out any elements with id and repeat 
    {
        const repeating = document.querySelectorAll(`.${klas} [repeat][id]`);
        repeating.forEach(node => {
            const orig = node.innerHTML;
            repeatList[node.id] = { node, orig }
            // @ts-ignore
            node.innerHTML = "";
        })
    }
    // pick out any styles 
    {
        const withStyle = document.querySelectorAll(`.${klas} [stil]`);
        withStyle.forEach(elm => elm.classList.add("stylish"));

        const list = document.querySelectorAll(".stylish");
        list.forEach(l => {
            if (!l.id) { l.id = "sty" + idnum++ }
            const orig = l.getAttribute("stil");
            styled[l.id] = { l, orig };
            l.setAttribute("stil", '');
            l.setAttribute("style", "");
            orig.replace(/\{(.+?)\}/g, (m, t) => {
                // will be overwritten if used in innerHTMl/inputs found later
                // needed here in case this is only usage
                namedVariables[t] = [];
                valueOfNamedVars[t] = undefined;
                return '';
            })
        });

    }
    // pick out any inputs with value="{name}" or id="name"
    {
        const inps = document.querySelectorAll(`.${klas} :where(input[name],select[name],input[id],select[id])`);
        inps.forEach(inp => {
            const name = inp.getAttribute("name");
            const id = inp.getAttribute("id");
            if (!name) inp.setAttribute("name", id);
            inputs[name || id] = inp;
            // @ts-ignore
            inp.dataset.id = idnum++;
        });
    }
    // pick out any {words} within innerHTML
    {
        const list = document.querySelectorAll(`.${klas}`);
        list.forEach(l => {
            l.innerHTML = l.innerHTML.replace(/\{(.+?)\}/g, (m, t) => {
                t = t.replace(/\&amp;/g,'&').replace(/\&gt;/g,'>').replace(/\&lt;/g,'<');
                allnames[t] = [];
                return `<span data-name="${t}" class="ok_gold" id="ok${idnum++}"></span>`;
            })
        });
        document.querySelectorAll(".ok_gold").forEach(e => {
            // @ts-ignore
            allnames[e.dataset.name]?.push(e);
        });
        const named = Object.keys(allnames).filter(k => k.includes(":="));
        const nameless = Object.keys(allnames).filter(k => !k.includes(":="));
        nameless.forEach(k => {
            if (k.match(/\W/)) {
                // if not pure name like {x}
                // then we assume {x+y}
                expressions[k] = k;
            } else {
                namedVariables[k] = allnames[k];
                valueOfNamedVars[k] = undefined;
            }
        });
        named.forEach(k => {
            // a named expression {x#y+3}
            // name is "x", value "y+3"
            const [name, exp] = k.split(':=');
            namedVariables[name] = allnames[k]
            valueOfNamedVars[name] = undefined;
            namedExpressions[name] = exp;
        });
    }
}

prepTheWebPage();


/**
 * Finds all elements that have id="..."
 * The id is key into this hash
 * @returns hash of elements with ids
 */
export function thingsWithId() {
    const ret = {};
    const list = document.querySelectorAll("[id]");
    list.forEach(e => {
        ret[e.id] = e;
    })
    return ret;
}

const num = (n) => {
    return Number.isFinite(n) ?
        Number.isInteger(n) ?
            n :
            (String(n).length > 8) ?
                n.toFixed(4) :
                n :
        n;
}

export const sum = (arr, field) => arr.reduce((s, v) => s + Number(v[field]), 0);
export const sort = (arr, field, up = true) => {
    if (arr.length) {
        if (Number.isFinite(arr[0][field])) {
            up ? arr.sort((a, b) => a[field] - b[field]) : arr.sort((a, b) => b[field] - a[field])
        } else {
            up ? arr.sort((a, b) => a[field] > b[field] ? 1 : a[field] == b[field] ? 0 : -1) :
                arr.sort((a, b) => b[field] > a[field] ? 1 : a[field] == b[field] ? 0 : -1);
        }
    }
}

const mathEnvironment = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    abs: Math.abs,
    atan: Math.atan,
    asin: Math.asin,
    acos: Math.acos,
    exp: Math.exp,
    floor: Math.floor,
    log: Math.log,
    log10: Math.log10,
    max: Math.max,
    min: Math.min,
    pow: Math.pow,
    random: Math.random,
    round: Math.round,
    sign: Math.sign,
    sqrt: Math.sqrt,
    π: Math.PI,
    PI: Math.PI,
    sum,
    sort,
};

const eva = (variables, exp) => {
    if (exp.includes('$')) {
        exp = exp.replace(/(\$\w+)/g, (_, e) => {
            const name = e.substr(1);
            if (variables[name] !== undefined) {
                return variables[name];
            }
            return name;
        });
    }
    let v = "";
    const environment = Object.assign(Object.assign({}, mathEnvironment), variables);
    try {
        function ctxEval(exp, ctx) { // evaluates expression in the scope of context object
            return (new Function('expression', 'context', 'with(context){return eval(expression)}'))(exp, ctx);
        }
        v = ctxEval(exp, environment);
    } catch (error) {
        console.log(error, exp, environment);
    }
    return v;
}

const expressionValue = curry(eva)(valueOfNamedVars);

/**
 * Tar en liste med ord + en tag og pakker ordene inn i taggen
 * Eks: wrap([1,2],"i") => <i>1</i><i>2</i>
 * @param {array} ar liste med ord som skal vises
 * @param {string} tag html tag som skal omgi teksten
 * @returns {string}
 */
export const wrap = (ar, tag) => ar.map(e => `<${tag}>${e}</${tag}>`).join('');

/**
 * Erstatter {x} med verdien til x, gitt {x:"ole"}
 * @param {string} template '{a} og {b}'
 * @param {object} obj {a:"ole",b:"per"}
 * @returns {string} 'ole og per'
 */
const interpolate = (template, obj) => template.
    replace(/\{(.+?)\}/g, (_, k) => {
        return (obj[k] !== undefined) ? obj[k]
            : eva(obj,k) ?? _;
    });

/**
 * Redraws a repeat element, object values in array are interpolated
 * primitive values (number,string,bool) are substed into "$", index is $i
 * @param {string} k id of repeat element
 * @param {array} target array containing values to show in repeat element
 */
const redraw = (k, target) => {
    const { orig } = repeatList[k];
    const node = $(k);
    const value = target.map((v, i) => {
        if (typeof v === "object") {
            Object.assign(v, { i });
            return interpolate(orig, v);
        }
        // first $i replaced with index, next $ replaced with value
        return orig.replace(/\$i/g, i).replace(/\$/g, v);
    })
    node.innerHTML = value.join("");
}
const repeatProxy = (k) => new Proxy([], {
    set: (target, property, value) => {
        target[property] = value;
        //if (property !== "length" && repeatList[k]) {
        redraw(k, target);
        valueOfNamedVars[k] = target;
        evalNamedExp(k);
        evalExp(k);
        updateStyles(k);
        //}
        return true;
    }
})

/**
 * Set up a proxy for this object
 * Any props that are found in targets will autoupdate on change
 * @param {Object} obj Contains named props
 * @returns a proxy for this object
 */
export function updateMyProperties(obj = {}) {
    const up = e => {
        const inp = e.target;
        // @ts-ignore
        const name = inp.name;
        // @ts-ignore
        if (inp.type === "checkbox") {
            pro[name] = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                // @ts-ignore
                .map(e => e.value).join(",");
        } else {
            // @ts-ignore
            pro[name] = inp.value;
        }
    }
    Object.keys(repeatList).forEach(k => obj[k] = repeatProxy(k));
    Object.keys(namedVariables).forEach(k => obj[k] = undefined);

    const pro = new Proxy(obj, {
        set: function (target, property, value) {
            const v = num(value);
            target[property] = value;
            if (namedVariables[property]) {
                valueOfNamedVars[property] = v;
                namedVariables[property].forEach(t => {
                    const html = (v !== undefined) ? v : '';
                    t.innerHTML = html;
                });
            }
            if (inputs[property]) {
                const id = inputs[property].dataset.id;
                const t = document.querySelector(`[data-id="${id}"]`);
                // @ts-ignore
                if (!"radiocheckbox".includes(t.type)) {
                    // @ts-ignore
                    t.value = v;
                }
                valueOfNamedVars[property] = v;
            }
            // named expressions done first - so straight exps get latest value
            // internal order not considered - x:y+1  might use old y if y:n+1 comes after
            evalNamedExp(property);
            evalExp(property);
            // interpolate values into styles
            updateStyles(property);
            return true;
        }
    });
    document.querySelectorAll("[data-id]").forEach(elm => {
        elm.addEventListener("input", up);
    });
    return pro;
}

const updateStyles = property => Object.keys(styled).forEach(k => {
    const { l, orig } = styled[k];
    //const orig = l.dataset.orig;
    if (orig.includes(String(property))) {
        // style looks like it depends on this property
        const style = orig.replace(/\{(.+?)\}/g, (_, m) => {
            //return valueOfNamedVars[m] || '';
            return num(expressionValue(m));
        });
        const target = $(l.id);
        // @ts-ignore
        target.style = style;
    }
})

const evalExp = (property) => Object.keys(expressions).forEach(k => {
    if (k.includes(String(property))) {
        // expression looks like it depends on this property
        const ts = qsa(`[data-name="${k}"]`);
        const v = num(expressionValue(expressions[k]));
        ts.forEach(t => t.innerHTML = v);
    }
});

const evalNamedExp = (property) => Object.keys(namedExpressions).forEach(k => {
    const exp = namedExpressions[k];
    if (exp.includes(String(property))) {
        // expression looks like it depends on this property
        const key = k + ':=' + exp;
        const t = qs(`[data-name="${key}"]`);
        if (t) {
            const v = num(expressionValue(exp));
            t.innerHTML = v;
            // the expression has a name - update its value
            valueOfNamedVars[k] = v;
            // target[property] = v;
        }
    }
});

/**
 * Precalc any expressions like {2+3}
 * those with dependencies on x,yz will fail
 */
export const preCalc = () => {
    Object.keys(namedExpressions).forEach(k => {
        const exp = namedExpressions[k];
        const key = k + ':=' + exp;
        const t = qs(`[data-name="${key}"]`);
        if (t) {
            const v = num(expressionValue(exp));
            // @ts-ignore
            t.innerHTML = v;
            // the expression has a name - update its value
            valueOfNamedVars[k] = v;
        }
    });
    Object.keys(expressions).forEach(k => {
        const ts = qsa(`[data-name="${k}"]`);
        const v = num(expressionValue(expressions[k]));
        ts.forEach(t => t.innerHTML = v);
    });
}

export const getLocalJSON = (k) => {
    const old = localStorage.getItem(k);
    if (old) {
        try {
            return JSON.parse(old);
        } catch (err) {
            console.log(err, old);
        }
    }
    return null;
};
export const setLocalJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));


/**
 * Simple class for keyboard handling
 * Also contains wait()
 */
export class Keys {
    static keys = [];

    static init() {
        document.addEventListener("keydown", Keys.down);
        document.addEventListener("keyup", Keys.up);
    }
    static down(e) {
        Keys.keys[e.key] = 1;
    }
    static up(e) {
        Keys.keys[e.key] = 0;
    }
    /**
     * True if this key is currently pressed
     * @param {string} k 
     * @returns {boolean}
     */
    static has(k) {
        return Keys.keys[k] === 1;
    }

    /**
     * True if any key pressed
     * @returns {boolean }
     */
    static any() {
        return Keys.keys.some(e => e === 1);
    }

    /**
     * Returns promise that resolves after n millisec
     *  waits n milliseconds
     * @returns {Promise}
     */
    static wait(n) {
        return new Promise(resolve =>
            setTimeout(() => {
                resolve();
            }, n));
    }

    /**
     * Returns promise that resolves on key-pressed
     * @returns {Promise}
     * @example
     * await Keys.trigger()
     */
    static trigger() {
        return new Promise(resolve => {
            function kh(e) {
                document.removeEventListener('keydown', kh);
                resolve(e.key);
            }
            document.addEventListener('keydown', kh);
        });
    }
}
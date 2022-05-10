// @ts-check



import { $, wrap } from './Minos.js';
import { giaEval, litex } from './render.js';
const { abs, min, max, sin, cos, PI, floor, log, exp, E } = Math;



/**
 * Renders a regression
 * The points are stashed in regpoints
 * @param {string} id 
 * @param {string} txt 
 * @param {any} funks 
 * @param {string} klass 
 * @param {number} i
 * @returns void
 */
export const renderReg = (id, txt, funks, regpoints, i, klass = "") => {
    const lines = txt.split('\n').filter(e => e != "");
    if (lines.length < 2) {
        $(id).innerHTML = "Must have xs:1,2,3 and ys:2,3,8 (example values)"
        return;
    }
    const div = $(id);
    const data = { xs: [], ys: [] };
    let named = false;
    const base = "a".charCodeAt(0);
    const commands = [];
    let funame = `p${String.fromCharCode(base + i)}(x)`;
    let pname = `r${i}`;    // named pointlist
    let tcaption = '';
    for (const line of lines) {
        const [name = "", values = ""] = line.split(":") || [];
        if (data[name]) {
            named = true;
            data[name] = values.split(",").map(Number);
        } else {
            if (line.startsWith("name") && line.length > 5) {
                funame = line.slice(5);  // skip "name:" or "name "
            } else {
                if (line.startsWith("table") && line.length > 6) {
                    pname = line.slice(6);  // skip "table:" or "table "
                    tcaption = pname;
                }
                commands.push(line);
            }
        }
    }
    const goodNumbers = named && (data.xs.every(Number.isFinite) && data.ys.every(Number.isFinite));
    const goodShape = data.xs.length != 0 && data.xs.length === data.ys.length;
    if (goodNumbers && goodShape) {
        // good numbers and xs,ys same size
        const { xs, ys } = data;

        regpoints[pname] = [xs, ys];
        let [type, param = 2] = klass.trim().split(" ");
        let res = "";
        let funk = '';
        const rnames = { pol: "polynomial", lin: "linear", pow: "power", exp: "exponential" };
        const typ = type.slice(0, 3);
        const rtyp = rnames[typ];
        param = "," + param;

        switch (typ) {
            case "lin":
                param = ''
            case "pol": {
                const coeff = giaEval(`${rtyp}_regression([${xs}],[${ys}]${param}))`);
                const arr = (coeff.replace('[', '').replace(']', '')).split(",");
                const a2 = arr.map(e => Number(eval(e)).toPrecision(5)).join(",");
                const poly1 = giaEval(`expand(poly2symb([${arr}],x))`);
                const poly2 = giaEval(`expand(poly2symb([${a2}],x))`);
                funk = litex(poly2);

                funks[funame] = poly1;
                giaEval(`${funame}:=${poly1}`);
            }
                break;
            case "exp": {
                const coeff = giaEval(`evalf(${rtyp}_regression([${xs}],[${ys}])))`).split(",");
                const [a, b] = coeff || [];
                const [A, B] = [a, b].map(v => (+v).toPrecision(5));
                funks[funame] = `${b}*${a}^x`;
                giaEval(`${funame}:=${b}*${a}^x`);
                const ef = litex(`${B}*e^(${(log(a)).toPrecision(5)}x)`);
                funk = litex(`f(x)=${B}*${A}^x`) + " eller " + ef;
            }
                break;
            case "pow": {
                const coeff = giaEval(`evalf(${rtyp}_regression([${xs}],[${ys}])))`).split(",");
                const [a, b] = coeff || [];
                const [A, B] = [a, b].map(v => (+v).toPrecision(5));
                funks[funame] = `${b}*x^(${a})`;
                giaEval(`${funame}:=${b}*x^(${a})`);
                funk = litex(`f(x)=${B}*x^(${A})`);
            }
                break;
        }
        for (const line of commands) {
            if (line.startsWith("<")) {
                res += line;
            }
            if (line.startsWith("show")) {
                res += '<div>' + funk + '</div>';
            }
            if (line.startsWith("plot")) {
                res += '<div>' + "plot" + '</div>';
            }
            if (line.startsWith("table")) {
                const table = wrap(['<th>x</th>' + wrap(xs, "td"), '<th>y</th>' + wrap(ys, "td")], "tr")
                res += '<div class="table dataset"><table>'
                    + `<caption>${tcaption}</caption>`
                    + table + '</table></div>';
            }
        }

        div.innerHTML = res;
    } else {
        div.innerHTML = (goodNumbers ? "" : "Bad numbers, expecting like xs:1,3 ys:2,8 ") + (goodShape ? "" : " Must have equal size xs,ys");
    }

}
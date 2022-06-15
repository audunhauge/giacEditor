// @ts-check

import { wrap, $, create } from './Minos.js';
import { colorscale1, colorscale2, colorscale3, nice } from './util.js';
import { fisher, fisherCrit, lowess } from './probability.js';

import { tableList,svgList } from './render.js';

const bigScale = colorscale1.concat(colorscale2, colorscale3);

const { abs, min, max, sin, cos, PI, floor } = Math;

const barChart = (data, sum, size) => {
    let numbers = data[0].map(Number);
    let ys = (data[1] || []).map(Number);
    let haveXS = false;
    if (ys.length && ys.every(Number.isFinite)) {
        // 2. row is also numbers - assume y values
        haveXS = true;
        data.shift();  // adjust so ys not used as labels
    } else {
        ys = numbers.slice();
    }
    const N = numbers.length;
    const w = min(max(0.02, 1.7 / N), 0.4);
    const labels = data[1] || [];
    const large = max(...ys);
    const step = 2 / 5;
    const scaled = ys.map(v => 2 * v / large);
    const n = String(Math.random()).slice(2, 10);
    const text = [];
    let ofs = 0.35;
    let innerSVG = scaled.map((v, i) => {
        let nr = String(haveXS ? numbers[i] : i + 1);
        let nlabel = '';
        if (ofs > nr.length * 0.15 && nr.length < 5) {
            nlabel = `<text x="${i * (w + 0.01) - 0.9 * (1 - w / 3)}" y="1.15">${nr}</text>`;
            ofs -= nr.length * 0.15;
        }
        ofs += w + 0.01;
        const bar = `<rect width="${w}" x="${i * (w + 0.01) - 0.9}" y="${1 - v}" height="${v}"></rect>` + nlabel;
        const lbl = labels[i];
        if (lbl) {
            const id = "bar" + n + String(i);
            const p = `<path id="${id}" d="M ${i * (w + 0.01) - 0.9 * (1 - w)} 1 l 0 -1"/>`
            text.push(p + `<text class="inside"><textPath startOffset="1%" href="#${id}">${lbl}</textPath></text>`);
        }
        return bar;
    }
    ).join("") + text.join("")
        + [0, 1, 2, 3, 4, 5].map(v => v * step)
            .map(s => `<line x1="-1.1" y1="${1 - s}" x2="1.1" y2="${1 - s}" stroke-width: 0.001px; />`)
            .join("");
    const ww = size ? `width:${size}px;` : '';
    return `<svg style="${ww} class="bar" viewBox="-1.15 -1.15 2.3 2.3" >` + innerSVG + '</svg>';
}


const histChart = (data, sum, size) => {
    // data[0] is lo , data[1] is hi, data[2] is freq
    const lo = data[0].map(Number);
    const hi = (data[1] || []).map(Number);
    const N = lo.length;
    const start = lo[0];
    const stop = hi[N - 1];
    const span = stop - start;
    const br = lo.map((v, i) => (hi[i] - v));    // klassebredde
    const brs = br.map(v => 1.8 * v / span);
    const fs = (data[2] || []).map(Number);
    const fss = fs.map((v, i) => v / br[i]);
    const large = max(...fss);
    const s0 = (start * 2) / span - 1.1;
    const yss = fss.map(v => 2 * v / large);
    const xss = [...lo, stop].map(v => 1.8 * v / span);
    const text = [...lo, stop].map((t, i) => `<text x=${min(0.9, s0 + xss[i])} y=${1.1}>${t}</text>`).join("");
    let innerSVG = yss.map((v, i) => {
        const bar = `<rect width="${brs[i]}" x="${s0 + xss[i]}" y="${1 - v}" height="${v}"></rect>
        <text x=${min(s0 + (xss[i] + xss[i + 1]) / 2)} y=${0.9}>${fs[i]}</text>`;
        return bar;
    }).join("");
    const w = size ? `width:${size}px;` : '';
    return `<svg style="${w}" class="hist" viewBox="-1.15 -1.15 2.3 2.3" >${innerSVG}${text}</svg>`;
}

const pieChart = (data, sum, size) => {
    const numbers = data[0];
    let ys = (data[1] || []).map(Number);
    if (ys.length && ys.every(Number.isFinite)) {
        // 2. row is also numbers - assume y values
        data.shift();
    } else {
        ys = numbers.slice();
    }
    const labels = data[1] || [];
    const percents = ys.map(v => v / +sum);
    const p2xy = (p, x = 2 * PI * p) => [cos(x).toFixed(3), sin(x).toFixed(3)];
    let tot = 0;
    const txt = [];
    const n = String(Math.random()).slice(2, 10);
    let innerSVG = percents.map((p, i) => {
        const [sx, sy] = p2xy(tot);
        tot += p;
        if (abs(p) < 0.001) return '';  // slice too thin to draw
        const fill = bigScale[i % bigScale.length];
        const id = "tt" + n + String(i);
        if (labels[i]) {
            const len = floor(64 * p);
            txt.push({ text: String(labels[i]).slice(0, len).replace("'",""), id });
        }
        const [ex, ey] = p2xy(tot);
        const largeArcFlag = p > .5 ? 1 : 0;
        return `<path id="${id}" d="M ${sx} ${sy} A 1 1 0 ${largeArcFlag} 1 ${ex} ${ey} L 0 0" fill="${fill}"></path>`
    }).join("");
    if (txt.length) {
        innerSVG += txt.map(({ x, y, text, id }) => `<text dy="-1.3%"><textPath startOffset="5%" href="#${id}">${text}</textPath></text>`).join("");
    }
    const w = size ? `width:${size}px;` : '';
    return `<svg viewBox="-1.15 -1.15 2.3 2.3" style="${w}transform: rotate(-90deg)">` + innerSVG + '</svg>';
}


/**
 * Handles plot, mean,median and other commands for a table
 * @param {array} commands list of commands
 * @param {string} type table type
 */
const commandWrangler = (commands, type, response, data, sum, id) => {
    const r = [];  // computed values
    const f = [];  // figures
    const list = data[0];
    for (const line of commands) {
        const command = (line.split(/[^a-zA-Z]/)[0]).trim();
        if (response[command] !== undefined) {
            r.push('<span>' + command + '</span><span>' + Number(response[command]).toFixed(2) + '</span>');
        } else {
            if (command === "plot") {
                let chart;
                const options = line.match(/plot ?([a-z]+)? ?([0-9.]+)?/);
                const [_, type = "bar", size] = (options || []);
                if (type === "pie") {
                    chart = (pieChart(data.slice(), sum, size));
                }
                if (type === "hist") {
                    chart = (histChart(data.slice(), sum, size));
                }
                if (type === "bar") {
                    chart = (barChart(data.slice(), sum, size));
                }
                f.push(chart);
                svgList[id] = chart;
            }
            if (command === "prosent") {
                const percent = create("tr");
                percent.innerHTML = wrap(list.map(v => (100 * (+v) / (+sum)).toFixed(1) + "%"), "td");
                $(id).querySelector("table").append(percent);
            }

            if (command === "hide") {
                $(id).querySelector("table").classList.add("hidden");
            }
        }
    }
    return ['<div>' + wrap(r, "div") + '</div>', ...f];
}


export const dataTable = (data, commands, id) => {
    // calc mean, median, stddev
    let ret = [];
    if (data.length) {
        if (commands.length == 0) {
            return ret;
        } else {
            return commandWrangler(commands, "stats", {}, data, 0, id);
        }
    }
    return ret;
}


export const statsTable = (data, commands, id) => {
    // calc mean, median, stddev
    let ret = [];
    if (data.length) {
        let list = data[0].map(Number);
        let ys = (data[1] || []).map(Number);
        if (ys.length && ys.every(Number.isFinite)) {
            // 2. row is also numbers - assume y values
        } else {
            ys = list.slice();
        }
        const N = ys.length;
        let sx = 0, sxx = 0;
        for (let v of ys) {
            sx += v;
            sxx += v * v;
        }
        const _mean = sx / N;
        const _varians = (sxx - sx * sx / N) / (N - 1);  // sufficiently presice with integer data
        // loss of precision when sxx and sx*sx/N are similar
        const _stddev = Math.sqrt(_varians);
        const a = floor(N / 2);
        const b = floor((N - 1) / 2);
        const sorted = (ys.slice().sort((x, y) => x - y));
        const maximum = sorted[N - 1];
        const minimum = sorted[0];
        const counts = {};
        sorted.forEach(v => {
            const k = counts[v];
            counts[v] = k ? k + 1 : 1;
        });
        const most = Object.keys(counts).sort((x, y) => counts[y] - counts[x]);
        const type = most[0];
        const _median = (sorted[a] + sorted[b]) / 2;
        const [sum, mean, median, varians, stddev, s] = [sx, _mean, _median, _varians, _stddev, _stddev]
            .map(v => Number.isFinite(+v) ? Number(v).toFixed(3) : v);
        if (commands.length == 0) {
            ret.push('<div>' + wrap(Object.entries({ sum, mean, median, varians, s }).map(v => wrap(v, "span")), "div") + '</div>');
            return ret;
        } else {
            const response = { N, sum, mean, median, varians, stddev, s, maximum, minimum, type };
            return commandWrangler(commands, "stats", response, data, sx, id);
        }
    }
    return ret;
}

export const transpose = arr => {
    const data = Array(arr[0].length).fill(0).map(e => []);
    arr.map((v, i) => {
        v.map((u, j) => {
            data[j][i] = u
        })
    });
    return data;
}

export const anovaTable = (_data, commands, id) => {
    const ret = [];
    if (_data.length) {
        // 'ANOVA ANALYSIS';
        const data = transpose(_data);
        const YY = data;
        const nn = YY.map(v => v.length);
        const n = YY.reduce((s, v) => s + v.length, 0);
        const TT = YY.map((v => v.reduce((s, v) => s + v, 0)));
        const T = TT.reduce((s, v) => s + v, 0);
        const C = T * T / n
        const _TOT = YY.reduce((s, v) => s + v.reduce((s, v) => s + v * v, 0), 0);
        const SSTOT = _TOT - C;
        const SSTR = TT.reduce((s, v, i) => s + v * v / nn[i], 0) - C;
        const SSE = SSTOT - SSTR;
        const k = data.length;
        const MSTR = SSTR / (k - 1);
        const MSE = SSE / (n - k);
        const F = MSTR / MSE;
        const p = 1 - fisher(k - 1, n - k, F);
        const P = fisherCrit(.05, k - 1, n - k)
        const names = "n,C,T,SSTOT,SSTR,SSE,F,p,P,Hyp".split(",");
        const vals = [n, C, T, SSTOT, SSTR, SSE, F, p, P].map(v => v.toFixed(3));
        vals.push(p< 0.05 ? "Different" : "Same");
        const txt = wrap(names.map((e, i) => `<span>${e}</span><span>${vals[i]}</span>`), "div");
        ret.push(txt);
        return ret;
    }
    ret.push('<p>No data yet ...');
    return ret;
}

export const frekTable = (_data, commands, id, haveHead) => {
    const ret = [];
    if (_data.length) {
        const tbl = $(id).querySelector("tbody");
        const data = transpose(_data);
        const [xs, fs] = data.slice(0, 2);
        const L = xs.length - 1;
        let mean,median;
        let plotData;
        if (String(xs[0]).includes(':')) {
            // assume binned data
            if (!String(xs[L]).includes(":")) {
                ret.push('<p>First and last bin must be start:stop');
                return ret;
            }
            const grouped = [];
            let [start, stop] = xs[0].split(":");
            let mp = (+start + +stop) / 2;
            grouped.push([+start, +stop, fs[0], mp, fs[0] * mp]);
            for (let i = 1; i < L; i++) {
                [start, stop] = [stop, xs[i]];
                mp = (Number(start) + Number(stop)) / 2;
                grouped.push([+start, +stop, fs[i], mp, (fs[i] * mp)]);
            }
            const [a, b] = xs[L].split(":");
            if (+a !== +stop) {
                ret.push(`<p>Inconsistent start/end last two groups: ${a} ${stop}`);
                return ret;
            }
            [start, stop] = [stop, b];
            mp = (Number(start) + Number(stop)) / 2;
            grouped.push([+start, +stop, fs[L], mp, (fs[L] * mp)]);
            // grouped contains data for binned freq table
            plotData = transpose(grouped);
            const sumf = fs.reduce((s, v) => s + v, 0);
            mean = grouped.reduce((s, v) => s + v[4], 0) / sumf;
            median = 0;
            const trans = grouped.map(row =>
                '<tr>' + row.map(cell => '<td>' + (cell) + '</td>').join("") + '</tr>'
            ).join("");
            tbl.innerHTML = trans;
            tableList[id] = trans;
            ret.push(`Mean=${mean.toFixed(2)}`);
            if (!haveHead) {
                const head = create("thead");
                head.innerHTML = '<tr>' + wrap("Lo,Hi,f,m,m*f".split(","), "th") + '</tr>';
                $(id).querySelector("table").append(head);
            }
        } else {
            const sumf = fs.reduce((s, v) => s + v, 0);
            const rs = fs.map(f => f / sumf);
            const crs = [];  // cum rel
            rs.reduce((s, v, i) => crs[i] = s + v, 0);
            median = xs[crs.findIndex(r => r > 0.5)];

            const sumxf = fs.reduce((s, v, i) => s + v * xs[i], 0);
            mean = sumxf / sumf;
            plotData = [xs.slice(), fs.slice()];
            const newtable = transpose([xs, fs, rs, crs].map(r => r.map(v => nice(v, 2))));
            const trans = newtable.map(row =>
                '<tr>' + row.map(cell => '<td>' + (cell) + '</td>').join("") + '</tr>'
            ).join("");
            tbl.innerHTML = trans;
            tableList[id] = trans;
            if (!haveHead) {
                const head = create("thead");
                head.innerHTML = '<tr>' + wrap("Xverdier,Frekvens,RelativF,RelKumulativF".split(","), "th") + '</tr>';
                $(id).querySelector("table").append(head);
            }
            ret.push(`Mean=${mean.toFixed(2)} Median=${median.toFixed(2)}`);
        }
        if (commands.length == 0) {
            return ret;
        } else {
            const response = { mean, median };
            return commandWrangler(commands, "stats", response, plotData, 0, id);
        }
    }
    ret.push('<p>No data yet ...');
    return ret;
}
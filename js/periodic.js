// @ts-check

/**
 * periodic table
 * 20årpåskolenernestenformye
 */

export const pt = [
    'H,,,,,,,,,,,,,,,,,He'.split(','),
    'Li,Be,,,,,,,,,,,B,C,N,O,F,Ne'.split(','),
    'Na,Mg,,,,,,,,,,,Al,Si,P,S,Cl,Ar'.split(','),
    'K,Ca,Sc,Ti,Va,Cr,Mn,Fe,Co,Ni,Cu,Zn,Ga,Ge,As,Se,Br,Kr'.split(','),
    'Rb,St,Y,Zr,Nb,Mo,Tc,Ru,Rh,Pd,Ag,Cd,In,Sn,Sb,Te,I,Xe'.split(','),
    'Cs,Ba,,Hf,Ta,W,Re,Os,Ir,Pt,Au,Hg,Tl,Pb,Bi,Po,At,Rn, '.split(','),
    ',,,,,,,,,,,,,,,,,'.split(','),
    ',,,,,,,,,,,,,,,,,'.split(','),
];  //  18 x 7

const elements = {
    H: {
        name: 'Hydrogen',
        id: 1,
        group: "non",
        density:0.00008988,
    },
    He: {
        name: 'Helium',
        id: 2,
        group: "nobel",
        density:0.0001785,
    },
    Li: {
        name: 'Lithium',
        id: 3,
        group: "alkali",
        density:0.534,
    },
    Be: {
        name: 'Berylium',
        id: 4,
        group: "earth",
        density:1.85,
    },
    B: {
        name: 'Bor',
        id: 5,
        group: "oid",
        density:2.37,
    },
    C: {
        name: 'Karbon',
        id: 6,
        group: "non",
        density:2.2670
    },
    N: {
        name: 'Nitrogen',
        id: 7,
        group: "non",
        density:0.0012506,
    },
    O: {
        name: 'Oksygen',
        id: 8,
        group: "non",
        density:0.001429,
    },
    F: {
        name: 'Fluor',
        id: 9,
        group: "halogen",
        density:0.001696,
    },
    Ne: {
        name: 'Neon',
        id: 10,
        group: "nobel",
        density:0.0008999,
    },
    Na: {
        name: 'Natrium',
        id: 11,
        group: "alkali",
        density:0.97,
    },
    Mg: {
        name: 'Magnesium',
        id: 12,
        group: "earth",
        density:1.74,
    },
    Al: {
        name: 'Aluminium',
        id: 13,
        group: "post",
        density:2.70,
    },
    Si: {
        name: 'Silisium',
        id: 14,
        group: "oid",
        density:2.3296,
    },
    P: {
        name: 'Fosfor',
        id: 15,
        group: "non",
        density:1.82,
    },
    S: {
        name: 'Svovel',
        id: 16,
        group: "non",
        density:2.067,
    },
    Cl: {
        name: 'Klor',
        id: 17,
        group: "halogen",
        density:0.003214,
    },
    Ar: {
        name: 'Argon',
        id: 18,
        group: "nobel",
        density:0.0017837,
    },
    K: {
        name: 'Kalium',
        id: 19,
        group: "alkali",
        density:0.89,
    },
    Ca: {
        name: 'Kalsium',
        id: 20,
        group: "earth",
        density:154
    },
    Sc: {
        name: 'Scandium',
        id: 21,
        density:2.99,
    },
    Ti: {
        name: 'Titan',
        id: 22,
        density:4.5,
    },
    Va: {
        name: 'Vanadium',
        id: 23,
        density:6.0,
    },
    Cr: {
        name: 'Crom',
        id: 24,
        density:7.15,
    },
    Mn: {
        name: 'Mangan',
        id: 25,
        density:7.3,
    },
    Fe: {
        name: 'Jern',
        id: 26,
        density:7.874,
    },
    Co: {
        name: 'Kobolt',
        id: 27,
        density:8.86,
    },
    Ni: {
        name: 'Nikkel',
        id: 28,
        density:8.912,
    },
    Cu: {
        name: 'Kobber',
        id: 29,
        density:8.933,
    },
    Zn: {
        name: 'Sink',
        id: 30,
        density:7.134,
    },
    Ga: {
        name: 'Gallium',
        id: 31,
        group: "post",
        density:5.91,
    },
    Ge: {
        name: 'Germanium',
        id: 32,
        group: "oid",
        density:5.323,
    },
    As: {
        name: 'Arsen',
        id: 33,
        group: "oid",
        density:5.776,
    },
    Se: {
        name: 'Selen',
        id: 34,
        group: "non",
        density:4.809,
    },
    Br: {
        name: 'Brom',
        id: 35,
        group: "halogen",
        density:3.11,
    },
    Kr: {
        name: 'Krypton',
        id: 36,
        group: "nobel",
        density:0.003733,
    },
    Rb: {
        name: 'Rubidium',
        id: 37,
        group: "alkali",
        density:1.53,
    },
    St: {
        name: 'Strontium',
        id: 38,
        group: "earth",
        density:2.64,
    },
    Y: {
        name: 'Yttrium',
        id: 39,
        density:4.47,
    },
    Zr: {
        name: 'Zirkonium',
        id: 40,
        density:6.52,
    },
    Nb: {
        name: 'Niobium',
        id: 41,
        density:8.57,
    },
    Mo: {
        name: 'Molybden',
        id: 42,
        density:10.2,
    },
    Tc: {
        name: 'Technetium',
        id: 43,
        density:11
    },
    Ru: {
        name: 'Ruthenium',
        id: 44,
        density:12.1,
    },
    Rh: {
        name: 'Rhodium',
        id: 45,
        density:12.4,
    },
    Pd: {
        name: 'Palladium',
        id: 46,
        density:12,
    },
    Ag: {
        name: 'Sølv',
        id: 47,
        density:10.51,
    },
    Cd: {
        name: 'Cadmium',
        id: 48,
        density:8.69
    },
    In: {
        name: 'Indium',
        id: 49,
        group: "post",
        density:7.31,
    },
    Sn: {
        name: 'Tinn',
        id: 50,
        group: "post",
        density:7.287,
    },
    Sb: {
        name: 'Antimon',
        id: 51,
        group: "oid",
        density:6.685,
    },
    Te: {
        name: 'Tellerium',
        id: 52,
        group: "oid",
        density:6.232,
    },
    I: {
        name: 'Iod',
        id: 53,
        group: "halogen",
        density:4.93,
    },
    Xe: {
        name: 'Xenon',
        id: 54,
        group: "nobel",
        density:0.005887,
    },
    Cs: {
        name: 'Cesium',
        id: 55,
        group: "alkali",
        density:1.93,
    },
    Ba: {
        name: 'Barium',
        id: 56,
        group: "earth",
        density:3.62,
    },
    Hf: {
        name: 'Hafnium',
        id: 72,
        density:13.3,
    },
    Ta: {
        name: 'Tantal',
        id: 73,
        density:16.4,
    },
    W: {
        name: 'Wolfram',
        id: 74,
        density:19.3,
    },
    Re: {
        name: 'Rhenium',
        id: 75,
        density:20.8,
    },
    Os: {
        name: 'Osmium',
        id: 76,
        density:22.57
    },
    Ir: {
        name: 'Iridium',
        id: 77,
        density:22.42,
    },
    Pt: {
        name: 'Platinum',
        id: 78,
        density:21.46,
    },
    Au: {
        name: 'Gull',
        id: 79,
        density:19.282,
    },
    Hg: {
        name: 'Kviksølv',
        id: 80,
        density:13.5336,
    },
    Tl: {
        name: 'Thallium',
        id: 81,
        group: "post",
        density:11.8,
    },
    Pb: {
        name: 'Bly',
        id: 82,
        group: "post",
        density:11.342,
    },
    Bi: {
        name: 'Bismuth',
        id: 83,
        group: "post",
        density:9.807,
    },
    Po: {
        name: 'Polonium',
        id: 84,
        group: "oid",
        density:9.32,
    },
    At: {
        name: 'Astat',
        id: 85,
        group: "halogen",
        density:7,
    },
    Rn: {
        name: 'Radon',
        id: 86,
        group: "nobel",
        density:0.00973,
    },
}

export const periodic = (kriteria) => {
    const [_, range] = (kriteria.join(' ').match(/(\d+-\d+)/) || ['', '1-100']);
    const good = Object.keys(elements['H']);
    const preCanon = kriteria.filter(k => good.includes(k));  // only good keys
    const colorKey = preCanon.includes("group");
    const canon = preCanon.filter(e => e != "group");
    const [lo, hi] = range.split('-').map(e => Number(e));
    return '<table class="periodic">' +
        pt.map(line => '<tr>' +
            line.map(elm => {
                let inner = elm;
                let colorClass = '';
                if (elm != '' && elements[elm]) {
                    const atom = elements[elm];
                    const nr = atom.id || 0;
                    if (nr >= lo && nr <= hi) {
                        colorClass = colorKey ? (atom["group"] || 'metal') : '';
                        const extra = canon.map(k => {
                            const v = atom[k];
                            if (!v) return '';
                            return `<div class="${k}">${v}</div>`;
                        }).join('');
                        inner = `<div>${elm}</div>` + extra;
                    } else {
                        inner = '';
                    }
                }
                return `<td class="elm ${colorClass}">` + inner + '</td>'
            }).join('') +
            '</tr>').join('') +
        '</table>'
}
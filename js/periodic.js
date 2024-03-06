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
        mass:1.0080,
    },
    He: {
        name: 'Helium',
        id: 2,
        group: "nobel",
        density:0.0001785,
        mass:4.00260,
    },
    Li: {
        name: 'Lithium',
        id: 3,
        group: "alkali",
        density:0.534,
        mass:7.0,
    },
    Be: {
        name: 'Berylium',
        id: 4,
        group: "earth",
        density:1.85,
        mass:9.012183,
    },
    B: {
        name: 'Bor',
        id: 5,
        group: "oid",
        density:2.37,
        mass:10.81,
    },
    C: {
        name: 'Karbon',
        id: 6,
        group: "non",
        density:2.2670,
        mass:12.011,
    },
    N: {
        name: 'Nitrogen',
        id: 7,
        group: "non",
        density:0.0012506,
        mass:14.007,
    },
    O: {
        name: 'Oksygen',
        id: 8,
        group: "non",
        density:0.001429,
        mass:15.999,
    },
    F: {
        name: 'Fluor',
        id: 9,
        group: "halogen",
        density:0.001696,
        mass:18.998493,
    },
    Ne: {
        name: 'Neon',
        id: 10,
        group: "nobel",
        density:0.0008999,
        mass:20.180,
    },
    Na: {
        name: 'Natrium',
        id: 11,
        group: "alkali",
        density:0.97,
        mass:22.989769,
    },
    Mg: {
        name: 'Magnesium',
        id: 12,
        group: "earth",
        density:1.74,
        mass:24.305,
    },
    Al: {
        name: 'Aluminium',
        id: 13,
        group: "post",
        density:2.70,
        mass:26.981538,
    },
    Si: {
        name: 'Silisium',
        id: 14,
        group: "oid",
        density:2.3296,
        mass:28.085,
    },
    P: {
        name: 'Fosfor',
        id: 15,
        group: "non",
        density:1.82,
        mass:30.973762,
    },
    S: {
        name: 'Svovel',
        id: 16,
        group: "non",
        density:2.067,
        mass:32.07,
    },
    Cl: {
        name: 'Klor',
        id: 17,
        group: "halogen",
        density:0.003214,
        mass:35.45,
    },
    Ar: {
        name: 'Argon',
        id: 18,
        group: "nobel",
        density:0.0017837,
        mass:39.9,
    },
    K: {
        name: 'Kalium',
        id: 19,
        group: "alkali",
        density:0.89,
        mass:39.0983,
    },
    Ca: {
        name: 'Kalsium',
        id: 20,
        group: "earth",
        density:1.54,
        mass:40.08,

    },
    Sc: {
        name: 'Scandium',
        id: 21,
        density:2.99,
        mass:44.95591,
    },
    Ti: {
        name: 'Titan',
        id: 22,
        density:4.5,
        mass:47.867,
    },
    Va: {
        name: 'Vanadium',
        id: 23,
        density:6.0,
        mass:50.9415,
    },
    Cr: {
        name: 'Crom',
        id: 24,
        density:7.15,
        mass:51.996,
    },
    Mn: {
        name: 'Mangan',
        id: 25,
        density:7.3,
        mass:54.93804,
    },
    Fe: {
        name: 'Jern',
        id: 26,
        density:7.874,
        mass:55.84,
    },
    Co: {
        name: 'Kobolt',
        id: 27,
        density:8.86,
        mass:58.93319,
    },
    Ni: {
        name: 'Nikkel',
        id: 28,
        density:8.912,
        mass:58.693,
    },
    Cu: {
        name: 'Kobber',
        id: 29,
        density:8.933,
        mass:63.55,
    },
    Zn: {
        name: 'Sink',
        id: 30,
        density:7.134,
        mass:65.4,
    },
    Ga: {
        name: 'Gallium',
        id: 31,
        group: "post",
        density:5.91,
        mass:69.723,
    },
    Ge: {
        name: 'Germanium',
        id: 32,
        group: "oid",
        density:5.323,
        mass:72.63,
    },
    As: {
        name: 'Arsen',
        id: 33,
        group: "oid",
        density:5.776,
        mass:74.92159,
    },
    Se: {
        name: 'Selen',
        id: 34,
        group: "non",
        density:4.809,
        mass:78.97,
    },
    Br: {
        name: 'Brom',
        id: 35,
        group: "halogen",
        density:3.11,
        mass:79.90,
    },
    Kr: {
        name: 'Krypton',
        id: 36,
        group: "nobel",
        density:0.003733,
        mass:83.8,
    },
    Rb: {
        name: 'Rubidium',
        id: 37,
        group: "alkali",
        density:1.53,
        mass:85.468,
    },
    St: {
        name: 'Strontium',
        id: 38,
        group: "earth",
        density:2.64,
        mass:87.62,
    },
    Y: {
        name: 'Yttrium',
        id: 39,
        density:4.47,
        mass:88.90584,
    },
    Zr: {
        name: 'Zirkonium',
        id: 40,
        density:6.52,
        mass:91.22,
    },
    Nb: {
        name: 'Niobium',
        id: 41,
        density:8.57,
        mass:92.90637,
    },
    Mo: {
        name: 'Molybden',
        id: 42,
        density:10.2,
        mass:95.95,
    },
    Tc: {
        name: 'Technetium',
        id: 43,
        density:11,
        mass:96.90636,
    },
    Ru: {
        name: 'Ruthenium',
        id: 44,
        density:12.1,
        mass:101.1,
    },
    Rh: {
        name: 'Rhodium',
        id: 45,
        density:12.4,
        mass:102.9055,
    },
    Pd: {
        name: 'Palladium',
        id: 46,
        density:12,
        mass:106.42,
    },
    Ag: {
        name: 'Sølv',
        id: 47,
        density:10.51,
        mass:107.868,
    },
    Cd: {
        name: 'Cadmium',
        id: 48,
        density:8.69,
        mass:112.41,
    },
    In: {
        name: 'Indium',
        id: 49,
        group: "post",
        density:7.31,
        mass:114.818,
    },
    Sn: {
        name: 'Tinn',
        id: 50,
        group: "post",
        density:7.287,
        mass:118.71,
    },
    Sb: {
        name: 'Antimon',
        id: 51,
        group: "oid",
        density:6.685,
        mass:121.7601,
    },
    Te: {
        name: 'Tellerium',
        id: 52,
        group: "oid",
        density:6.232,
        mass:127.6,
    },
    I: {
        name: 'Jod',
        id: 53,
        group: "halogen",
        density:4.93,
        mass:126.9045,
    },
    Xe: {
        name: 'Xenon',
        id: 54,
        group: "nobel",
        density:0.005887,
        mass:131.29,
    },
    Cs: {
        name: 'Cesium',
        id: 55,
        group: "alkali",
        density:1.93,
        mass:132.9054,
    },
    Ba: {
        name: 'Barium',
        id: 56,
        group: "earth",
        density:3.62,
        mass:137.33,
    },
    Hf: {
        name: 'Hafnium',
        id: 72,
        density:13.3,
        mass:178.49,
    },
    Ta: {
        name: 'Tantal',
        id: 73,
        density:16.4,
        mass:180.9479,
    },
    W: {
        name: 'Wolfram',
        id: 74,
        density:19.3,
        mass:183.84,
    },
    Re: {
        name: 'Rhenium',
        id: 75,
        density:20.8,
        mass:186.207,
    },
    Os: {
        name: 'Osmium',
        id: 76,
        density:22.57,
        mass:190.2,
    },
    Ir: {
        name: 'Iridium',
        id: 77,
        density:22.42,
        mass:192.22,
    },
    Pt: {
        name: 'Platinum',
        id: 78,
        density:21.46,
        mass:195.08,
    },
    Au: {
        name: 'Gull',
        id: 79,
        density:19.282,
        mass:196.96657,
    },
    Hg: {
        name: 'Kviksølv',
        id: 80,
        density:13.5336,
        mass:200.59,
    },
    Tl: {
        name: 'Thallium',
        id: 81,
        group: "post",
        density:11.8,
        mass:204.383,
    },
    Pb: {
        name: 'Bly',
        id: 82,
        group: "post",
        density:11.342,
        mass:207,
    },
    Bi: {
        name: 'Bismuth',
        id: 83,
        group: "post",
        density:9.807,
        mass:208.98040,
    },
    Po: {
        name: 'Polonium',
        id: 84,
        group: "oid",
        density:9.32,
        mass:208.98243,
    },
    At: {
        name: 'Astat',
        id: 85,
        group: "halogen",
        density:7,
        mass:209.98715,
    },
    Rn: {
        name: 'Radon',
        id: 86,
        group: "nobel",
        density:0.00973,
        mass:222.01758,
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
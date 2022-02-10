// @ts-check

const hyp = (x, n, m, nn) => {
    var nz, mz;
    if (m < n) {         //best to have n<m
        nz = m;
        mz = n
    } else {
        nz = n;
        mz = m
    }
    var h = 1, s = 1, k = 0, i = 0;
    while (i < x) {
        while ((s > 1) && (k < nz)) {
            h = h * (1 - mz / (nn - k));
            s = s * (1 - mz / (nn - k));
            k = k + 1;
        }
        h = h * (nz - i) * (mz - i) / (i + 1) / (nn - nz - mz + i + 1);
        s = s + h;
        i = i + 1;
    }
    while (k < nz) {
        s = s * (1 - mz / (nn - k));
        k = k + 1;
    }
    return s;
}

export const factorial = n => {
    let acc = 1;
    for (let i = 2; i <= n; i++) {
        acc = acc * i;
    }
    return acc;
}

export const combination = (n,k)  => factorial(n) / (factorial(k) * factorial(n - k));

export const hyper = (Pop, n, s, k) => (combination(n, k) * combination(Pop - n, s - k)) / combination(Pop, s);


export const hyperC = (nn, m, n, x) => {
    let Prob;
    if ((n <= 0) || (m <= 0) || (nn <= 0)) {
        console.log("hyperg: Parameters must be positive integers");
        Prob = 0
    } else if ((m > nn) || (n > nn)) {
        console.log("hyperg: m and n must be less than N");
        Prob = 0
    } else if ((x < 0) || (x < n + m - nn)) {
        Prob = 0
    } else if ((x >= n) || (x >= m)) {
        Prob = 1
    } else {
        if (2 * m > nn) {
            if (2 * n > nn) {
                Prob = hyp(nn - m - n + x, nn - n, nn - m, nn)
            } else {
                Prob = 1 - hyp(n - x - 1, n, nn - m, nn)
            }
        } else if (2 * n > nn) {
            Prob = 1 - hyp(m - x - 1, m, nn - n, nn)
        } else {
            Prob = hyp(x, n, m, nn)
        }
    }
    return Prob;
}

export const nChoosek = (n, k) => factorial(n) / (factorial(n - k) * factorial(k));

export const binomial =  (n, k, p) =>  nChoosek(n, k) * p ** k * (1 - p) ** (n - k);

export const binomialC = (n, k, p) => {
    let total = 0;
    for(let i = 0; i <= k; i++) {
        total += binomial(n, i, p)
    }
    return total;
}
// @ts-check

const { log, sqrt, exp, round, floor, PI, abs, min,max,pow } = Math;

import {curry} from './util.js';

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
    n = Number(n);
    if (n > 22) return round(exp(logFact(n)));
    let acc = 1;
    for (let i = 2; i <= +n; i++) {
        acc = acc * i;
    }
    return acc;
}

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

export const nChoosek = (n, k) => {
    if (n < 150) return factorial(n) / (factorial(n - k) * factorial(k));
    return exp(logFact(n) - (logFact(n - k) + logFact(k)));
}

export const combination = nChoosek;

export const binomial = (n, p, k) => nChoosek(n, k) * p ** k * (1 - p) ** (n - k);

export const binomialC = (n, p, k) => {
    let total = 0;
    for (let i = 0; i <= k; i++) {
        total += binomial(n, p, i)
    }
    return total;
}


export const logFact = (n) => {
    const x = n + 1;
    if (n < 0) return 0;
    if (n > 254) return (x - 0.5) * log(x) - x + 0.5 * log(2 * PI) + 1.0 / (12.0 * x);
    return lf[n];
}

const lf = [0.000000000000000, 0.000000000000000, 0.693147180559945, 1.791759469228055, 3.178053830347946, 4.787491742782046,
    6.579251212010101, 8.525161361065415, 10.604602902745251, 12.801827480081469, 15.104412573075516, 17.502307845873887,
    19.987214495661885, 22.552163853123421, 25.191221182738683, 27.899271383840894, 30.671860106080675, 33.505073450136891,
    36.395445208033053, 39.339884187199495, 42.335616460753485, 45.380138898476908, 48.471181351835227, 51.606675567764377,
    54.784729398112319, 58.003605222980518, 61.261701761002001, 64.557538627006323, 67.889743137181526, 71.257038967168000,
    74.658236348830158, 78.092223553315307, 81.557959456115029, 85.054467017581516, 88.580827542197682, 92.136175603687079,
    95.719694542143202, 99.330612454787428, 102.968198614513810, 106.631760260643450, 110.320639714757390, 114.034211781461690,
    117.771881399745060, 121.533081515438640, 125.317271149356880, 129.123933639127240, 132.952575035616290, 136.802722637326350,
    140.673923648234250, 144.565743946344900, 148.477766951773020, 152.409592584497350, 156.360836303078800, 160.331128216630930,
    164.320112263195170, 168.327445448427650, 172.352797139162820, 176.395848406997370, 180.456291417543780, 184.533828861449510,
    188.628173423671600, 192.739047287844900, 196.866181672889980, 201.009316399281570, 205.168199482641200, 209.342586752536820,
    213.532241494563270, 217.736934113954250, 221.956441819130360, 226.190548323727570, 230.439043565776930, 234.701723442818260,
    238.978389561834350, 243.268849002982730, 247.572914096186910, 251.890402209723190, 256.221135550009480, 260.564940971863220,
    264.921649798552780, 269.291097651019810, 273.673124285693690, 278.067573440366120, 282.474292687630400, 286.893133295426990,
    291.323950094270290, 295.766601350760600, 300.220948647014100, 304.686856765668720, 309.164193580146900, 313.652829949878990,
    318.152639620209300, 322.663499126726210, 327.185287703775200, 331.717887196928470, 336.261181979198450, 340.815058870798960,
    345.379407062266860, 349.954118040770250, 354.539085519440790, 359.134205369575340, 363.739375555563470, 368.354496072404690,
    372.979468885689020, 377.614197873918670, 382.258588773060010, 386.912549123217560, 391.575988217329610, 396.248817051791490,
    400.930948278915760, 405.622296161144900, 410.322776526937280, 415.032306728249580, 419.750805599544780, 424.478193418257090,
    429.214391866651570, 433.959323995014870, 438.712914186121170, 443.475088120918940, 448.245772745384610, 453.024896238496130,
    457.812387981278110, 462.608178526874890, 467.412199571608080, 472.224383926980520, 477.044665492585580, 481.872979229887900,
    486.709261136839360, 491.553448223298010, 496.405478487217580, 501.265290891579240, 506.132825342034830, 511.008022665236070,
    515.890824587822520, 520.781173716044240, 525.679013515995050, 530.584288294433580, 535.496943180169520, 540.416924105997740,
    545.344177791154950, 550.278651724285620, 555.220294146894960, 560.169054037273100, 565.124881094874350, 570.087725725134190,
    575.057539024710200, 580.034272767130800, 585.017879388839220, 590.008311975617860, 595.005524249382010, 600.009470555327430,
    605.020105849423770, 610.037385686238740, 615.061266207084940, 620.091704128477430, 625.128656730891070, 630.172081847810200,
    635.221937855059760, 640.278183660408100, 645.340778693435030, 650.409682895655240, 655.484856710889060, 660.566261075873510,
    665.653857411105950, 670.747607611912710, 675.847474039736880, 680.953419513637530, 686.065407301994010, 691.183401114410800,
    696.307365093814040, 701.437263808737160, 706.573062245787470, 711.714725802289990, 716.862220279103440, 722.015511873601330,
    727.174567172815840, 732.339353146739310, 737.509837141777440, 742.685986874351220, 747.867770424643370, 753.055156230484160,
    758.248113081374300, 763.446610112640200, 768.650616799717000, 773.860102952558460, 779.075038710167410, 784.295394535245690,
    789.521141208958970, 794.752249825813460, 799.988691788643450, 805.230438803703120, 810.477462875863580, 815.729736303910160,
    820.987231675937890, 826.249921864842800, 831.517780023906310, 836.790779582469900, 842.068894241700490, 847.352097970438420,
    852.640365001133090, 857.933669825857460, 863.231987192405430, 868.535292100464630, 873.843559797865740, 879.156765776907600,
    884.474885770751830, 889.797895749890240, 895.125771918679900, 900.458490711945270, 905.796028791646340, 911.138363043611210,
    916.485470574328820, 921.837328707804890, 927.193914982476710, 932.555207148186240, 937.921183163208070, 943.291821191335660,
    948.667099599019820, 954.046996952560450, 959.431492015349480, 964.820563745165940, 970.214191291518320, 975.612353993036210,
    981.015031374908400, 986.422203146368590, 991.833849198223450, 997.249949600427840, 1002.670484599700300, 1008.095434617181700,
    1013.524780246136200, 1018.958502249690200, 1024.396581558613400, 1029.838999269135500, 1035.285736640801600, 1040.736775094367400,
    1046.192096209724900, 1051.651681723869200, 1057.115513528895000, 1062.583573670030100, 1068.055844343701400, 1073.532307895632800,
    1079.012946818975000, 1084.497743752465600, 1089.986681478622400, 1095.479742921962700, 1100.976911147256000, 1106.478169357800900,
    1111.983500893733000, 1117.492889230361000, 1123.006317976526100, 1128.523770872990800, 1134.045231790853000, 1139.570684729984800,
    1145.100113817496100, 1150.633503306223700, 1156.170837573242400,
];

export const normalcdf = (X) => {   //HASTINGS.  MAX ERROR = .000001
    var T = 1 / (1 + .2316419 * abs(X));
    var D = .3989423 * exp(-X * X / 2);
    var Prob = D * T * (.3193815 + T * (-.3565638 + T * (1.781478 + T * (-1.821256 + T * 1.330274))));
    if (X > 0) {
        Prob = 1 - Prob
    }
    return Prob
}

export const normal = (my, sigma, x) => {
    const z = (x - my) / sigma;
    return exp(-0.5 * z * z) / (sigma * 2 * PI);
}

export const normalC = (my, sigma, x) => {
    if (sigma === 0) {
        return x < my ? 0 : 1;
    }
    return Number(normalcdf((x - my) / sigma).toPrecision(5));
}


export function LogGamma(Z) {
    var S = 1 + 76.18009173 / Z - 86.50532033 / (Z + 1) + 24.01409822 / (Z + 2) - 1.231739516 / (Z + 3) + .00120858003 / (Z + 4) - .00000536382 / (Z + 5);
    var LG = (Z - .5) * log(Z + 4.5) - (Z + 4.5) + log(S * 2.50662827465);
    return LG
}

export function Betinc(X, A, B) {
    var A0 = 0;
    var B0 = 1;
    var A1 = 1;
    var B1 = 1;
    var M9 = 0;
    var A2 = 0;
    var C9;
    while (abs((A1 - A2) / A1) > .00001) {
        A2 = A1;
        C9 = -(A + M9) * (A + B + M9) * X / (A + 2 * M9) / (A + 2 * M9 + 1);
        A0 = A1 + C9 * A0;
        B0 = B1 + C9 * B0;
        M9 = M9 + 1;
        C9 = M9 * (B - M9) * X / (A + 2 * M9 - 1) / (A + 2 * M9);
        A1 = A0 + C9 * A1;
        B1 = B0 + C9 * B1;
        A0 = A0 / B1;
        B0 = B0 / B1;
        A1 = A1 / B1;
        B1 = 1;
    }
    return A1 / A
}

export function Betacdf(Z, A, B) {
    var S;
    var BT;
    var Bcdf;
    S = A + B;
    BT = exp(LogGamma(S) - LogGamma(B) - LogGamma(A) + A * log(Z) + B * log(1 - Z));
    if (Z < (A + 1) / (S + 2)) {
        Bcdf = BT * Betinc(Z, A, B)
    } else {
        Bcdf = 1 - BT * Betinc(1 - Z, B, A)
    }

    return Bcdf
}

/**
 * Fisher distribution
 * @param {Number} X 
 * @param {number} f1 deg of freedom
 * @param {number} f2 deg of freedom
 * @returns fisher probability
 */
export function fisher(f1, f2, X) {
    let Fcdf, Z;
    if (f1 <= 0) {
        console.log("Numerator degrees of freedom must be positive");
        return 0;
    } else if (f2 <= 0) {
        console.log("Denominator degrees of freedom must be positive")
        return 0;
    } else if (X <= 0) {
        Fcdf = 0
    } else {
        Z = X / (X + f2 / f1);
        Fcdf = Betacdf(Z, f1 / 2, f2 / 2);
    }
    return Fcdf;
}

/**
 * Attempts to solve f(x)-v = 0
 * @param {function} f 
 * @param {number} v target value
 * @param {number} a lower limit
 * @param {number} b upper limit
 * @returns {number}
 */
export const newton = (f, v, a, b,x = null) => {
    if (x === null) x = (a+b)/2;
    const e = 0.000001;
    for (let i=0; i <30; i++) {
        let z = f(x) - v;
        if (abs(z) < 0.00001) return x;
        let dz = (f(x+e)-f(x))/e
        let xn = x - z/dz;
        if (xn < a) {
            // make a halfstep instead
            xn = (a+x)/2
        } else if (xn > b) {
            xn = (b+x)/2
        }
        x = xn
    }
    return 0
}

export const fisherCrit = (p,f1,f2) => {
    const f = curry(fisher)(+f1,+f2);
    return newton(f,1-p,0,100,5);
}

/**
* @param {Array} x - ordered x-axis values (abscissa values)
* @param {Array} y - corresponding y-axis values (ordinate values)
* @param {Number} n - number of observations
* @param {Number} f - smoother span (proportion of points which influence smoothing at each value)
* @param {Number} nsteps - number of iterations in the robust fit
* @param {Number} delta - nonnegative parameter which may be used to reduce the number of computations
* @returns {Object} sorted x-values and fitted values
*/
function _lowess( x, y, n, f, nsteps, delta ) {
	var nright;
	var denom;
	var nleft;
	var alpha;
	var cmad;
	var iter;
	var last;
	var cut;
	var res;
	var m1;
	var m2;
	var ns;
	var c1;
	var c9;
	var d1;
	var d2;
	var rw;
	var ys;
	var i;
	var j;
	var r;

	if ( n < 2 ) {
		return y;
	}
	ys = new Array( n );
	res = new Array( n );
	rw = new Array( n );

	// Use at least two and at most n points:
	ns = max( min( floor( f * n ), n ), 2 );

	// Robustness iterations:
	for ( iter = 1; iter <= nsteps + 1; iter++ ) {
		nleft = 0;
		nright = ns - 1;
		last = -1; // index of previously estimated point
		i = 0; // index of current point
		do {
			while ( nright < n - 1 ) {
				// Move nleft, nright to the right if radius decreases:
				d1 = x[ i ] - x[ nleft ];
				d2 = x[ nright + 1 ] - x[ i ];

				// If d1 <= d2 with x[nright+1] == x[nright], lowest fixes:
				if ( d1 <= d2 ) {
					break;
				}
				// Radius will not decrease by a move to the right...
				nleft += 1;
				nright += 1;
			}
			// Fitted value at x[ i ]:
			ys[ i ] = lowest( x, y, n, i, nleft, nright, res, (iter > 1), rw );

			if ( last < i - 1 ) {
				denom = x[ i ] - x[ last ];
				for ( j = last + 1; j < i; j++ ) {
					alpha = ( x[ j ] - x[ last ] ) / denom;
					ys[ j ] = ( alpha*ys[ i ] ) + ( (1.0-alpha) * ys[ last ] );
				}
			}
			last = i;
			cut = x[ last ] + delta;
			for ( i = last + 1; i < n; i++ ) {
				if ( x[ i ] > cut ) {
					break;
				}
				if ( x[ i ] === x[ last ] ) {
					ys[ i ] = ys[ last ];
					last = i;
				}
			}
			i = max( last + 1, i - 1 );
		} while ( last < n - 1 );

		// Calculate Residuals:
		for ( i = 0; i < n; i++ ) {
			res[ i ] = y[ i ] - ys[ i ];
		}
		if ( iter > nsteps ) {
			break; // Compute robustness weights except last time...
		}
		for ( i = 0; i < n; i++ ) {
			rw[i] = abs( res[i] );
		}
		rw.sort((a,b) => a-b );
		m1 = floor( n / 2.0 );
		m2 = n - m1 - 1.0;
		cmad = 3.0 * ( rw[m1] + rw[m2] );
		c9 = 0.999 * cmad;
		c1 = 0.001 * cmad;
		for ( i = 0; i < n; i++ ) {
			r = abs( res[i] );
			if ( r <= c1 ) {
				rw[ i ] = 1.0; // near 0, avoid underflow
			}
			else if ( r > c9 ) {
				rw[ i ] = 0.0;  // near 1, avoid underflow
			}
			else {
				rw[ i ] = pow( 1.0 - pow( r / cmad, 2.0 ), 2.0 );
			}
		}
	}
	return [x,ys]
}

function srange( N, x, stride ) {
	var max;
	var min;
	var ix;
	var v;
	var i;

	if ( N <= 0 ) {
		return NaN;
	}
	if ( N === 1 || stride === 0 ) {
		if ( Number.isNaN( x[ 0 ] ) ) {
			return NaN;
		}
		return 0.0;
	}
	if ( stride < 0 ) {
		ix = (1-N) * stride;
	} else {
		ix = 0;
	}
	min = x[ ix ];
	max = min;
	for ( i = 1; i < N; i++ ) {
		ix += stride;
		v = x[ ix ];
		if ( Number.isNaN( v ) ) {
			return v;
		}
		if ( v < min ) {
			min = v;
		} else if ( v > max ) {
			max = v;
		}
	}
	return ( max - min );
}



/**
* Calculates the fitted value `ys` for a value `xs` on the horizontal axis.
*
* ## Method
*
* -   The smoothed value for the x-axis value at the current index is computed using a (robust) locally weighted regression of degree one.  The tricube weight function is used with `h` equal to the maximum of `xs - x[ nleft ]` and `x[ nright ] - xs`.
*
* ## References
*
* -   Cleveland, William S. 1979. "Robust Locally and Smoothing Weighted Regression Scatterplots." _Journal of the American Statistical Association_ 74 (368): 829–36. doi:[10.1080/01621459.1979.10481038](https://doi.org/10.1080/01621459.1979.10481038).
* -   Cleveland, William S. 1981. "Lowess: A program for smoothing scatterplots by robust locally weighted regression." _American Statistician_ 35 (1): 54–55. doi:[10.2307/2683591](https://doi.org/10.2307/2683591).
*
* @param {Array} x - ordered x-axis values (abscissa values)
* @param {Array} y - corresponding y-axis values (ordinate values)
* @param {Number} n - number of observations
* @param {Number} i - current index
* @param {Number} nleft - index of the first point used in computing the fitted value
* @param {Number} nright - index of the last point used in computing the fitted value
* @param {Array} w - weights at indices from `nleft` to `nright` to be used in the calculation of the fitted value
* @param {boolean} userw - boolean indicating whether a robust fit is carried out using the weights in `rw`
* @param {Array} rw - robustness weights
* @returns {number} fitted value
*/
function lowest( x, y, n, i, nleft, nright, w, userw, rw ) {
	var range;
	var nrt;
	var h1;
	var h9;
	var xs;
	var ys;
	var h;
	var a;
	var b;
	var c;
	var r;
	var j;

	xs = x[ i ];
	range = x[ n - 1 ] - x[ 0 ];
	h = max( xs - x[ nleft ], x[ nright ] - xs );
	h9 = 0.999 * h;
	h1 = 0.001 * h;

	// Compute weights (pick up all ties on right):
	a = 0.0; // sum of weights
	for ( j = nleft; j < n; j++ ) {
		w[ j ] = 0.0;
		r = abs( x[ j ] - xs );
		if ( r <= h9 ) { // small enough for non-zero weight
			if ( r > h1 ) {
				w[ j ] = pow( 1.0-pow( r/h, 3.0 ), 3.0 );
			} else {
				w[ j ] = 1.0;
			}
			if ( userw ) {
				w[ j ] *= rw[ j ];
			}
			a += w[ j ];
		}
		else if ( x[ j ] > xs ) {
			break; // get out at first zero weight on right
		}
	}
	nrt = j - 1; // rightmost point (may be greater than `nright` because of ties)
	if ( a <= 0.0 ) {
		return y[ i ];
	}

	// Make sum of weights equal to one:
	for ( j = nleft; j <= nrt; j++ ) {
		w[ j ] /= a;
	}

	if ( h > 0.0 ) { // use linear fit
		// Find weighted center of x values:
		a = 0.0;
		for ( j = nleft; j <= nrt; j++ ) {
			a += w[ j ] * x[ j ];
		}
		b = xs - a;
		c = 0.0;
		for ( j = nleft; j <= nrt; j++ ) {
			c += w[ j ] * pow( x[ j ] - a, 2.0 );
		}
		if ( sqrt( c ) > 0.001 * range ) {
			// Points are spread out enough to compute slope:
			b /= c;
			for ( j = nleft; j <= nrt; j++ ) {
				w[ j ] *= ( 1.0 + ( b*(x[j]-a) ) );
			}
		}
	}
	ys = 0.0;
	for ( j = nleft; j <= nrt; j++ ) {
		ys += w[ j ] * y[ j ];
	}
	return ys;
}


export function lowess( x, y, options={} ) {
	var nsteps;
	var delta;
	var opts;
	var err;
	var xy;
	var f;
	var i;
	var n;
	var r;

	n = x.length;
	if ( y.length !== n ) {
		throw new Error( 'invalid arguments. Arguments `x` and `y` must have the same length.' );
	}
	opts = options;
	// Input data has to be sorted:
	if ( opts.sorted !== true ) {
		// Copy to prevent mutation and sort by x:
		xy = new Array( n );
		for ( i = 0; i < n; i++ ) {
			xy[ i ] = [ x[ i ], y[ i ] ];
		}
		xy.sort( (a,b) => a[0]-b[0] ); // TODO: Revisit once we have function for sorting multiple arrays by the elements of one of the arrays
		x = new Array( n );
		y = new Array( n );
		for ( i = 0; i < n; i++ ) {
			x[ i ] = xy[ i ][ 0 ];
			y[ i ] = xy[ i ][ 1 ];
		}
	}
	if ( opts.nsteps === void 0 ) {
		nsteps = 3;
	} else {
		nsteps = opts.nsteps;
	}
	if ( opts.f === void 0 ) {
		f = 2.0/3.0;
	} else {
		f = opts.f;
	}
	if ( opts.delta === void 0 ) {
		r = srange( n, x, 1 );
		delta = 0.01 * r;
	} else {
		delta = opts.delta;
	}
	return _lowess( x, y, n, f, nsteps, delta );
}
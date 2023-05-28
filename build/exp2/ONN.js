import { sum } from './sum.js';
const TwoPi = 2 * Math.PI;
export class ONN {
    constructor(K, f, initPhi) {
        this.K = K;
        this.f = f;
        this.N = f.length;
        if (![
            K.length,
            ...K.map((k2) => k2.length),
        ].every((size) => size === this.N)) {
            throw new RangeError('incorrect size');
        }
        this.phi = initPhi || [...f];
        this.dphi = [...f];
    }
    step(t) {
        const { phi, K, f, N, } = this;
        this.dphi = phi.map((_, i) => TwoPi * (f[i] + sum(N, (j) => K[i][j] * Math.sin(phi[j] - phi[i]))));
        this.phi = phi.map((_, i) => (phi[i] + t * this.dphi[i]) % TwoPi);
        // const dphi = phi.map((_, i) => 2 * Math.PI * (
        // 	f[i] + sum(N, (j) => K[i][j] * Math.sin(phi[j] - phi[i]))
        // ));
        // this.phi = phi.map((_, i) => phi[i] + t * (dphi[i] - phi[i]));
    }
}

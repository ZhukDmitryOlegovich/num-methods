import { M1, M2 } from './Matrix';
import { sum } from './sum';

export class ONN {
	public phi: M1;

	public dphi: M1;

	public N: number;

	constructor(
		public K: M2,
		public f: M1,
	) {
		this.N = f.length;

		if (![
			K.length,
			...K.map((k2) => k2.length),
		].every((size) => size === this.N)) {
			throw new RangeError('incorrect size');
		}

		this.phi = [...f];
		this.dphi = [...f];
	}

	step(t: number) {
		const {
			phi, K, f, N,
		} = this;
		this.dphi = phi.map((_, i) => 2 * Math.PI * (
			f[i] + sum(N, (j) => K[i][j] * Math.sin(phi[j] - phi[i]))
		));
		this.phi = phi.map((_, i) => phi[i] + t * this.dphi[i]);
		// const dphi = phi.map((_, i) => 2 * Math.PI * (
		// 	f[i] + sum(N, (j) => K[i][j] * Math.sin(phi[j] - phi[i]))
		// ));
		// this.phi = phi.map((_, i) => phi[i] + t * (dphi[i] - phi[i]));
	}
}

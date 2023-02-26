export type Point = {
	x: number,
	y: number,
	triangles: Set<Triangle>,
};

export type SimplePoint = {
	x: number,
	y: number,
};

export type Triangle = {
	points: readonly [Point, Point, Point];
};

// @ts-ignore
const test: <T>(value: T) => value is Exclude<T, null | undefined | false | 0 | ''> = Boolean;

const getNeighborTriangles = (t: Triangle) => {
	const [p1, p2, p3] = t.points;
	return [
		findOtherTriangle(p1, p2, t),
		findOtherTriangle(p2, p3, t),
		findOtherTriangle(p3, p1, t),
	].filter(test);
};

const getNeighborTrianglesPoints = (t: Triangle) => {
	const [p1, p2, p3] = t.points;
	return [
		getThirdPointFromOtherTriangle(p1, p2, t),
		getThirdPointFromOtherTriangle(p2, p3, t),
		getThirdPointFromOtherTriangle(p3, p1, t),
	].filter(test);
};

const findOtherTriangle = (
	p1: Point, p2: Point, t: Triangle,
) => {
	const p2Triangles = new Set(p2.triangles);
	return Array.from(p1.triangles).find((tt) => tt !== t && p2Triangles.has(tt));
};

const getThirdPoint = <T extends Triangle | null | undefined>(
	p1: Point, p2: Point, t: T,
): T extends Triangle ? Point : T extends null | undefined ? null : Point | null => {
	if (!t) return null as any;
	if (t.points[0] !== p1 && t.points[0] !== p2) return t.points[0] as any;
	if (t.points[1] !== p1 && t.points[1] !== p2) return t.points[1] as any;
	return t.points[2] as any;
};

const getThirdPointFromOtherTriangle = (
	p1: Point, p2: Point, t: Triangle,
) => getThirdPoint(p1, p2, findOtherTriangle(p1, p2, t));

const isNeighborTriangles = (t1: Triangle, t2: Triangle): [Point, Point] | null => {
	const set = new Set(t1.points);
	const [q1, q2, q3] = t2.points;

	if (set.has(q1)) {
		if (set.has(q2)) return [q1, q2];

		return set.has(q3) ? [q1, q3] : null;
	}

	return set.has(q2) && set.has(q3) ? [q2, q3] : null;
};

export type Config = {
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	nextStep(): Promise<boolean>;
	getPoint(): Promise<SimplePoint>;
	addPoint?: (p: SimplePoint) => Promise<void>;
	removePoint?: (p: Point) => Promise<void>;
	createTriangle?: (t: Triangle) => Promise<void>;
	removeTriangle?: (t: Triangle) => Promise<void>;
	getIncorrectTriangles?: (ts: Triangle[]) => Promise<void>;
};

type Data = {
	triangles: Set<Triangle>;
	removePoint(p: Point): Promise<void>;
	addPoint(p: SimplePoint): Promise<Point>;
	createTriangle(p1: Point, p2: Point, p3: Point): Promise<Triangle>;
	removeTriangle(t: Triangle): Promise<void>;
	getIncorrectTriangles(): Promise<Triangle[]>;
};

export const randomBetween = (from: number, to: number) => Math.random() * (to - from) + from;

const calcV = (p1: SimplePoint, p2: SimplePoint, p0: SimplePoint) => (p1.x - p0.x) * (p2.y - p1.y)
	- (p2.x - p1.x) * (p1.y - p0.y);

const triangleIncludePoint = (t: Triangle, p0: SimplePoint) => {
	const [p1, p2, p3] = t.points;
	const v1 = calcV(p1, p2, p0);
	const v2 = calcV(p2, p3, p0);
	const v3 = calcV(p3, p1, p0);

	if (v1 === 0 && v2 === 0) return 'v2' as const;
	if (v1 === 0 && v3 === 0) return 'v1' as const;
	if (v2 === 0 && v3 === 0) return 'v3' as const;

	if (v1 === 0) return 'v1-v2' as const;
	if (v2 === 0) return 'v2-v3' as const;
	if (v3 === 0) return 'v1-v3' as const;

	if (
		(v1 > 0 && v2 > 0 && v3 > 0)
		|| (v1 < 0 && v2 < 0 && v3 < 0)
	) return 'in' as const;

	return 'out' as const;
};

const checkDelaunay = (t: Triangle, p0: Point): boolean => {
	const [p1, p2, p3] = t.points;
	const sa = (p0.x - p1.x) * (p0.x - p3.x) + (p0.y - p1.y) * (p0.y - p3.y);
	const sb = (p2.x - p1.x) * (p2.x - p3.x) + (p2.y - p1.y) * (p2.y - p3.y);

	if (sa < 0 && sb < 0) return false;
	if (sa >= 0 && sb >= 0) return true;

	return ((p0.x - p1.x) * (p0.y - p3.y) - (p0.x - p3.x) * (p0.y - p1.y)) * sb
		+ ((p2.x - p1.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p2.y - p1.y)) * sa >= 0;
};

export const initDelaunay = async (config: Config) => {
	const {
		fromX, fromY, toX, toY, nextStep, getPoint, removePoint,
		createTriangle, removeTriangle, getIncorrectTriangles,
	} = config;

	const allPoints = new Set<Point>();
	const allTriangles = new Set<Triangle>();
	const trianglesFromLastCheck = new Set<Triangle>();

	const data: Data = {
		triangles: allTriangles,
		async addPoint(p) {
			const newPoint: Point = { ...p, triangles: new Set() };
			allPoints.add(newPoint);
			await config.addPoint?.(p);
			return newPoint;
		},
		async removePoint(p) {
			if (p.triangles.size) {
				throw new Error('remove not sigle point');
			}
			await removePoint?.(p);
			if (!allPoints.delete(p)) {
				throw new Error('point not include in all points');
			}
		},
		async createTriangle(...points) {
			const triangle: Triangle = { points };
			allTriangles.add(triangle);
			trianglesFromLastCheck.add(triangle);
			points.forEach((point) => point.triangles.add(triangle));
			await createTriangle?.(triangle);
			return triangle;
		},
		async removeTriangle(triangle) {
			await removeTriangle?.(triangle);
			triangle.points.forEach((point) => {
				if (!point.triangles.delete(triangle)) {
					throw new Error('remove incorrect triangle from point');
				}
			});
			if (!allTriangles.delete(triangle)) {
				throw new Error('triangle not include in all triangles');
			}
			trianglesFromLastCheck.delete(triangle);
		},
		async getIncorrectTriangles() {
			Array.from(trianglesFromLastCheck).forEach((triangle) => {
				getNeighborTriangles(triangle).forEach(
					(neighborTriangle) => trianglesFromLastCheck.add(neighborTriangle),
				);
			});

			const triangles = Array.from(trianglesFromLastCheck).filter(
				(triangle) => getNeighborTrianglesPoints(triangle).some(
					(point) => !checkDelaunay(triangle, point),
				),
			);

			await getIncorrectTriangles?.(triangles);
			trianglesFromLastCheck.clear();
			return triangles;
		},
	};

	/**
	 * Шаг 1. На первых трех исходных точках строим один треугольник.
	 * >> точнее прямоугольник =)
	 */
	{
		const p1 = await data.addPoint({ x: fromX, y: fromY });
		const p2 = await data.addPoint({ x: fromX, y: toY });
		const p3 = await data.addPoint({ x: toX, y: toY });
		const p4 = await data.addPoint({ x: toX, y: fromY });
		await data.createTriangle(p1, p2, p3);
		await data.createTriangle(p1, p4, p3);
	}

	/**
	 * Шаг 2. В цикле по n для всех остальных точек выполняем шаги 3–5.
	 */
	/* eslint-disable no-await-in-loop */
	while (await nextStep()) {
		await iterativeDelaunay(data, await data.addPoint(await getPoint()));
	}
	/* eslint-enable no-await-in-loop */
};

const iterativeDelaunay = async (data: Data, newPoint: Point) => {
	/**
	 * Шаг 3. Очередная n-я точка добавляется в уже построенную структуру триангуляции следующим образом.
	 * Вначале производится локализация точки, т.е. находится треугольник (построенный ранее), в который попадает очередная точка.
	 * >> Либо, если точка не попадает внутрь триангуляции, находится треугольник на границе триангуляции, ближайший к очередной точке.
	 * >> но этого не будет
	 */
	let lastType: ReturnType<typeof triangleIncludePoint> = 'out' as ReturnType<typeof triangleIncludePoint>;
	const triangle = Array.from(data.triangles).find((t) => {
		lastType = triangleIncludePoint(t, newPoint);
		return lastType !== 'out';
	})!;

	/**
	 * Шаг 4.
	 */
	switch (lastType) {
		/**
		 * - Если точка попала на ранее вставленный узел триангуляции, то такая точка обычно отбрасывается,
		 * иначе точка вставляется в триангуляцию в виде нового узла.
		 */
		case 'v1': case 'v2': case 'v3':
			await data.removePoint(newPoint);
			break;
		/**
		 * - При этом если точка попала на некоторое ребро, то оно разбивается на два новых,
		 * а оба смежных с ребром треугольника также делятся на два меньших.
		 */
		case 'v1-v2': case 'v1-v3': case 'v2-v3': {
			const i1 = (lastType[1] as any) - 1;
			const i2 = (lastType[4] as any) - 1;
			const pi1 = triangle.points[i1];
			const pi2 = triangle.points[i2];
			const pOur = triangle.points[0 + 1 + 2 - i1 - i2];
			const otherTriangle = findOtherTriangle(pi1, pi2, triangle);

			if (!otherTriangle) {
				throw new Error('incorrect type, not found otherTriangle');
			}

			await data.removeTriangle(triangle);
			await data.removeTriangle(otherTriangle);

			const pOther = getThirdPoint(pi1, pi2, otherTriangle);

			await data.createTriangle(pi1, pOur, newPoint);
			await data.createTriangle(pi2, pOur, newPoint);
			await data.createTriangle(pi1, pOther, newPoint);
			await data.createTriangle(pi2, pOther, newPoint);

			break;
		}
		/**
		 * - Если точка попала строго внутрь какого-нибудь треугольника, он разбивается на три новых.
		 */
		case 'in': {
			await data.removeTriangle(triangle);

			const [p1, p2, p3] = triangle.points;

			await data.createTriangle(p1, p2, newPoint);
			await data.createTriangle(p2, p3, newPoint);
			await data.createTriangle(p3, p1, newPoint);

			break;
		}
		/**
		 * >> - Если точка попала вне триангуляции, то строится один или более треугольников.
		 * >> но этого не будет
		 */
		case 'out': default: throw new Error(`incorrect lastType ${JSON.stringify(lastType)}`);
	}

	/**
	 * Шаг 5. Проводятся локальные проверки вновь полученных треугольников на соответствие условию Делоне
	 * и выполняются необходимые перестроения.
	 * >> (pdf, страница 10, теорема 1)
	 */

	let incorrectTriangles = await data.getIncorrectTriangles();
	const incorrectTrianglesSet = new Set(incorrectTriangles);
	/* eslint-disable no-await-in-loop, no-labels */
	while (incorrectTriangles.length) {
		let update = false;

		flag: for (let i = 0; i < incorrectTriangles.length; i++) {
			for (let j = i + 1; j < incorrectTriangles.length; j++) {
				const t1 = incorrectTriangles[i];
				const t2 = incorrectTriangles[j];
				const ans = isNeighborTriangles(t1, t2);

				if (ans) {
					await data.removeTriangle(t1);
					await data.removeTriangle(t2);

					incorrectTriangles[i] = incorrectTriangles[incorrectTriangles.length - 1];
					incorrectTriangles.length--;
					incorrectTriangles[j] = incorrectTriangles[incorrectTriangles.length - 1];
					incorrectTriangles.length--;

					incorrectTrianglesSet.delete(t1);
					incorrectTrianglesSet.delete(t2);

					const [p1, p3] = ans;
					const p2 = getThirdPoint(p1, p3, t1);
					const p4 = getThirdPoint(p1, p3, t2);

					await data.createTriangle(p1, p2, p4);
					await data.createTriangle(p3, p2, p4);

					update = true;

					break flag;
				}
			}
		}

		if (!update) {
			throw new Error(`fail in incorrectTriangles, length = ${incorrectTriangles.length}, size = ${incorrectTrianglesSet.size}`);
		}

		const newTriangles = await data.getIncorrectTriangles();
		newTriangles.forEach((incorrectTriangle) => incorrectTrianglesSet.add(incorrectTriangle));
		incorrectTriangles = Array.from(newTriangles);
	}
	/* eslint-enable no-await-in-loop, no-labels */
};

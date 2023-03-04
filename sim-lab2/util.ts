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

export type Config = {
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	nextStep(): Promise<boolean>;
	getPoint(): Promise<SimplePoint>;
	addPoint?: (p: Point) => Promise<void>;
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
	getIncorrectTriangles(newPoint: Point): Promise<Triangle[]>;
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

const det3 = (a: number[][]) => 0
	+ a[0][0] * a[1][1] * a[2][2]
	+ a[0][1] * a[1][2] * a[2][0]
	+ a[0][2] * a[1][0] * a[2][1]
	- a[0][2] * a[1][1] * a[2][0]
	- a[0][1] * a[1][0] * a[2][2]
	- a[0][0] * a[1][2] * a[2][1];

const checkDelaunay = (t: Triangle, p0: Point): boolean => {
	const [p1, p2, p3] = t.points;
	const x0 = p0.x;
	const y0 = p0.y;
	const x1 = p1.x;
	const y1 = p1.y;
	const x2 = p2.x;
	const y2 = p2.y;
	const x3 = p3.x;
	const y3 = p3.y;

	const s1 = x1 ** 2 + y1 ** 2;
	const s2 = x2 ** 2 + y2 ** 2;
	const s3 = x3 ** 2 + y3 ** 2;

	const a = det3([
		[x1, y1, 1],
		[x2, y2, 1],
		[x3, y3, 1],
	]);
	const b = det3([
		[s1, y1, 1],
		[s2, y2, 1],
		[s3, y3, 1],
	]);
	const c = det3([
		[s1, x1, 1],
		[s2, x2, 1],
		[s3, x3, 1],
	]);
	const d = det3([
		[s1, x1, y1],
		[s2, x2, y2],
		[s3, x3, y3],
	]);

	return Math.sign(a) * (a * (x0 ** 2 + y0 ** 2) - b * x0 + c * y0 - d) >= 0;
};

const checkDelaunay2 = (t: Triangle, p0: Point): boolean => {
	const [p1, p2, p3] = t.points;
	const sa = (p0.x - p1.x) * (p0.x - p3.x) + (p0.y - p1.y) * (p0.y - p3.y);
	const sb = (p2.x - p1.x) * (p2.x - p3.x) + (p2.y - p1.y) * (p2.y - p3.y);

	// if (sa < 0 && sb < 0) return false;
	// if (sa >= 0 && sb >= 0) return true;

	return Math.abs((p0.x - p1.x) * (p0.y - p3.y) - (p0.x - p3.x) * (p0.y - p1.y)) * sb
		+ Math.abs((p2.x - p1.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p2.y - p1.y)) * sa >= 0;
};

export const initDelaunay = async (config: Config) => {
	const {
		fromX, fromY, toX, toY, nextStep, getPoint, removePoint,
		createTriangle, removeTriangle, getIncorrectTriangles,
	} = config;

	const allPoints = new Set<Point>();
	const allTriangles = new Set<Triangle>();

	const data: Data = {
		triangles: allTriangles,
		async addPoint(p) {
			const newPoint: Point = { ...p, triangles: new Set() };
			allPoints.add(newPoint);
			await config.addPoint?.(newPoint);
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
		},
		async getIncorrectTriangles(point) {
			const triangles = Array.from(data.triangles)
				.filter((triangle) => !checkDelaunay(triangle, point));

			await getIncorrectTriangles?.(triangles);
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
	 * В итеративном алгоритме «Удаляй и строй» не выполняется никаких перестроений.
	 */
	/**
	 * Вместо этого при каждой вставке нового узла сразу же удаляются все треугольники,
	 * у которых внутрь описанных окружностей попадает новый узел.
	 * При этом все удаленные треугольники неявно образуют некоторый многоугольник.
	 */
	const incorrectTriangles = await data.getIncorrectTriangles(newPoint);
	await Promise.all(incorrectTriangles.map(data.removeTriangle));

	/**
	 * После этого на месте удаленных треугольников строится заполняющая триангуляция
	 * путем соединения нового узла с этим многоугольником.
	 */
	const grad = (p: Point) => Math.atan2(p.y - newPoint.y, p.x - newPoint.x);

	const lostPoints = [...new Set(incorrectTriangles.flatMap(({ points }) => points))]
		.sort((a, b) => grad(a) - grad(b));

	await Promise.all(lostPoints.map(
		(p, i) => data.createTriangle(p, lostPoints[(i + 1) % lostPoints.length], newPoint),
	));
};

const findOtherTriangle = (p1, p2, t) => {
    const p2Triangles = new Set(p2.triangles);
    return Array.from(p1.triangles).find((tt) => tt !== t && p2Triangles.has(tt));
};
const getThirdPoint = (p1, p2, t) => {
    if (!t)
        return null;
    if (t.points[0] !== p1 && t.points[0] !== p2)
        return t.points[0];
    if (t.points[1] !== p1 && t.points[1] !== p2)
        return t.points[1];
    return t.points[2];
};
export const randomBetween = (from, to) => Math.random() * (to - from) + from;
const calcV = (p1, p2, p0) => (p1.x - p0.x) * (p2.y - p1.y)
    - (p2.x - p1.x) * (p1.y - p0.y);
const triangleIncludePoint = (t, p0) => {
    const [p1, p2, p3] = t.points;
    const v1 = calcV(p1, p2, p0);
    const v2 = calcV(p2, p3, p0);
    const v3 = calcV(p3, p1, p0);
    if (v1 === 0 && v2 === 0)
        return 'v2';
    if (v1 === 0 && v3 === 0)
        return 'v1';
    if (v2 === 0 && v3 === 0)
        return 'v3';
    if (v1 === 0)
        return 'v1-v2';
    if (v2 === 0)
        return 'v2-v3';
    if (v3 === 0)
        return 'v1-v3';
    if ((v1 > 0 && v2 > 0 && v3 > 0)
        || (v1 < 0 && v2 < 0 && v3 < 0))
        return 'in';
    return 'out';
};
const det3 = (a) => 0
    + a[0][0] * a[1][1] * a[2][2]
    + a[0][1] * a[1][2] * a[2][0]
    + a[0][2] * a[1][0] * a[2][1]
    - a[0][2] * a[1][1] * a[2][0]
    - a[0][1] * a[1][0] * a[2][2]
    - a[0][0] * a[1][2] * a[2][1];
const checkDelaunay = (t, p0) => {
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
const checkDelaunay2 = (t, p0) => {
    const [p1, p2, p3] = t.points;
    const sa = (p0.x - p1.x) * (p0.x - p3.x) + (p0.y - p1.y) * (p0.y - p3.y);
    const sb = (p2.x - p1.x) * (p2.x - p3.x) + (p2.y - p1.y) * (p2.y - p3.y);
    // if (sa < 0 && sb < 0) return false;
    // if (sa >= 0 && sb >= 0) return true;
    return Math.abs((p0.x - p1.x) * (p0.y - p3.y) - (p0.x - p3.x) * (p0.y - p1.y)) * sb
        + Math.abs((p2.x - p1.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p2.y - p1.y)) * sa >= 0;
};
export const initDelaunay = async (config) => {
    const { fromX, fromY, toX, toY, nextStep, getPoint, removePoint, createTriangle, removeTriangle, getIncorrectTriangles, } = config;
    const allPoints = new Set();
    const allTriangles = new Set();
    const data = {
        triangles: allTriangles,
        async addPoint(p) {
            const newPoint = { ...p, triangles: new Set() };
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
            const triangle = { points };
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
const iterativeDelaunay = async (data, newPoint) => {
    /**
     * Шаг 3. Очередная n-я точка добавляется в уже построенную структуру триангуляции следующим образом.
     * Вначале производится локализация точки, т.е. находится треугольник (построенный ранее), в который попадает очередная точка.
     * >> Либо, если точка не попадает внутрь триангуляции, находится треугольник на границе триангуляции, ближайший к очередной точке.
     * >> но этого не будет
     */
    // let lastType: ReturnType<typeof triangleIncludePoint> = 'out' as ReturnType<typeof triangleIncludePoint>;
    // const triangle = Array.from(data.triangles).find((t) => {
    // 	lastType = triangleIncludePoint(t, newPoint);
    // 	return lastType !== 'out';
    // })!;
    /**
     * Шаг 4.
     */
    // switch (lastType) {
    // 	/**
    // 	 * - Если точка попала на ранее вставленный узел триангуляции, то такая точка обычно отбрасывается,
    // 	 * иначе точка вставляется в триангуляцию в виде нового узла.
    // 	 */
    // 	case 'v1': case 'v2': case 'v3':
    // 		await data.removePoint(newPoint);
    // 		break;
    // 	/**
    // 	 * - При этом если точка попала на некоторое ребро, то оно разбивается на два новых,
    // 	 * а оба смежных с ребром треугольника также делятся на два меньших.
    // 	 */
    // 	case 'v1-v2': case 'v1-v3': case 'v2-v3': {
    // 		const i1 = (lastType[1] as any) - 1;
    // 		const i2 = (lastType[4] as any) - 1;
    // 		const pi1 = triangle.points[i1];
    // 		const pi2 = triangle.points[i2];
    // 		const pOur = triangle.points[0 + 1 + 2 - i1 - i2];
    // 		const otherTriangle = findOtherTriangle(pi1, pi2, triangle);
    // 		if (!otherTriangle) {
    // 			throw new Error('incorrect type, not found otherTriangle');
    // 		}
    // 		await data.removeTriangle(triangle);
    // 		await data.removeTriangle(otherTriangle);
    // 		const pOther = getThirdPoint(pi1, pi2, otherTriangle);
    // 		await data.createTriangle(pi1, pOur, newPoint);
    // 		await data.createTriangle(pi2, pOur, newPoint);
    // 		await data.createTriangle(pi1, pOther, newPoint);
    // 		await data.createTriangle(pi2, pOther, newPoint);
    // 		break;
    // 	}
    // 	/**
    // 	 * - Если точка попала строго внутрь какого-нибудь треугольника, он разбивается на три новых.
    // 	 */
    // 	case 'in': {
    // 		await data.removeTriangle(triangle);
    // 		const [p1, p2, p3] = triangle.points;
    // 		await data.createTriangle(p1, p2, newPoint);
    // 		await data.createTriangle(p2, p3, newPoint);
    // 		await data.createTriangle(p3, p1, newPoint);
    // 		break;
    // 	}
    // 	/**
    // 	 * >> - Если точка попала вне триангуляции, то строится один или более треугольников.
    // 	 * >> но этого не будет
    // 	 */
    // 	case 'out': default: throw new Error(`incorrect lastType ${JSON.stringify(lastType)}`);
    // }
    /**
     * Шаг 5. Проводятся локальные проверки вновь полученных треугольников на соответствие условию Делоне
     * и выполняются необходимые перестроения.
     */
    const incorrectTriangles = await data.getIncorrectTriangles(newPoint);
    await Promise.all(incorrectTriangles.map(data.removeTriangle));
    const grad = (p) => Math.atan2(p.y - newPoint.y, p.x - newPoint.x);
    const lostPoints = [...new Set(incorrectTriangles.flatMap(({ points }) => points))]
        .sort((a, b) => grad(a) - grad(b));
    await Promise.all(lostPoints.map((p, i) => data.createTriangle(p, lostPoints[(i + 1) % lostPoints.length], newPoint)));
};

import { Vector } from '../../core';
import { Viewport } from '../../designer-extension';

export class CenteredViewportCalculator {
	public static center(padding: number, canvasSize: Vector, rootComponentSize: Vector): Viewport {
		if (canvasSize.x === 0 || canvasSize.y === 0) {
			return {
				position: new Vector(0, 0),
				scale: 1
			};
		}

		const canvasSafeWidth = Math.max(canvasSize.x - padding * 2, 0);
		const canvasSafeHeight = Math.max(canvasSize.y - padding * 2, 0);

		const scale = Math.min(Math.min(canvasSafeWidth / rootComponentSize.x, canvasSafeHeight / rootComponentSize.y), 1);
		const width = rootComponentSize.x * scale;
		const height = rootComponentSize.y * scale;

		const x = Math.max(0, (canvasSize.x - width) / 2);
		const y = Math.max(0, (canvasSize.y - height) / 2);

		return {
			position: new Vector(x, y),
			scale
		};
	}

	public static getFocusedOnComponent(
		canvasSize: Vector,
		viewport: Viewport,
		componentPosition: Vector,
		componentSize: Vector
	): Viewport {
		const realPosition = viewport.position.divideByScalar(viewport.scale).subtract(componentPosition.divideByScalar(viewport.scale));
		const componentOffset = componentSize.divideByScalar(2);

		const position = realPosition.add(canvasSize.divideByScalar(2)).subtract(componentOffset);
		return { position, scale: 1 };
	}
}

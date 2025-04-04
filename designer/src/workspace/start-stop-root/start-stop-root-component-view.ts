import { Icons, Vector } from '../../core';
import { Dom } from '../../core/dom';
import { Sequence } from '../../definition';
import { ComponentView, Placeholder, PlaceholderDirection, SequenceComponent } from '../component';
import { ComponentContext } from '../../component-context';
import { DefaultSequenceComponent } from '../sequence/default-sequence-component';
import { SequencePlaceIndicator } from '../../designer-extension';
import { Badges } from '../badges/badges';
import { StartStopRootComponentViewConfiguration } from './start-stop-root-component-view-configuration';

export class StartStopRootComponentView implements ComponentView {
	public static create(
		parent: SVGElement,
		sequence: Sequence,
		parentPlaceIndicator: SequencePlaceIndicator | null,
		context: ComponentContext,
		cfg: StartStopRootComponentViewConfiguration
	): StartStopRootComponentView {
		const g = Dom.svg('g', {
			class: 'sqd-root-start-stop'
		});
		parent.appendChild(g);

		const sequenceComponent = DefaultSequenceComponent.create(
			g,
			{
				sequence,
				depth: 0,
				isInputConnected: true,
				isOutputConnected: true,
				isPreview: false
			},
			context
		);
		const view = sequenceComponent.view;

		const x = view.joinX - cfg.size / 2;
		const endY = cfg.size + view.height;

		const iconSize = parentPlaceIndicator ? cfg.folderIconSize : cfg.defaultIconSize;
		const startCircle = createCircle('start', parentPlaceIndicator ? cfg.folderIconD : cfg.startIconD, cfg.size, iconSize);
		Dom.translate(startCircle, x, 0);
		g.appendChild(startCircle);

		Dom.translate(view.g, 0, cfg.size);

		const stopCircle = createCircle('stop', parentPlaceIndicator ? cfg.folderIconD : cfg.stopIconD, cfg.size, iconSize);
		Dom.translate(stopCircle, x, endY);
		g.appendChild(stopCircle);

		let startPlaceholder: Placeholder | null = null;
		let endPlaceholder: Placeholder | null = null;
		if (parentPlaceIndicator) {
			const size = new Vector(cfg.size, cfg.size);
			startPlaceholder = context.services.placeholder.createForArea(
				g,
				size,
				PlaceholderDirection.out,
				parentPlaceIndicator.sequence,
				parentPlaceIndicator.index
			);
			endPlaceholder = context.services.placeholder.createForArea(
				g,
				size,
				PlaceholderDirection.out,
				parentPlaceIndicator.sequence,
				parentPlaceIndicator.index
			);

			Dom.translate(startPlaceholder.view.g, x, 0);
			Dom.translate(endPlaceholder.view.g, x, endY);
		}

		const badges = Badges.createForRoot(g, new Vector(x + cfg.size, 0), context);

		return new StartStopRootComponentView(
			g,
			view.width,
			view.height + cfg.size * 2,
			view.joinX,
			sequenceComponent,
			startPlaceholder,
			endPlaceholder,
			badges
		);
	}

	private constructor(
		public readonly g: SVGGElement,
		public readonly width: number,
		public readonly height: number,
		public readonly joinX: number,
		public readonly component: SequenceComponent,
		public readonly startPlaceholder: Placeholder | null,
		public readonly endPlaceholder: Placeholder | null,
		public readonly badges: Badges
	) {}

	public destroy() {
		this.g.parentNode?.removeChild(this.g);
	}
}

function createCircle(classSuffix: string, d: string, size: number, iconSize: number): SVGGElement {
	const g = Dom.svg('g', {
		class: 'sqd-root-start-stop-' + classSuffix
	});

	const r = size / 2;
	const circle = Dom.svg('circle', {
		class: 'sqd-root-start-stop-circle',
		cx: r,
		cy: r,
		r: r
	});
	g.appendChild(circle);

	const offset = (size - iconSize) / 2;
	const icon = Icons.appendPath(g, 'sqd-root-start-stop-icon', d, iconSize);
	Dom.translate(icon, offset, offset);
	return g;
}

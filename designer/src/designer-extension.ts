import { WorkspaceApi } from './api';
import { DesignerApi } from './api/designer-api';
import { ViewportApi } from './api/viewport-api';
import { Behavior } from './behaviors';
import { ComponentContext } from './component-context';
import { Vector } from './core';
import { CustomActionController } from './custom-action-controller';
import { ComponentType, Definition, Sequence, Step } from './definition';
import { I18n } from './designer-configuration';
import {
	Badge,
	ClickCommand,
	ClickDetails,
	Component,
	Placeholder,
	PlaceholderDirection,
	SequenceComponent,
	StepComponentView
} from './workspace';

export interface DesignerExtension {
	steps?: StepExtension[];
	stepComponentViewWrapper?: StepComponentViewWrapperExtension;
	stepBadgesDecorator?: StepBadgesDecoratorExtension;
	clickBehaviorWrapperExtension?: ClickBehaviorWrapperExtension;
	badges?: BadgeExtension[];
	uiComponents?: UiComponentExtension[];
	draggedComponent?: DraggedComponentExtension;
	wheelController?: WheelControllerExtension;
	viewportController?: ViewportControllerExtension;
	placeholderController?: PlaceholderControllerExtension;
	placeholder?: PlaceholderExtension;
	regionComponentView?: RegionComponentViewExtension;
	grid?: GridExtension;
	rootComponent?: RootComponentExtension;
	sequenceComponent?: SequenceComponentExtension;
	contextMenu?: ContextMenuExtension;
	daemons?: DaemonExtension[];
}

// StepExtension

export interface StepExtension<S extends Step = Step> {
	componentType: ComponentType;
	createComponentView(parentElement: SVGElement, stepContext: StepContext<S>, viewContext: StepComponentViewContext): StepComponentView;
}

export type StepComponentViewFactory = StepExtension['createComponentView'];

export interface StepComponentViewContext {
	i18n: I18n;
	getStepName(): string;
	getStepIconUrl(): string | null;
	createSequenceComponent(parentElement: SVGElement, sequence: Sequence): SequenceComponent;
	createPlaceholderForArea(
		parentElement: SVGElement,
		size: Vector,
		direction: PlaceholderDirection,
		sequence: Sequence,
		index: number
	): Placeholder;
	createRegionComponentView(
		parentElement: SVGElement,
		componentClassName: string,
		contentFactory: RegionComponentViewContentFactory
	): StepComponentView;
	getPreference(key: string): string | null;
	setPreference(key: string, value: string): void;
}

export interface StepContext<S extends Step = Step> {
	parentSequence: Sequence;
	step: S;
	depth: number;
	position: number;
	isInputConnected: boolean;
	isOutputConnected: boolean;
	isPreview: boolean;
}

export interface SequenceContext {
	sequence: Sequence;
	depth: number;
	isInputConnected: boolean;
	isOutputConnected: boolean;
	isPreview: boolean;
}

// StepComponentViewWrapperExtension

export interface StepComponentViewWrapperExtension {
	wrap(view: StepComponentView, stepContext: StepContext): StepComponentView;
}

// StepBadgesDecoratorExtension

export interface StepBadgesDecoratorExtension {
	create(g: SVGGElement, view: StepComponentView, badges: (Badge | null)[]): BadgesDecorator;
}

export interface BadgesDecorator {
	update(): void;
}

// ClickBehaviorWrapperExtension

export interface ClickBehaviorWrapperExtension {
	create(customActionController: CustomActionController): ClickBehaviorWrapper;
}

export interface ClickBehaviorWrapper {
	wrap(behavior: Behavior, commandOrNull: ClickCommand | null): Behavior;
}

// BadgeExtension

export interface BadgeExtension {
	id: string;
	createForStep(parentElement: SVGElement, view: StepComponentView, stepContext: StepContext, componentContext: ComponentContext): Badge;
	createForRoot?: (parentElement: SVGElement, componentContext: ComponentContext) => Badge;
	createStartValue(): unknown;
}

// WheelControllerExtension

export interface WheelControllerExtension {
	create(viewportApi: ViewportApi, workspaceApi: WorkspaceApi): WheelController;
}

export interface WheelController {
	onWheel(e: WheelEvent): void;
}

// UiComponentExtension

export interface UiComponentExtension {
	create(root: HTMLElement, api: DesignerApi): UiComponent;
}

export interface UiComponent {
	updateLayout(): void;
	destroy(): void;
}

// DraggedComponentExtension

export interface DraggedComponentExtension {
	create(parentElement: HTMLElement, step: Step, componentContext: ComponentContext): DraggedComponent;
}

export interface DraggedComponent {
	width: number;
	height: number;
	destroy(): void;
}

// GridExtension

export interface GridExtension {
	create(): Grid;
}

export interface Grid {
	size: Vector;
	element: SVGElement;
	setScale(scale: number, scaledSize: Vector): void;
}

// RootComponentExtension

export interface RootComponentExtension {
	create(
		parentElement: SVGElement,
		sequence: Sequence,
		parentPlaceIndicator: SequencePlaceIndicator | null,
		context: ComponentContext
	): Component;
}

export interface SequencePlaceIndicator {
	sequence: Sequence;
	index: number;
}

// SequenceComponentExtension

export interface SequenceComponentExtension {
	create(parentElement: SVGElement, sequenceContext: SequenceContext, componentContext: ComponentContext): SequenceComponent;
}

// ContextMenuExtension

export interface ContextMenuExtension {
	createItemsProvider?: (customActionController: CustomActionController) => ContextMenuItemsProvider;
}

export interface ContextMenuItemsProvider {
	getItems(step: Step | null, parentSequence: Sequence, definition: Definition): ContextMenuItem[];
}

export interface ContextMenuItem {
	readonly label: string;
	readonly order: number;
	readonly callback?: () => void;
}

// PlaceholderControllerExtension

export interface PlaceholderControllerExtension {
	create(): PlaceholderController;
}

export interface PlaceholderController {
	canCreate(sequence: Sequence, index: number): boolean;
	canShow?: (sequence: Sequence, index: number, draggingStepComponentType: ComponentType, draggingStepType: string) => boolean;
}

// PlaceholderExtension

export interface PlaceholderExtension {
	gapSize: Vector;
	createForGap(parentElement: SVGElement, sequence: Sequence, index: number): Placeholder;
	createForArea(parentElement: SVGElement, size: Vector, direction: PlaceholderDirection, sequence: Sequence, index: number): Placeholder;
}

// ViewportControllerExtension

export interface ViewportControllerExtension {
	create(api: WorkspaceApi): ViewportController;
}

export interface ViewportController {
	smoothDeltaYLimit: number;
	getDefault(): Viewport;
	getZoomed(direction: boolean): Viewport | null;
	getFocusedOnComponent(componentPosition: Vector, componentSize: Vector): Viewport;
	getNextScale(scale: number, direction: boolean): NextScale;
	limitScale(scale: number): number;
}

export interface NextScale {
	current: number;
	next: number;
}

export interface Viewport {
	readonly position: Vector;
	readonly scale: number;
}

// DaemonExtension

export interface DaemonExtension {
	create(api: DesignerApi): Daemon;
}

export interface Daemon {
	destroy(): void;
}

// RegionComponentViewExtension

export interface RegionView {
	getClientPosition(): Vector;
	/**
	 * @returns `true` if the click is inside the region, `null` if it's outside. The view may return a command to be executed.
	 */
	resolveClick(click: ClickDetails): true | ClickCommand | null;
	setIsSelected(isSelected: boolean): void;
}

export type RegionViewFactory = (parent: SVGElement, widths: number[], height: number) => RegionView;

export type RegionComponentViewContentFactory = (g: SVGGElement, regionViewFactory: RegionViewFactory) => StepComponentView;

export interface RegionComponentViewExtension {
	create(
		parentElement: SVGElement,
		componentClassName: string,
		stepContext: StepContext,
		viewContext: StepComponentViewContext,
		contentFactory: RegionComponentViewContentFactory
	): StepComponentView;
}

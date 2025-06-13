import { ControlBarView } from './control-bar-view';
import { UiComponent } from '../designer-extension';
import { ControlBarApi } from '../api/control-bar-api';
import { DesignerApi } from '../api/designer-api';
import { ViewportApi } from '../api';

export class ControlBar implements UiComponent {
	public static create(parent: HTMLElement, api: DesignerApi): UiComponent {
		const isUndoRedoSupported = api.controlBar.isUndoRedoSupported();
		const view = ControlBarView.create(parent, isUndoRedoSupported, api.i18n);
		const bar = new ControlBar(view, api.controlBar, api.viewport, isUndoRedoSupported);

		view.bindResetButtonClick(() => bar.onResetButtonClicked());
		view.bindZoomInButtonClick(() => bar.onZoomInButtonClicked());
		view.bindZoomOutButtonClick(() => bar.onZoomOutButtonClicked());
		view.bindDisableDragButtonClick(() => bar.onMoveButtonClicked());
		view.bindDeleteButtonClick(() => bar.onDeleteButtonClicked());
		api.controlBar.onStateChanged.subscribe(() => bar.refreshButtons());

		if (isUndoRedoSupported) {
			view.bindUndoButtonClick(() => bar.onUndoButtonClicked());
			view.bindRedoButtonClick(() => bar.onRedoButtonClicked());
		}

		bar.refreshButtons();
		return bar;
	}

	private constructor(
		private readonly view: ControlBarView,
		private readonly controlBarApi: ControlBarApi,
		private readonly viewportApi: ViewportApi,
		private readonly isUndoRedoSupported: boolean
	) {}

	public updateLayout() {
		//
	}

	public destroy() {
		//
	}

	private onResetButtonClicked() {
		this.viewportApi.resetViewport();
	}

	private onZoomInButtonClicked() {
		this.viewportApi.zoom(true);
	}

	private onZoomOutButtonClicked() {
		this.viewportApi.zoom(false);
	}

	private onMoveButtonClicked() {
		this.controlBarApi.toggleIsDragDisabled();
	}

	private onUndoButtonClicked() {
		this.controlBarApi.tryUndo();
	}

	private onRedoButtonClicked() {
		this.controlBarApi.tryRedo();
	}

	private onDeleteButtonClicked() {
		this.controlBarApi.tryDelete();
	}

	private refreshButtons() {
		this.refreshDeleteButtonVisibility();
		this.refreshIsDragDisabled();
		if (this.isUndoRedoSupported) {
			this.refreshUndoRedoAvailability();
		}
	}

	//

	private refreshIsDragDisabled() {
		const isDragDisabled = this.controlBarApi.isDragDisabled();
		this.view.setDisableDragButtonDisabled(!isDragDisabled);
	}

	private refreshUndoRedoAvailability() {
		const canUndo = this.controlBarApi.canUndo();
		const canRedo = this.controlBarApi.canRedo();
		this.view.setUndoButtonDisabled(!canUndo);
		this.view.setRedoButtonDisabled(!canRedo);
	}

	private refreshDeleteButtonVisibility() {
		const canDelete = this.controlBarApi.canDelete();
		this.view.setIsDeleteButtonHidden(!canDelete);
	}
}

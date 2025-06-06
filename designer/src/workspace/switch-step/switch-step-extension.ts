import { BranchedStep } from '../../definition';
import { StepExtension } from '../../designer-extension';
import { createSwitchStepComponentViewFactory } from './switch-step-component-view';
import { SwitchStepExtensionConfiguration } from './switch-step-extension-configuration';

const defaultConfiguration: SwitchStepExtensionConfiguration = {
	view: {
		minBranchWidth: 88,
		paddingX: 20,
		paddingTop1: 0,
		paddingTop2: 22,
		connectionHeight: 20,
		noBranchPaddingBottom: 24,
		inputSize: 18,
		inputIconSize: 14,
		inputRadius: 4,
		autoHideInputOnDrag: true,
		branchNameLabel: {
			height: 22,
			paddingX: 10,
			minWidth: 50,
			radius: 10
		},
		nameLabel: {
			height: 22,
			paddingX: 10,
			minWidth: 50,
			radius: 10
		}
	}
};

export class SwitchStepExtension implements StepExtension<BranchedStep> {
	public static create(configuration?: SwitchStepExtensionConfiguration): SwitchStepExtension {
		return new SwitchStepExtension(configuration ?? defaultConfiguration);
	}

	public readonly componentType = 'switch';

	private constructor(private readonly configuration: SwitchStepExtensionConfiguration) {}

	public readonly createComponentView = createSwitchStepComponentViewFactory(this.configuration.view);
}

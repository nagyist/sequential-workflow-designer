import { Dom } from '../../core/dom';
import { Vector } from '../../core/vector';
import { BranchedStep } from '../../definition';
import { JoinView } from '../common-views/join-view';
import { LabelView } from '../common-views/label-view';
import { InputView } from '../common-views/input-view';
import { ClickDetails, StepComponentView, ClickCommand } from '../component';
import { StepComponentViewContext, StepComponentViewFactory, StepContext } from '../../designer-extension';
import { SwitchStepComponentViewConfiguration } from './switch-step-component-view-configuration';

const COMPONENT_CLASS_NAME = 'switch';

export const createSwitchStepComponentViewFactory =
	(cfg: SwitchStepComponentViewConfiguration): StepComponentViewFactory =>
	(parent: SVGElement, stepContext: StepContext<BranchedStep>, viewContext: StepComponentViewContext): StepComponentView => {
		return viewContext.createRegionComponentView(parent, COMPONENT_CLASS_NAME, (g, regionViewBuilder) => {
			const step = stepContext.step;
			const paddingTop = cfg.paddingTop1 + cfg.paddingTop2;

			const branchNames = Object.keys(step.branches);
			const branchComponents = branchNames.map(branchName => {
				return viewContext.createSequenceComponent(g, step.branches[branchName]);
			});

			const branchLabelViews = branchNames.map(branchName => {
				const labelY = paddingTop + cfg.nameLabel.height + cfg.connectionHeight;
				const translatedBranchName = viewContext.i18n(`stepComponent.${step.type}.branchName`, branchName);
				return LabelView.create(g, labelY, cfg.branchNameLabel, translatedBranchName, 'secondary');
			});

			const name = viewContext.getStepName();
			const nameLabelView = LabelView.create(g, paddingTop, cfg.nameLabel, name, 'primary');

			let prevOffsetX = 0;
			const branchSizes = branchComponents.map((component, i) => {
				const halfOfWidestBranchElement = Math.max(branchLabelViews[i].width, cfg.minContainerWidth) / 2;

				const branchOffsetLeft = Math.max(halfOfWidestBranchElement - component.view.joinX, 0) + cfg.paddingX;
				const branchOffsetRight =
					Math.max(halfOfWidestBranchElement - (component.view.width - component.view.joinX), 0) + cfg.paddingX;

				const width: number = component.view.width + branchOffsetLeft + branchOffsetRight;
				const joinX = component.view.joinX + branchOffsetLeft;

				const offsetX = prevOffsetX;
				prevOffsetX += width;
				return { width, branchOffsetLeft, offsetX, joinX };
			});

			const centerBranchIndex = Math.floor(branchNames.length / 2);
			const centerBranchSize = branchSizes[centerBranchIndex];
			let joinX = centerBranchSize.offsetX;
			if (branchNames.length % 2 !== 0) {
				joinX += centerBranchSize.joinX;
			}

			const totalBranchesWidth = branchSizes.reduce((result, s) => result + s.width, 0);
			const maxBranchesHeight = Math.max(...branchComponents.map(s => s.view.height));

			const halfOfWidestSwitchElement = nameLabelView.width / 2 + cfg.paddingX;
			const switchOffsetLeft = Math.max(halfOfWidestSwitchElement - joinX, 0);
			const switchOffsetRight = Math.max(halfOfWidestSwitchElement - (totalBranchesWidth - joinX), 0);

			const viewWidth = switchOffsetLeft + totalBranchesWidth + switchOffsetRight;
			const viewHeight =
				maxBranchesHeight + paddingTop + cfg.nameLabel.height + cfg.branchNameLabel.height + cfg.connectionHeight * 2;

			const shiftedJoinX = switchOffsetLeft + joinX;
			Dom.translate(nameLabelView.g, shiftedJoinX, 0);

			const branchOffsetTop = paddingTop + cfg.nameLabel.height + cfg.branchNameLabel.height + cfg.connectionHeight;

			branchComponents.forEach((component, i) => {
				const branchSize = branchSizes[i];
				const branchOffsetLeft = switchOffsetLeft + branchSize.offsetX + branchSize.branchOffsetLeft;

				Dom.translate(branchLabelViews[i].g, switchOffsetLeft + branchSize.offsetX + branchSize.joinX, 0);
				Dom.translate(component.view.g, branchOffsetLeft, branchOffsetTop);

				if (component.hasOutput && stepContext.isOutputConnected) {
					const endOffsetTopOfComponent =
						paddingTop + cfg.nameLabel.height + cfg.branchNameLabel.height + cfg.connectionHeight + component.view.height;
					const missingHeight = viewHeight - endOffsetTopOfComponent - cfg.connectionHeight;
					if (missingHeight > 0) {
						JoinView.createStraightJoin(
							g,
							new Vector(switchOffsetLeft + branchSize.offsetX + branchSize.joinX, endOffsetTopOfComponent),
							missingHeight
						);
					}
				}
			});

			let inputView: InputView | null = null;
			if (cfg.inputSize > 0) {
				const iconUrl = viewContext.getStepIconUrl();
				inputView = InputView.createRectInput(
					g,
					shiftedJoinX,
					cfg.paddingTop1,
					cfg.inputSize,
					cfg.inputRadius,
					cfg.inputIconSize,
					iconUrl
				);
			}

			JoinView.createStraightJoin(g, new Vector(shiftedJoinX, 0), paddingTop);

			JoinView.createJoins(
				g,
				new Vector(shiftedJoinX, paddingTop + cfg.nameLabel.height),
				branchSizes.map(
					o => new Vector(switchOffsetLeft + o.offsetX + o.joinX, paddingTop + cfg.nameLabel.height + cfg.connectionHeight)
				)
			);

			if (stepContext.isOutputConnected) {
				const ongoingSequenceIndexes = branchComponents
					.map((component, index) => (component.hasOutput ? index : null))
					.filter(index => index !== null) as number[];
				const ongoingJoinTargets = ongoingSequenceIndexes.map(
					(i: number) =>
						new Vector(
							switchOffsetLeft + branchSizes[i].offsetX + branchSizes[i].joinX,
							paddingTop + cfg.connectionHeight + cfg.nameLabel.height + cfg.branchNameLabel.height + maxBranchesHeight
						)
				);
				if (ongoingJoinTargets.length > 0) {
					JoinView.createJoins(g, new Vector(shiftedJoinX, viewHeight), ongoingJoinTargets);
				}
			}

			const regions = branchSizes.map(s => s.width);
			regions[0] += switchOffsetLeft;
			regions[regions.length - 1] += switchOffsetRight;
			const regionView = regionViewBuilder(g, regions, viewHeight);

			return {
				g,
				width: viewWidth,
				height: viewHeight,
				joinX: shiftedJoinX,
				placeholders: null,
				sequenceComponents: branchComponents,
				hasOutput: branchComponents.some(c => c.hasOutput),

				getClientPosition(): Vector {
					return regionView.getClientPosition();
				},

				resolveClick(click: ClickDetails): true | ClickCommand | null {
					const result = regionView.resolveClick(click);
					return result === true || (result === null && g.contains(click.element)) ? true : result;
				},

				setIsDragging(isDragging: boolean) {
					if (cfg.autoHideInputOnDrag && inputView) {
						inputView.setIsHidden(isDragging);
					}
				},

				setIsSelected(isSelected: boolean) {
					regionView.setIsSelected(isSelected);
				},

				setIsDisabled(isDisabled: boolean) {
					Dom.toggleClass(g, isDisabled, 'sqd-disabled');
				}
			};
		});
	};

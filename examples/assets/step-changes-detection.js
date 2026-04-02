/* global document, sequentialWorkflowDesigner */

const uid = sequentialWorkflowDesigner.Uid.next;

function createTaskStep(name) {
	return {
		id: uid(),
		name,
		componentType: 'task',
		type: 'task',
		properties: {}
	};
}

function createIfStep(name, t, f) {
	return {
		id: uid(),
		name,
		componentType: 'switch',
		type: 'switch',
		properties: {},
		branches: {
			True: t,
			False: f
		}
	};
}

const configuration = {
	theme: 'soft',
	undoStackSize: 10,
	steps: {
		iconUrlProvider: () => './assets/icon-trigger.svg'
	},
	toolbox: {
		groups: [
			{
				name: 'Steps',
				steps: [createIfStep('If', [], []), createTaskStep('Pear'), createTaskStep('Cucumber'), createTaskStep('Tomato')]
			}
		]
	},
	editors: false,
	controlBar: true
};

class ChangeDetector {
	constructor(definition, onChange) {
		this.walker = new sequentialWorkflowDesigner.DefinitionWalker();
		this.lastMap = this.extractMap(definition);
		this.onChange = onChange;
	}

	extractMap(definition) {
		const map = new Map();
		this.walker.forEach(definition, step => map.set(step.id, step.name));
		return map;
	}

	detect(newDefinition) {
		const newMap = this.extractMap(newDefinition);
		const added = [];
		const removed = [];
		for (const [id, name] of newMap) {
			if (!this.lastMap.has(id)) {
				added.push([id, name]);
			}
		}
		for (const [id, name] of this.lastMap) {
			if (!newMap.has(id)) {
				removed.push([id, name]);
			}
		}
		this.lastMap = newMap;
		this.onChange({ added, removed });
	}
}

const startDefinition = {
	properties: {},
	sequence: [createTaskStep('Apple'), createIfStep('If', [createTaskStep('Banana')], [createTaskStep('Lemon')])]
};

const placeholder = document.getElementById('designer');
const recentChanges = document.getElementById('recentChanges');
const designer = sequentialWorkflowDesigner.Designer.create(placeholder, startDefinition, configuration);

const detector = new ChangeDetector(startDefinition, changes => {
	let diff = '';
	if (changes.added.length > 0) {
		diff += `📗 Added: ${changes.added.map(r => r[1]).join(', ')}`;
	}
	if (changes.removed.length > 0) {
		diff += `❌ Removed: ${changes.removed.map(r => r[1]).join(', ')}`;
	}
	if (!diff) {
		diff = 'No changes';
	}
	recentChanges.textContent = diff;
});
designer.onDefinitionChanged.subscribe(event => detector.detect(event.definition));

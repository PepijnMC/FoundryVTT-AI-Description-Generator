import { registerSettings } from './settings.js';
import { registerAPI } from './api.js';
import { migrationHandler } from './migration/migration_handler.js';
import { constructPrompt } from './generator.js';
import { addChatCommands } from './chat_commands.js';

//Register the settings and api function when Foundry is ready.
Hooks.once('init', () => {
	registerSettings();
});

Hooks.once('ready', () => {
	registerAPI();
	migrationHandler();
});

//Add a new button to the header of the actor sheet.
Hooks.on('getActorSheetHeaderButtons', (sheet, headerButtons) => {
	if (!game.user.isGM) return;
	const actor = sheet.object;
	const actorType = actor.type;
	if (actorType === 'character') {
		const actorData = actor.getRollData();
		const lineageContext = actorData.details.race;
		const classContext = Object.keys(actorData.classes).join('/');
		const appearanceContext = actorData.details.appearance;
		
		const subject = `${lineageContext} ${classContext} player character`;
		const subjectContext = `who is/has ${appearanceContext}`;
		headerButtons.unshift({
			label: 'GPT-3',
			icon: 'fas fa-comment-dots',
			class: 'gpt-actor-button',
			onclick: () => {
				constructPrompt(
					game.settings.get('ai-description-generator', 'language'),
					game.settings.get('ai-description-generator', 'system'),
					game.settings.get('ai-description-generator', 'world'),
					subject,
					subjectContext,
					'cool short visual'
				);
			}
		});
	}
	else {
		const subjectTypeMapping = {'npc': 'creature', 'vehicle': 'vehicle', 'group': 'group'};

		headerButtons.unshift({
			label: 'GPT-3',
			icon: 'fas fa-comment-dots',
			class: 'gpt-actor-button',
			onclick: () => {
				constructPrompt(
					game.settings.get('ai-description-generator', 'language'),
					game.settings.get('ai-description-generator', 'system'),
					game.settings.get('ai-description-generator', 'world'),
					actor.name,
					subjectTypeMapping[actorType],
					'cool short sensory'
				);
			}
		});
	}
});

//Add a new button the the header of the itme sheet. Spells are also considered items.
Hooks.on('getItemSheetHeaderButtons', (sheet, headerButtons) => {
	if (!game.user.isGM) return;
	const actor = sheet?.actor
	var actorContext = ''
	if (actor) {
		switch (actor.type) {
			case 'character':
				actorContext = ' from a player character';
				break;
			case 'npc':
				actorContext = ` from a ${actor.name} creature`;
				break;
			case 'vehicle':
				actorContext = ` from a ${actor.name} vehicle`;
				break;
			case 'group':
				actorContext = ` from a group of ${actor.name}`;
				break;
		}
	}
	const subjectTypeMapping = {'item': 'item', 'weapon': `attack${actorContext}`, 'spell': `spell${actorContext}`, 'feat': `feature${actorContext}`};
	var subjectType = sheet.object.type;
	if (subjectType in subjectTypeMapping) {
		headerButtons.unshift({
			label: 'GPT-3',
			icon: 'fas fa-comment-dots',
			class: 'gpt-actor-button',
			onclick: () => {
				constructPrompt(
					game.settings.get('ai-description-generator', 'language'),
					game.settings.get('ai-description-generator', 'system'),
					game.settings.get('ai-description-generator', 'world'),
					sheet.object.name,
					subjectTypeMapping[subjectType],
					'cool short sensory'
				);
			}
		})
	}
	
});

Hooks.on('chatMessage', addChatCommands);
import {registerSettings } from './settings.js';
import { registerAPI } from './api.js';
import { constructPrompt } from './generator.js';
import { addChatCommands } from './chat_commands.js';

//Register the settings and api function when Foundry is ready.
Hooks.once('init', () => {
	registerSettings();
	registerAPI();
})

//Add a new button to the header of the actor sheet.
Hooks.on('getActorSheetHeaderButtons', (sheet, headerButtons) => {
	if (!game.user.isGM) return;
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
				'creature',
				game.settings.get('ai-description-generator', 'key')
			);
		}
	})
})

//Add a new button the the header of the itme sheet. Spells are also considered items.
Hooks.on('getItemSheetHeaderButtons', (sheet, headerButtons) => {
	const subjectTypeMapping = {'item': 'item', 'weapon': `attack from a ${sheet?.actor?.name || 'generic'} creature`, 'feat': `feature from a ${sheet?.actor?.name || 'generic'} creature`}
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
					game.settings.get('ai-description-generator', 'key')
				);
			}
		})
	}
	
})

Hooks.on('chatMessage', addChatCommands);
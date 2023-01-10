import {registerSettings } from './settings.js';
import { registerAPI } from './api.js';
import { constructPrompt } from './gpt.js';

Hooks.once('init', () => {
	registerSettings();
	registerAPI();
})

Hooks.on('getActorSheetHeaderButtons', (sheet, headerButtons) => {
	if (!game.user.isGM) return;
	headerButtons.unshift({
		label: 'GPT-3',
		icon: 'fas fa-comment-dots',
		class: 'gpt-actor-button',
		onclick: () => {
			constructPrompt(game.system.title, game.settings.get('ai-description-generator', 'world'), 'creature', sheet.object.name, game.settings.get('ai-description-generator', 'key'))
		}
	})
})

Hooks.on('getItemSheetHeaderButtons', (sheet, headerButtons) => {
	console.log(sheet)
	headerButtons.unshift({
		label: 'GPT-3',
		icon: 'fas fa-comment-dots',
		class: 'gpt-actor-button',
		onclick: () => {
			constructPrompt(game.system.title, game.settings.get('ai-description-generator', 'world'), sheet.object.type == 'spell' ? 'spell': 'item', sheet.object.name, game.settings.get('ai-description-generator', 'key'))
		}
	})
})
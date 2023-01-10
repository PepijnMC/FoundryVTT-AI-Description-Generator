import {registerSettings } from './settings.js';
import { registerAPI } from './api.js';
import { constructPrompt } from './chat-gpt.js';

Hooks.once('init', () => {
	registerSettings();
	registerAPI();
})

Hooks.on('getActorSheetHeaderButtons', (sheet, headerButtons) => {
	if (!game.user.isGM) return;
	headerButtons.unshift({
		label: 'Chat-GPT',
		icon: 'fas fa-comment-dots',
		class: 'chat-gpt-actor-button',
		onclick: () => {
			constructPrompt(game.system.title, game.settings.get('chat-gpt', 'world'), 'creature', sheet.object.name, game.settings.get('chat-gpt', 'key'))
		}
	})
})

Hooks.on('getItemSheetHeaderButtons', (sheet, headerButtons) => {
	console.log(sheet)
	headerButtons.unshift({
		label: 'Chat-GPT',
		icon: 'fas fa-comment-dots',
		class: 'chat-gpt-actor-button',
		onclick: () => {
			constructPrompt(game.system.title, game.settings.get('chat-gpt', 'world'), sheet.object.type == 'spell' ? 'spell': 'item', sheet.object.name, game.settings.get('chat-gpt', 'key'))
		}
	})
})
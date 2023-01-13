import {registerSettings } from './settings.js';
import { registerAPI } from './api.js';
import { constructPrompt } from './generator.js';
import { addChatCommands } from './chat_commands.js';

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
			constructPrompt(
				game.settings.get('ai-description-generator', 'language'),
				game.settings.get('ai-description-generator', 'system'),
				game.settings.get('ai-description-generator', 'world'),
				'creature',
				sheet.object.name,
				game.settings.get('ai-description-generator', 'key')
			);
		}
	})
})

Hooks.on('getItemSheetHeaderButtons', (sheet, headerButtons) => {
	headerButtons.unshift({
		label: 'GPT-3',
		icon: 'fas fa-comment-dots',
		class: 'gpt-actor-button',
		onclick: () => {
			constructPrompt(
				game.settings.get('ai-description-generator', 'language'),
				game.settings.get('ai-description-generator', 'system'),
				game.settings.get('ai-description-generator', 'world'),
				sheet.object.type == 'spell' ? 'spell': 'item',
				sheet.object.name,
				game.settings.get('ai-description-generator', 'key')
			);
		}
	})
})

Hooks.on('chatMessage', addChatCommands);
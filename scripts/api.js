import { constructPrompt, sendPrompt } from "./generator.js";

export function registerAPI() {
	if (!game.settings.get('ai-description-generator', 'api')) return;
	game.modules.get('ai-description-generator').api = {
		constructPrompt,
		sendPrompt
	};
}
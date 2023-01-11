import { constructPrompt, sendPrompt } from "./generator.js";

export function registerAPI() {
	game.modules.get('ai-description-generator').api = {
		constructPrompt,
		sendPrompt
	};
}
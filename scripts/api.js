import { constructPrompt, sendPrompt } from "./gpt.js";

export function registerAPI() {
	game.modules.get('ai-description-generator').api = {
		constructPrompt,
		sendPrompt
	};
}
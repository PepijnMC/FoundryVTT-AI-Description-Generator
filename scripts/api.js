import { constructPrompt, sendPrompt } from "./chat-gpt.js";

export function registerAPI() {
	game.modules.get('chat-gpt').api = {
		constructPrompt,
		sendPrompt
	};
}
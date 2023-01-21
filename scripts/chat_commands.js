import { constructPrompt, sendPrompt } from "./generator.js";


export function addChatCommands(log, data, chatData) {
	const user = game.users.find(user => user.id === chatData.user);
	if (user.role < game.settings.get('ai-description-generator', 'command_permission')) return;
	console.log(user.role)
	if (data.length < 4 || data.split(' ')[0].toLowerCase() != '/gpt') return;

	const subCommand = data.split(' ')[1]
	if (!subCommand) return;

	if (subCommand == 'construct') {
		const args = data.split(' ').slice(2, this.length);
		if (args.length === 0) return;
		var subject = args.join(' ');
		constructPrompt(
			game.settings.get('ai-description-generator', 'language'),
			game.settings.get('ai-description-generator', 'system'),
			game.settings.get('ai-description-generator', 'world'),
			subject,
			'',
			'cool short sensory'
		);
		return false;
	}
	if (subCommand == 'send') {
		const prompt = data.split(' ').slice(2, this.length).join(' ');
		if (prompt === '') return;
		sendPrompt(
			prompt
		);
		return false;
	}
	return;
}

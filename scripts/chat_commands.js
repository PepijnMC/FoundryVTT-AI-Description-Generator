import { constructPrompt, sendPrompt } from "./generator.js";


export function addChatCommands(log, data, chatData) {
	const user = game.users.find(user => user.id === chatData.user);
	if (!user.isGM) return
	if (data.length < 4 || data.split(' ')[0].toLowerCase() != '/gpt') return

	const subCommand = data.split(' ')[1]
	if (!subCommand) return

	if (subCommand == 'construct') {
		const args = data.split(' ').slice(2, this.length);
		if (args.length === 0) return;
		const lastArg = args[args.length - 1].toLowerCase();
		var subject = args.join(' ');
		var subjectType = 'none';
		switch (lastArg) {
			case 'creature':
			case 'item':
			case 'spell':
				subject = args.slice(0, args.length - 1).join(' ');
				subjectType = lastArg;
				break;
		}
		constructPrompt(
			game.settings.get('ai-description-generator', 'language'),
			game.settings.get('ai-description-generator', 'system'),
			game.settings.get('ai-description-generator', 'world'),
			subjectType,
			subject,
			game.settings.get('ai-description-generator', 'key')
		);
		return false;
	}
	if (subCommand == 'send') {
		const prompt = data.split(' ').slice(2, this.length).join(' ');
		if (prompt === '') return
		sendPrompt(
			prompt,
			game.settings.get('ai-description-generator', 'key')
		)
		return false;
	}
	return
}
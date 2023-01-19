export function migrate_160() {
	const oldPrompt = 'Reply in {language}. This is a tabletop roleplaying game using the {system} system and the {world} setting. Give a cool short sensory description the game master can use for a {subject} {subjectType}.';
	const newPrompt = 'Reply in {language}. This is a tabletop roleplaying game using the {system} system and the {world} setting. Give a {descriptionType} description the game master can use for a {subject} {subjectType}.';
	if (game.settings.get('ai-description-generator', 'prompt') === oldPrompt)
		game.settings.set('ai-description-generator', 'prompt', newPrompt);
}
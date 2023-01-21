export function registerSettings() {
	game.settings.register('ai-description-generator', 'key', {
		name: 'API Key',
		hint: 'Your OpenAI API key.',
		scope: 'world',
		config: true,
		type: String,
		default: ''
	});

	game.settings.register('ai-description-generator', 'system', {
		name: 'System',
		hint: 'The name of the (public) system you are using. Will be used to provide context.',
		scope: 'world',
		config: true,
		type: String,
		default: game.system.title
	});
	
	game.settings.register('ai-description-generator', 'world', {
		name: 'Setting',
		hint: 'The name of the (public) setting you are using, if applicable. Will be used to provide context.',
		scope: 'world',
		config: true,
		type: String,
		default: ''
	});

	game.settings.register('ai-description-generator', 'language', {
		name: 'Language',
		hint: 'The language you wish the model to reply in, quality may vary. Leave blank to use your FoundryVTT language setting.',
		scope: 'world',
		config: true,
		type: String,
		default: ''
	});

	game.settings.register('ai-description-generator', 'whisper', {
		name: 'Whisper Response',
		hint: 'When enabled will whisper the response only to you.',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false
	});

	game.settings.register('ai-description-generator', 'button_permission', {
		name: 'Minimum Button Permission',
		hint: 'The minimum permission level to see and use the module\'s sheet buttons of owned Actors.',
		scope: 'world',
		config: true,
		type: Number,
		default: 4,
		choices: {1: "Player", 2: "Trusted", 3: "Assistant", 4: "Game Master"},
		requiresReload: true
	});

	game.settings.register('ai-description-generator', 'command_permission', {
		name: 'Minimum Command Permission',
		hint: 'The minimum permission level to use the module\'s chat commands.',
		scope: 'world',
		config: true,
		type: Number,
		default: 4,
		choices: {1: "Player", 2: "Trusted", 3: "Assistant", 4: "Game Master"},
		requiresReload: true
	});
	
	game.settings.register('ai-description-generator', 'api_permission', {
		name: 'Minimum API Permission',
		hint: 'The minimum permission level to use the module\'s API functions.',
		scope: 'world',
		config: true,
		type: Number,
		default: 4,
		choices: {1: "Player", 2: "Trusted", 3: "Assistant", 4: "Game Master"},
		requiresReload: true
	});

	game.settings.register('ai-description-generator', 'ai_name', {
		name: 'AI Name',
		hint: 'The name of the AI to be used for its chat messages.',
		scope: 'world',
		config: true,
		type: String,
		default: 'GPT-3'
	});

	game.settings.register('ai-description-generator', 'prompt', {
		name: 'AI Prompt',
		hint: 'The prompt that is used to contruct a request for GPT-3. Only alter this if you are dissatified with the results and know what you are doing!',
		scope: 'world',
		config: true,
		type: String,
		default: 'Reply in {language}. This is a tabletop roleplaying game using the {system} system and the {world} setting. Give a {descriptionType} description the game master can use for a {subject} {subjectType}.'
	});

	game.settings.register('ai-description-generator', 'max_tokens', {
		name: 'AI Max Tokens',
		hint: 'The maximum amount of tokens the AI can use per request.',
		scope: 'world',
		config: true,
		type: Number,
		default: 2048
	});

	game.settings.register('ai-description-generator', 'temperature', {
		name: 'AI Temperature',
		hint: 'Positive values increase the model\'s "creativity"',
		scope: 'world',
		config: true,
		type: Number,
		range: {min: 0, max: 1, step: 0.05},
		default: 0.7
	});

	game.settings.register('ai-description-generator', 'frequency_penalty', {
		name: 'AI Frequency Penalty',
		hint: 'Positive values decrease the model\'s likelihood to repeat the same line verbatim.',
		scope: 'world',
		config: true,
		type: Number,
		range: {min: -2, max: 2, step: 0.1},
		default: 0.5
	});

	game.settings.register('ai-description-generator', 'presence_penalty', {
		name: 'AI Presence Penalty',
		hint: 'Positive values increase the model\'s likelihood to talk about new topics.',
		scope: 'world',
		config: true,
		type: Number,
		range: {min: -2, max: 2, step: 0.1},
		default: 0.0
	});

	game.settings.register('ai-description-generator', 'model', {
		name: 'AI Model',
		hint: 'GPT-3 offers 4 main models, davanci-003 being the latest. This setting should not be changed if you do not know what this means.',
		scope: 'world',
		config: true,
		type: String,
		default: 'text-davinci-003',
		choices: { 'text-davinci-003': 'text-davinci-003', 'text-curie-001': 'text-curie-001', 'text-babbage-001': 'text-babbage-001', 'text-ada-001': 'text-ada-001' }
	});

	game.settings.register('ai-description-generator', 'api', {
		name: 'Enable API Functions',
		hint: 'Exposes functions to construct and send prompts in macros or other modules.',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false,
		requiresReload: true
	});

	game.settings.register('ai-description-generator', 'debug', {
		name: 'Debug Mode',
		hint: 'When enabled the module will send prompts to chat and prevents them from being sent to GPT-3. Useful for testing and debugging.',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false
	});

	game.settings.register('ai-description-generator', 'migration_version', {
		name: 'Migration Version',
		hint: 'Internal versioning to help with data migration during updates',
		scope: 'world',
		config: false,
		type: Number,
		default: 150
	});
}
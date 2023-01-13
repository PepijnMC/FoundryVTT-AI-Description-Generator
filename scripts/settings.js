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

	game.settings.register('ai-description-generator', 'ai_name', {
		name: 'AI Name',
		hint: 'The name of the AI to be used for its chat messages.',
		scope: 'world',
		config: true,
		type: String,
		default: 'GPT-3'
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

	game.settings.register('ai-description-generator', 'api', {
		name: 'Enable API Functions',
		hint: 'Exposes functions to construct and send prompts in macros or other modules.',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false
	});
}

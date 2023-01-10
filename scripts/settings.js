export function registerSettings() {
	game.settings.register('chat-gpt', 'key', {
		name: 'API Key',
		hint: 'Your OpenAI API key.',
		scope: 'world',
		config: true,
		type: String,
		default: ''
	});
	
	game.settings.register('chat-gpt', 'world', {
		name: 'Setting',
		hint: 'The name of the (public) setting you are using, if applicable. Will be used to provide context.',
		scope: 'world',
		config: true,
		type: String,
		default: ''
	});

	game.settings.register('chat-gpt', 'whisper', {
		name: 'Whisper Response',
		hint: 'When enabled will whisper the response only to you.',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false
	});

	game.settings.register('chat-gpt', 'max_tokens', {
		name: 'AI Max Tokens',
		hint: 'The maximum amount of tokens the AI can use per request.',
		scope: 'world',
		config: true,
		type: Number,
		default: 2048
	});

	game.settings.register('chat-gpt', 'temperature', {
		name: 'AI Temperature',
		hint: 'Positive values increase the model\'s "creativity"',
		scope: 'world',
		config: true,
		type: Number,
		range: {min: 0, max: 1, step: 0.05},
		default: 0.5
	});

	game.settings.register('chat-gpt', 'frequency_penalty', {
		name: 'AI Frequency Penalty',
		hint: 'Positive values decrease the model\'s likelihood to repeat the same line verbatim.',
		scope: 'world',
		config: true,
		type: Number,
		range: {min: -2, max: 2, step: 0.1},
		default: 0.5
	});

	game.settings.register('chat-gpt', 'presence_penalty', {
		name: 'AI Presence Penalty',
		hint: 'Positive values increase the model\'s likelihood to talk about new topics.',
		scope: 'world',
		config: true,
		type: Number,
		range: {min: -2, max: 2, step: 0.1},
		default: 0.0
	});
}
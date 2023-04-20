function basePrompt(){	
	var prompt = 'Reply in {language}. This is a tabletop roleplaying game using {system}, set in {world}.';	
	var settingsPrompt = game.settings.get('ai-description-generator', 'basePrompt');
	if (settingsPrompt != '') prompt = settingsPrompt;
	var language = game.settings.get('ai-description-generator', 'language');
	var system = game.settings.get('ai-description-generator', 'system');
	var world = game.settings.get('ai-description-generator', 'world');	
	//A mapping for Foundry's languages since only the key is stored but the value is needed.
	const foundryLanguages = {
		"en": "English",
		"fr": "French",
		"es": "Español",
		"ja": "日本語",
		"pl": "Polish",
		"ro": "Română",
		"fi": "Suomi",
		"de": "Deutsch",
		"pt-BR": "Português (Brasil)",
		"ko": "한국어",
		"cn": "中文",
		"zh-tw": "正體中文",
		"cs": "Čeština",
		"it": "Italiano",
		"ca": "Catalan",
		"pt-PT": "Português (Portugal)"
	};
	//English languages to filter out. Since GPT-3 will reply in English by default this filtering reduces the amount of tokens sent.
	const englishLanguages = [
		'english',
		'british',
		'en',
		'uk',
		'american',
		'us',
		'australian',
		'aus'
	];
	//If the module's language setting is left blank use the core language setting instead.
	if (language == '') language = foundryLanguages[game.settings.get('core', 'language')];
	//Remove the language request from the prompt for English languages.
	if (englishLanguages.includes(language.toLowerCase())) prompt = prompt.replace('Reply in {language}. ', '');
	//If the system name already includes the word 'system' remove it from the prompt.
	if (system.toLowerCase().includes('system')) prompt = prompt.replace(' system ', ' ');
	//If no world is given remove it from the prompt.
	if (world == '') prompt = prompt.replace(', set in {world}', '');
	var prompt_mapping = {
		'{language}': language,
		'{system}': system,
		'{world}': world		
	};
	for (const [key, value] of Object.entries(prompt_mapping)) {
		prompt = prompt.replace(key, value);
	}

	return prompt;
}

//Construct a prompt for describing items/characters based on the given parameters.
export function constructDescriptionPrompt(subject, subjectType='', descriptionType='', key=game.settings.get('ai-description-generator', 'key')) {
	var prompt = 'Give a {descriptionType} description the game master can use for a {subject} {subjectType}.';
	var settingsPrompt = game.settings.get('ai-description-generator', 'descriptionPrompt');
	if (settingsPrompt != '') prompt = settingsPrompt;
	prompt = basePrompt() + ' ' + prompt;
	//If no subject type is given, remove it from the prompt.
	if (subjectType == '') prompt = prompt.replace(' {subjectType}', '');
	//If no description type is given remove it from the prompt.
	if (descriptionType == '') prompt = prompt.replace(' {descriptionType}', '');	
	var prompt_mapping = {		
		'{subject}': subject,
		'{subjectType}': subjectType,
		'{descriptionType}': descriptionType
	};
	for (const [key, value] of Object.entries(prompt_mapping)) {
		prompt = prompt.replace(key, value);
	}

	//Send the prompt.
	sendPrompt(prompt)
}

//Construct a prompt for describing combat based on the given parameters.
export function constructCombatPrompt(attacker, isAttackerNamed, target, isTargetNamed, attack, isAttackHit, damage) {
	var prompt = 'Write a description for a round of combat with the following information. Attacker: {attacker}. Target: {target}. Weapon used:{weapon}. Attack effect: {effect}.';
	// Some other sentences that work well in this prompt:
	// "You are an extremely skilled dungeon master who gives brief, colourful, in-character descriptions."
	// "Avoid ever using two consecutive adjectives."
	// "You should not provide any descriptions of PC thoughts, feelings, or actions beyond their combat move."

	var settingsPrompt = game.settings.get('ai-description-generator', 'combatPrompt');
	if (settingsPrompt != '') prompt = settingsPrompt;
	prompt = basePrompt() + ' ' + prompt;
	var effect = 'miss';
	if(isAttackHit) {
		effect = 'hit';
		var targetHP = target.system.attributes.hp;
		if(damage / targetHP < 0.2) effect = 'minor hit';
		else if(damage > targetHP) effect = 'dying';
		if(damage > targetHP + target.system.abilities.con) effect = 'dead';
	}
	var prompt_mapping = {
		'{attacker}': attacker.name,
		'{target}': target.name,
		'{weapon}': attack,
		'{effect}': effect
	}
	for (const [key, value] of Object.entries(prompt_mapping)) {
		prompt = prompt.replace(key, value);
	}

	// TODO: Add to prompt "The fighters are already engaged in combat" / "The fighters have just engaged in combat" depending on whether this pair have just entered melee.
	// (Prevents things like "PC charges across the room..." when they're already fighting.)

	// TODO: Add setting to allow GM to write a brief description for named characters, so that what gets sent to the prompt is e.g.: 
	// "Attacker: Kulnan, a large, ferocious human barbarian" or "Target: Gaedren Lamm, a nasty, wizened old human criminal."

	// TODO: Add indefinite article to attacker and target names if they're not named.
	// e.g.: "Attacker: a zombie" or "Target: an addu"

	//Send the prompt.
	sendPrompt(prompt)	
}

//Send a prompt the GPT-3.
export function sendPrompt(prompt) {
	var key = game.settings.get('ai-description-generator', 'key');
	const speaker = game.settings.get('ai-description-generator', 'ai_name')

	if (game.settings.get('ai-description-generator', 'debug')) {
		const message = {user: game.user, speaker: {alias: `${speaker} (Debug)`}, content: prompt}
		if (game.settings.get('ai-description-generator', 'whisper')) message['whisper'] = [game.userId]
		ChatMessage.create(message);
		return;
	}
	console.log(`AI Description Generator | Sending the following prompt to GPT-3: ${prompt}`);
	var response = '';

	//Setup a http request to OpenAI's API using the provided key.
	var oHttp = new XMLHttpRequest();
	oHttp.open("POST", "https://api.openai.com/v1/completions");
	oHttp.setRequestHeader("Accept", "application/json");
	oHttp.setRequestHeader("Content-Type", "application/json");
	oHttp.setRequestHeader("Authorization", 'Bearer ' + key);

	//Add a listener to the request to catch its response.
	oHttp.onreadystatechange = function () {
		if (oHttp.readyState === 4) {
			var oJson = {}
			if (response != "") response += "\n";

			try {
				oJson = JSON.parse(oHttp.responseText);
			} catch (ex) {
				response += "Error: " + ex.message
			}

			if (oJson.error && oJson.error.message) {
				response += "Error: " + oJson.error.message;
			} else if (oJson.choices && oJson.choices[0].text) {
				var s = oJson.choices[0].text;

				if (s == "") s = "No response";
				response += s;
			}
			const message = {user: game.user, speaker: {alias: speaker}, content: response}
			if (game.settings.get('ai-description-generator', 'whisper')) message['whisper'] = [game.userId]
			ChatMessage.create(message);
		}
	};

	//The data to send including the prompt.
	var data = {
		model: game.settings.get('ai-description-generator', 'model'),
		prompt: prompt,
		max_tokens: game.settings.get('ai-description-generator', 'max_tokens'),
		user: '1',
		temperature: game.settings.get('ai-description-generator', 'temperature'),
		frequency_penalty: game.settings.get('ai-description-generator', 'frequency_penalty'), //Number between -2.0 and 2.0  Positive value decrease the model's likelihood to repeat the same line verbatim.
		presence_penalty: game.settings.get('ai-description-generator', 'presence_penalty'),  //Number between -2.0 and 2.0. Positive values increase the model's likelihood to talk about new topics.
		stop: ["#", ";"] //Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence.
	};

	//Send the data.
	oHttp.send(JSON.stringify(data));
}

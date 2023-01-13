export function constructPrompt(language, system, world, subjectType, subject, key) {
	var prompt = ''
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

	if (language == '') language = foundryLanguages[game.settings.get('core', 'language')];
	if (!englishLanguages.includes(language.toLowerCase())) prompt += `Reply in ${language}. `
	prompt += `This is a tabletop roleplaying game using the ${system}`;
	if (!system.toLowerCase().includes('system')) prompt += ' system';
	if (world) prompt += ` and the ${world} setting`;
	prompt += `. Give a cool short sensory description the game master can use for a ${subject}`;
	switch (subjectType.toLowerCase()) {
		case 'creature':
		case 'item':
		case 'spell':
			prompt += ` ${subjectType}`;
	}
	prompt += '.';
	return sendPrompt(prompt, key)
}

export function sendPrompt(prompt, key) {
	console.log(`AI Description Generator | Sending the following prompt to GPT-3: ${prompt}`);
	var response = '';
	var oHttp = new XMLHttpRequest();
	oHttp.open("POST", "https://api.openai.com/v1/completions");
	oHttp.setRequestHeader("Accept", "application/json");
	oHttp.setRequestHeader("Content-Type", "application/json");
	oHttp.setRequestHeader("Authorization", 'Bearer ' + key);

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
			const speaker = game.settings.get('ai-description-generator', 'ai_name')
			const message = {user: game.user, speaker: {alias: speaker}, content: response}
			if (game.settings.get('ai-description-generator', 'whisper')) message['whisper'] = [game.userId]
			ChatMessage.create(message);        
		}
	};

	var data = {
		model: 'text-davinci-003',
		prompt: prompt,
		max_tokens: game.settings.get('ai-description-generator', 'max_tokens'),
		user: '1',
		temperature: game.settings.get('ai-description-generator', 'temperature'),
		frequency_penalty: game.settings.get('ai-description-generator', 'frequency_penalty'), //Number between -2.0 and 2.0  Positive value decrease the model's likelihood to repeat the same line verbatim.
		presence_penalty: game.settings.get('ai-description-generator', 'presence_penalty'),  //Number between -2.0 and 2.0. Positive values increase the model's likelihood to talk about new topics.
		stop: ["#", ";"] //Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence.
	};

	oHttp.send(JSON.stringify(data));
}
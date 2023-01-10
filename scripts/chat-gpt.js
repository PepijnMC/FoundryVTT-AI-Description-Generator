export function constructPrompt(system, world, entityType, subject, key) {
	var prompt = `This is a roleplaying game using the ${system} system`;
	if (world) prompt += ` and the ${world} setting`;
	prompt += `. Give a cool short sensory description the game master can use for a ${subject}`;
	switch (entityType.toLowerCase()) {
		case 'creature':
		case 'item':
		case 'spell':
			prompt += ` ${entityType}`;
	}
	prompt += '.';
	console.log(prompt);
	return sendPrompt(prompt, key)
}

export function sendPrompt(prompt, key) {
	var response = '';
	var oHttp = new XMLHttpRequest();
	oHttp.open("POST", "https://api.openai.com/v1/completions");
	oHttp.setRequestHeader("Accept", "application/json");
	oHttp.setRequestHeader("Content-Type", "application/json");
	oHttp.setRequestHeader("Authorization", 'Bearer ' + key);

	oHttp.onreadystatechange = function () {
		if (oHttp.readyState === 4) {
			//console.log(oHttp.status);
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
			const message = {user: game.user, speaker: {alias: 'Chat-GPT'}, content: response}
			if (game.settings.get('chat-gpt', 'whisper')) message['whisper'] = [game.userId]
			ChatMessage.create(message);        
		}
	};

	var data = {
		model: 'text-davinci-003',
		prompt: prompt,
		max_tokens: game.settings.get('chat-gpt', 'max_tokens'),
		user: '1',
		temperature: game.settings.get('chat-gpt', 'temperature'),
		frequency_penalty: game.settings.get('chat-gpt', 'frequency_penalty'), //Number between -2.0 and 2.0  Positive value decrease the model's likelihood to repeat the same line verbatim.
		presence_penalty: game.settings.get('chat-gpt', 'presence_penalty'),  //Number between -2.0 and 2.0. Positive values increase the model's likelihood to talk about new topics.
		stop: ["#", ";"] //Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence.
	};

	oHttp.send(JSON.stringify(data));
}
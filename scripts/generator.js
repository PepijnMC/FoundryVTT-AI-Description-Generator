//Construct a prompt based on the given parameters.
export function constructPrompt(language, system, world, subject, subjectType = '', descriptionType = '', key = game.settings.get('ai-description-generator', 'key')) {
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

    const defaultPrompt = 'Reply in {language}. This is a tabletop roleplaying game using the {system} system and the {world} setting. Give a {descriptionType} description the game master can use for a {subject} {subjectType}.';
    var prompt = game.settings.get('ai-description-generator', 'prompt');
    if (prompt === defaultPrompt) {
        //If the module's language setting is left blank use the core language setting instead.
        if (language == '')
            language = foundryLanguages[game.settings.get('core', 'language')];
        //Remove the language request from the prompt for English languages.
        if (englishLanguages.includes(language.toLowerCase()))
            prompt = prompt.replace('Reply in {language}. ', '');
        //If the system name already includes the word 'system' remove it from the prompt.
        if (system.toLowerCase().includes('system'))
            prompt = prompt.replace(' system ', ' ');
        //If no world is given remove it from the prompt.
        if (world == '')
            prompt = prompt.replace(' and the {world} setting', '');
        //If no subject type is given remove it from the prompt.
        if (subjectType == '')
            prompt = prompt.replace(' {subjectType}', '');
        //If no description type is given remove it from the prompt.
        if (descriptionType == '')
            prompt = prompt.replace(' {descriptionType}', '');
    }
    var prompt_mapping = {
        '{language}': language,
        '{system}': system,
        '{world}': world,
        '{subject}': subject,
        '{subjectType}': subjectType,
        '{descriptionType}': descriptionType
    };
    for (const[key, value]of Object.entries(prompt_mapping)) {
        prompt = prompt.replace(key, value);
    }

    //Send the prompt.
    sendPrompt(prompt, key)
}

//Send a prompt the GPT-3.
export function sendPrompt(prompt, key = game.settings.get('ai-description-generator', 'key')) {
    const speaker = game.settings.get('ai-description-generator', 'ai_name');

    if (game.settings.get('ai-description-generator', 'debug')) {
        const message = {
            user: game.user,
            speaker: {
                alias: `${speaker} (Debug)`
            },
            content: prompt
        };
        if (game.settings.get('ai-description-generator', 'whisper'))
            message['whisper'] = [game.userId];
        ChatMessage.create(message);
        return;
    }
    console.log(`AI Description Generator | Sending the following prompt to GPT-3: ${prompt}`);
    var response = '';

    var endpoint = `https://api.openai.com/v1/chat/completions`;

    // Setup a http request to OpenAI's API using the provided key.
    var oHttp = new XMLHttpRequest();
    oHttp.open("POST", endpoint);
    oHttp.setRequestHeader("Accept", "application/json");
    oHttp.setRequestHeader("Content-Type", "application/json");
    oHttp.setRequestHeader("Authorization", 'Bearer ' + key);

    // Add a listener to the request to catch its response.
    oHttp.onreadystatechange = function () {
        if (oHttp.readyState === 4) {
            var oJson = {};
            if (response != "")
                response += "\n";

            try {
                oJson = JSON.parse(oHttp.responseText);
            } catch (ex) {
                response += "Error: " + ex.message;
            }

            if (oJson.error && oJson.error.message) {
                response += "Error: " + oJson.error.message;
            } else if (oJson.choices && oJson.choices[0].message && oJson.choices[0].message.content) {
                var s = oJson.choices[0].message.content;
                if (s == "")
                    s = "No response";
                response += s;
            }

            const message = {
                user: game.user,
                speaker: {
                    alias: speaker
                },
                content: response
            };
            if (game.settings.get('ai-description-generator', 'whisper'))
                message['whisper'] = [game.userId];
            ChatMessage.create(message);
        }
    };

    var data = {
        model: game.settings.get('ai-description-generator', 'model'),
        messages: [{"role": "user", content: prompt}],
        max_tokens: game.settings.get('ai-description-generator', 'max_tokens'),
        user: '1',
        temperature: game.settings.get('ai-description-generator', 'temperature'),
        frequency_penalty: game.settings.get('ai-description-generator', 'frequency_penalty'),
        presence_penalty: game.settings.get('ai-description-generator', 'presence_penalty'),
        stop: ["#", ";"]
    };

    oHttp.send(JSON.stringify(data));
};

    

//Todo: New function to send a prompt to https://api.openai.com/v1/chat/completions exclusively. 
//Will need the following features:
//1. Fetch all FoundryVTT chat messages from the current scene, filter to only characters, GM, and AI and structure them as a list of messages.
//2. Rename "ChatGPT" user to "Assistant" user for consistency with the GPT-3.5 Turbo API. 
//3. All user messages uses the "user" user and append the actual username to the message content. GM messages should use the "system" user.
//4. The first message is always a "system" message containing the TTRPG system name and the world setting along with any language preferences.
//5. The last message is always the most recent message in the chatbox.
//6. Only the last 100 lines of chat are sent to the API (other than the first message).
//Stretch Goal: Figure out a way to compress the string data past the last 100 messages. This would allow the AI to have a better understanding of the current situation.
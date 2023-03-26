//Construct a prompt based on the given parameters.
export function constructPrompt(language, system, world, subject, subjectType = '', descriptionType = '', isRaw = false, key = game.settings.get('ai-description-generator', 'key') ) {
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
    const defaultSettingPrompt = 'Reply in {language}. This is a tabletop roleplaying game using the {system} system and the {world} setting.'
    const defaultPrompt = 'Give a {descriptionType} description the game master can use for a {subject} {subjectType}.';
    var prompt = game.settings.get('ai-description-generator', 'prompt');
    var settingprompt = game.settings.get('ai-description-generator', 'settingprompt');
    if (settingprompt === defaultSettingPrompt) {
        //If the module's language setting is left blank use the core language setting instead.
        if (language == '')
            language = foundryLanguages[game.settings.get('core', 'language')];
        //Remove the language request from the prompt for English languages.
        if (englishLanguages.includes(language.toLowerCase()))
            settingprompt = settingprompt.replace('Reply in {language}. ', '');
        //If the system name already includes the word 'system' remove it from the settingprompt.
        if (system.toLowerCase().includes('system'))
            settingprompt = settingprompt.replace(' system ', ' ');
        //If no world is given remove it from the settingprompt.
        if (world == '')
            settingprompt = settingprompt.replace(' and the {world} setting', '');
    }

    if (prompt === defaultPrompt) {
        //If no subject type is given remove it from the prompt.
        if (subjectType == '')
            prompt = prompt.replace(' {subjectType}', '');
        //If no description type is given remove it from the prompt.
        if (descriptionType == '')
            prompt = prompt.replace(' {descriptionType}', '');
    }

    var settingprompt_mapping = {
        '{language}': language,
        '{system}': system,
        '{world}': world       
    }
    for (const[key, value]of Object.entries(settingprompt_mapping)) {
        settingprompt = settingprompt.replace(key, value);
    }
    
    var prompt_mapping = {
        '{subject}': subject,
        '{subjectType}': subjectType,
        '{descriptionType}': descriptionType
    };
    for (const[key, value]of Object.entries(prompt_mapping)) {
        prompt = prompt.replace(key, value);
    }

    if (isRaw) {
        prompt = subject;
    }

    //Send the prompt.
    sendPrompt(settingprompt, prompt, key)
}

// a function to fetch a filtered array of all chats and structure them to be compatible with the api.
export function getChats() {
    const limit = game.settings.get("ai-description-generator", "max_chat_history"); // get the value of "max_chats" setting
    const htmlRegex = /\\?<\/?\w+((\s+\w+(\s*=\s*(?:\w+|"[^"]*"))?)+\s*|\s*)\/?>/g;
    const entityRegex = /&[^\s;]+;/g;
    const chats = game.messages.contents
        .filter(m => {
            const speaker = m.speaker;
            const content = m.content;
            return speaker && (speaker.actor || speaker.actor === null || speaker.actor === undefined || speaker.alias === "ChatGPT" || speaker.alias === "gamemaster") && 
            !(m.data.type === CONST.CHAT_MESSAGE_TYPES.ROLL) && !htmlRegex.test(content) && !entityRegex.test(content);
        })
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-limit)
        .map(m => {
            const speaker = m.speaker;
            const content = m.content;
            const role = speaker && speaker.alias === "ChatGPT" ? "assistant" : "user";
            const alias = speaker ? speaker.alias : "gamemaster";
            return {
                role: role,
                content: role === "assistant" ? content : `${alias}: ${content}`
            };
        });
    return chats;
}


//Send a prompt the GPT-3.
export function sendPrompt(settingprompt, prompt, key = game.settings.get('ai-description-generator', 'key')) {
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
        model: "gpt-3.5-turbo",
        messages: [
            {"role": "system", content: settingprompt},
            ...getChats(),
            {"role": "user", content: prompt}
        ],
        max_tokens: game.settings.get('ai-description-generator', 'max_tokens'),
        user: '1',
        temperature: game.settings.get('ai-description-generator', 'temperature'),
        frequency_penalty: game.settings.get('ai-description-generator', 'frequency_penalty'),
        presence_penalty: game.settings.get('ai-description-generator', 'presence_penalty'),
        stop: ["#", ";"]
    };
    var logmessage = JSON.stringify(data.messages);
    console.log(`AI Description Generator | Sending the following payload to GPT-3: ${logmessage}`);
    oHttp.send(JSON.stringify(data));
};
import { registerSettings } from './settings.js';
import { registerAPI } from './api.js';
import { migrationHandler } from './migration/migration_handler.js';
import { constructPrompt } from './generator.js';
import { addChatCommands } from './chat_commands.js';
import { getSubjectWithContext, getContextValues, getActorContext } from './context.js';

//Register the settings and api function when Foundry is ready.
Hooks.once('init', () => {
	registerSettings();
});

Hooks.once('ready', () => {
	registerAPI();
	migrationHandler();
});

//Add a new button to the header of the actor sheet.
Hooks.on('getActorSheetHeaderButtons', (sheet, headerButtons) => {
	if (game.user.role < game.settings.get('ai-description-generator', 'button_permission')) return;
	const actor = sheet.object;
	const actorType = actor.type;
	const actorData = actor.getRollData();

	if (actorType === 'character' || actorType === 'npc') {
		const contextValues = getContextValues(actorType, actorData);
		
		let subject, subjectContext;
		
		if (actorType === 'character') {
		  subject = `${contextValues.lineage} ${contextValues.class} ${contextValues.background} player character`;
		  subjectContext = `who is/has ${contextValues.appearance}`;
		} else {
		  subject = actor.name;
		  subjectContext = `that is/has ${contextValues.appearance}`;
		}
	
		headerButtons.unshift({
		  label: 'ChatGPT',
		  icon: 'fas fa-comment-dots',
		  class: 'gpt-actor-button',
		  onclick: () => {
			constructPrompt(
			  game.settings.get('ai-description-generator', 'language'),
			  game.settings.get('ai-description-generator', 'system'),
			  game.settings.get('ai-description-generator', 'world'),
			  subject,
			  subjectContext,
			  'cool short visual',
			  false
			);
		  }
		});
	}
	else {
		const subjectTypeMapping = JSON.parse(game.settings.get('ai-description-generator', 'subjectTypeMappings'));

		if (subjectTypeMapping[actorType]) {
		  headerButtons.unshift({
			label: 'GPT-3',
			icon: 'fas fa-comment-dots',
			class: 'gpt-actor-button',
			onclick: () => {
			  constructPrompt(
				game.settings.get('ai-description-generator', 'language'),
				game.settings.get('ai-description-generator', 'system'),
				game.settings.get('ai-description-generator', 'world'),
				actor.name,
				subjectTypeMapping[actorType],
				'cool short sensory',
				false
			  );
			}
		  });
		}
	}
});

//Add a new button the the header of the itme sheet. Spells are also considered items.
Hooks.on('getItemSheetHeaderButtons', (sheet, headerButtons) => {
    if (game.user.role < game.settings.get('ai-description-generator', 'button_permission')) return;
    const actor = sheet?.actor;
    var actorContext = '';
    if (actor) {
        const actorData = actor.getRollData();
        const templates = JSON.parse(game.settings.get('ai-description-generator', 'actorContextTemplates'));
        const contextTemplate = templates[actor.type];

        if (contextTemplate) {
            actorContext = getActorContext(contextTemplate, actorData, actor);
        }
    }
    const subjectTypeMapping = JSON.parse(game.settings.get('ai-description-generator', 'itemSubjectTypeMappings'));
    var subjectType = sheet.object.type;
    if (subjectType in subjectTypeMapping) {
        headerButtons.unshift({
            label: 'ChatGPT',
            icon: 'fas fa-comment-dots',
            class: 'gpt-actor-button',
            onclick: () => {
                constructPrompt(
                    game.settings.get('ai-description-generator', 'language'),
                    game.settings.get('ai-description-generator', 'system'),
                    game.settings.get('ai-description-generator', 'world'),
                    sheet.object.name,
                    getActorContext(subjectTypeMapping[subjectType], null, null, actorContext),
                    'cool short sensory',
					false
                );
            }
        });
    }
});

Hooks.on('chatMessage', addChatCommands);

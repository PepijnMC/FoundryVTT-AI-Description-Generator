import { registerSettings } from './settings.js';
import { registerAPI } from './api.js';
import { migrationHandler } from './migration/migration_handler.js';
import { constructCombatPrompt, constructDescriptionPrompt } from './generator.js';
import { addChatCommands } from './chat_commands.js';

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
	if (actorType === 'character') {
		const actorData = actor.getRollData();
		const lineageContext = actorData.details.race;
		const classContext = Object.keys(actorData.classes).join('/');
		const appearanceContext = actorData.details.appearance;
		
		const subject = `${lineageContext} ${classContext} player character`;
		const subjectContext = `who is/has ${appearanceContext}`;
		headerButtons.unshift({
			label: 'GPT-3',
			icon: 'fas fa-comment-dots',
			class: 'gpt-actor-button',
			onclick: () => {
				constructDescriptionPrompt(					
					subject,
					subjectContext,
					'cool short visual'
				);
			}
		});
	}
	else {
		const subjectTypeMapping = {'npc': 'creature', 'vehicle': 'vehicle', 'group': 'group'};

		headerButtons.unshift({
			label: 'GPT-3',
			icon: 'fas fa-comment-dots',
			class: 'gpt-actor-button',
			onclick: () => {
				constructDescriptionPrompt(					
					actor.name,
					subjectTypeMapping[actorType],
					'cool short sensory'
				);
			}
		});
	}
});

//Add a new button the the header of the itme sheet. Spells are also considered items.
Hooks.on('getItemSheetHeaderButtons', (sheet, headerButtons) => {
	if (game.user.role < game.settings.get('ai-description-generator', 'button_permission')) return;
	const actor = sheet?.actor
	var actorContext = ''
	if (actor) {
		switch (actor.type) {
			case 'character':
				const actorData = actor.getRollData();
				const actorClasses = Object.keys(actorData.classes).join('/');
				actorContext = ` from a ${actorClasses}`;
				break;
			case 'npc':
				actorContext = ` from a ${actor.name} creature`;
				break;
			case 'vehicle':
				actorContext = ` from a ${actor.name} vehicle`;
				break;
			case 'group':
				actorContext = ` from a group of ${actor.name}`;
				break;
		}
	}
	const subjectTypeMapping = {'backpack': 'container', 'consumable': 'item', 'equipment': 'item', 'feat': `feature${actorContext}`, 'loot': 'item', 'spell': `spell${actorContext}`, 'tool': 'tool', 'weapon': `attack${actorContext}`};
	var subjectType = sheet.object.type;
	if (subjectType in subjectTypeMapping) {
		headerButtons.unshift({
			label: 'GPT-3',
			icon: 'fas fa-comment-dots',
			class: 'gpt-actor-button',
			onclick: () => {
				constructPrompt(
					game.settings.get('ai-description-generator', 'language'),
					game.settings.get('ai-description-generator', 'system'),
					game.settings.get('ai-description-generator', 'world'),
					sheet.object.name,
					subjectTypeMapping[subjectType],
					'cool short sensory'
				);
			}
		})
	}
});

Hooks.on('chatMessage', addChatCommands);

Hooks.on('renderChatMessage', async (log, data, chatData) => {	
	if (game.user.role < game.settings.get('ai-description-generator', 'button_permission')) return;

	var targetToken = canvas.tokens.get(log.flags.pf1.metadata.targets[0]);
	if(!targetToken) return;

	var describeButton = $('<a>', {
		class: 'gpt-actor-button',
		style: 'font-size: 15px; justify-content: right; display: flex; align-items: center; padding-right: 5px;'})			
	describeButton.append($('<i>', {
		class: 'fas fa-comment-dots',
		style: 'font-size: 30px; padding: 3px;'
	}));
	describeButton.append('Describe');

	switch(game.system.id){
		case 'pf1': 
		if(data.find('chat-attack')) {
			var $header = data.find('.card-header');
			if(!$header) return;
			describeButton.click(() => {
				let attacker = game.actors.get(log.speaker.actor);
				let isAttackerNamed = !(attacker.type == 'npc' && attacker.name == log.speaker.alias);
				
				let targetActor = game.actors.get(targetToken.document.actorId);
				let isTargetNamed = !(targetActor.type == 'npc' && targetActor.name == targetToken.name);

				let attack = log.systemRolls.attacks[0].attack.options.flavor;
				let isAttackHit = log.systemRolls.attacks[0].attack.total > targetActor.system.attributes.ac.normal.total;
				let damage = log.systemRolls.attacks[0].damage[0].total;

				constructCombatPrompt(attacker, isAttackerNamed, targetActor, isTargetNamed, attack, isAttackHit, damage);
			});
			$header.append(describeButton);		
		}
		break;
	}
});
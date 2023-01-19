import { migrate_160 } from "./1.6.0.js";

export function migrationHandler() {
	const moduleVersion = parseInt(game.modules.get('ai-description-generator').version.split('.').join(''));
	const migrationVersion = game.settings.get('ai-description-generator', 'migration_version');
	if (migrationVersion < moduleVersion) {
		console.warn(`AI Description Generator | Migrating World to ${game.modules.get('ai-description-generator').version}!`);
		switch (migrationVersion) {
			case 150:
				migrate_160();
			//case 160:
				//migrate_170();
			//case 170:
				//migrate_180();
			//...
		};
	}
	game.settings.set('ai-description-generator', 'migration_version', moduleVersion)
}
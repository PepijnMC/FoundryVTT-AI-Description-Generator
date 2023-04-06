export function getContextValues(actorType, actorData) {
    const defaultMappings = {
      character: {
        lineage: 'details.race',
        class: 'classes',
        appearance: 'details.appearance'
      }
    };
  
    const userMappings = JSON.parse(game.settings.get('ai-description-generator', 'contextMappings')) || {};
  
    const contextKeys = Object.keys(defaultMappings[actorType]);
    const contextValues = {};
  
    for (const key of contextKeys) {
      const mapping = userMappings[actorType]?.[key] || defaultMappings[actorType][key];
      let value = getProperty(actorData, mapping);
        
      // Handle class arrays
      if (key === 'class' && Array.isArray(value)) {
          value = Object.keys(value).join('/');
      }
        
      contextValues[key] = value;
    }
  
    return contextValues;
}

export function getSubjectWithContext(subjectTypeMapping, subjectType, actorContext) {
    const subject = subjectTypeMapping[subjectType] || subjectType;
    return subject.replace('{actorContext}', actorContext);
}

export function getActorContext(contextTemplate, actorData, actor, actorContext) {
  return new Function('actorData', 'actor', 'actorContext', 'return `' + contextTemplate + '`')(actorData, actor, actorContext);
}

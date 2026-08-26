const fs = require('fs');
let content = fs.readFileSync('src/lib/events.ts', 'utf8');

content = content.replace(
  `import { FAFEEvent, EventStatus, EventRegistration, RegistrationStatus } from '../types';`,
  `import { FAFEEvent, EventStatus, EventRegistration, RegistrationStatus } from '../types';\nimport { DEMO_EVENTS } from './mockData';`
);

content = content.replace(
  /const events = snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as FAFEEvent\)\);\n    return \{ events, lastDoc: snapshot\.docs\[snapshot\.docs\.length - 1\] \};/m,
  `let events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FAFEEvent));\n    if (events.length === 0) events = [...DEMO_EVENTS] as unknown as FAFEEvent[];\n    return { events, lastDoc: snapshot.docs[snapshot.docs.length - 1] };`
);

content = content.replace(
  /if \(snapshot\.empty\) return null;\n    return \{ id: snapshot\.docs\[0\]\.id, \.\.\.snapshot\.docs\[0\]\.data\(\) \} as FAFEEvent;/m,
  `if (snapshot.empty) {\n      const mock = DEMO_EVENTS.find(e => e.slug === slug);\n      if (mock) return mock as unknown as FAFEEvent;\n      return null;\n    }\n    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FAFEEvent;`
);

fs.writeFileSync('src/lib/events.ts', content);

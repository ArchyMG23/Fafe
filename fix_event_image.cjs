const fs = require('fs');

let mockData = fs.readFileSync('src/lib/mockData.ts', 'utf8');
// Find the DEMO_EVENTS array and replace featuredImage with coverImage
const eventsStart = mockData.indexOf('export const DEMO_EVENTS');
if (eventsStart !== -1) {
  const before = mockData.substring(0, eventsStart);
  let after = mockData.substring(eventsStart);
  after = after.replace(/featuredImage:/g, 'coverImage:');
  fs.writeFileSync('src/lib/mockData.ts', before + after);
}

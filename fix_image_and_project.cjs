const fs = require('fs');

// 1. Fix mockData.ts featuredImage -> coverImage for events
let mockData = fs.readFileSync('src/lib/mockData.ts', 'utf8');
// Only the last 3 are events, but let's just replace all since articles also might use coverImage depending on interface. Let's check article interface.

const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Actions.tsx', 'utf8');

// The original closing div was for:
// <div className="flex flex-wrap gap-2 justify-center md:justify-end">
// Now we have:
// <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-end flex-grow">
//   <div className="relative">...</div>
//   <div className="flex flex-wrap gap-2">
//     ... buttons ...
//   </div> <!-- closing the inner flex-wrap -->
// </div> <!-- THIS is the one that's missing -->

content = content.replace(
  /\{\/\* Filters \*\/\}\n\s*<div className="flex flex-wrap gap-2 justify-center md:justify-end">/,
  `{/* Filters will be handled by the next replace */}`
);

// Actually, it's easier to just append a closing </div> after the map of categories.
const targetMapEnd = `                </button>
              ))}
            </div>`;

const newMapEnd = `                </button>
              ))}
            </div>
            </div>`; // Close the parent flex-col wrapper

content = content.replace(targetMapEnd, newMapEnd);

fs.writeFileSync('src/pages/public/Actions.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Actions.tsx', 'utf8');

const targetStr = `                    {/* Progression bar for projects */}
                    {project.targetAmount && project.raisedAmount !== undefined && (
                      <div className="mb-6">
                        <div className="flex justify-between text-xs text-stone-500 mb-2">
                          <span>{language === 'fr' ? 'Objectif du projet' : 'Project goal'}</span>
                          <span className="font-bold text-[#E67E22]">
                            {Math.round((project.raisedAmount / project.targetAmount) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#E67E22]" 
                            style={{ width: \`\${Math.min(Math.round((project.raisedAmount / project.targetAmount) * 100), 100)}%\` }}
                          ></div>
                        </div>
                      </div>
                    )}`;

content = content.replace(targetStr, "");
fs.writeFileSync('src/pages/public/Actions.tsx', content);

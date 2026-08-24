const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/admin/AdminMemberDetail.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const roleSelect = `<select 
                className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 text-sm focus:ring-[#E67E22] focus:border-[#E67E22]"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                disabled={id === currentUser?.id}
              >
                <option value="MEMBER">MEMBER (Membre standard)</option>
                <option value="ENTREPRENEUR">ENTREPRENEUR</option>
                <option value="TRAINER">TRAINER</option>
                <option value="MODERATOR">MODERATOR</option>
                <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
                <option value="FINANCE_MANAGER">FINANCE_MANAGER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>`;

content = content.replace(/<select[\s\S]*?<\/select>/, roleSelect);

// I should replace only the first one (which is roles, the second is status)
fs.writeFileSync(filePath, content);

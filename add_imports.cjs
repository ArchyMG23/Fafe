const fs = require('fs');
const path = require('path');

const files = [
"src/components/admin/cms/CMSImageField.tsx",
"src/components/admin/cms/CMSListField.tsx",
"src/components/admin/cms/CMSMediaModal.tsx",
"src/components/admin/cms/CMSPreviewModal.tsx",
"src/pages/admin/AdminAdhesions.tsx",
"src/pages/admin/AdminEntrepreneurDetail.tsx",
"src/pages/admin/AdminEntrepreneurs.tsx",
"src/pages/admin/cms/AdminArticleEditor.tsx",
"src/pages/admin/cms/AdminCMSMedia.tsx",
"src/pages/dashboard/MemberAdhesion.tsx",
"src/pages/dashboard/MemberDashboard.tsx",
"src/pages/dashboard/MemberProfile.tsx",
"src/pages/dashboard/events/MemberEvents.tsx",
"src/pages/public/About.tsx",
"src/pages/public/Actions.tsx",
"src/pages/public/events/EventDetails.tsx",
"src/pages/public/events/EventList.tsx",
"src/pages/public/marketplace/MarketplaceCart.tsx",
"src/pages/public/marketplace/MarketplaceHome.tsx",
"src/pages/public/marketplace/MarketplaceProduct.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import { FafeImage }')) {
    const depth = file.split('/').length - 2;
    let importPath = depth === 0 ? './components/ui/FafeImage' : '../'.repeat(depth) + 'components/ui/FafeImage';
    content = `import { FafeImage } from '${importPath}';\n` + content;
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Added import to ${file}`);
  }
}

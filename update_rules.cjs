const fs = require('fs');

let rules = fs.readFileSync('firestore.rules', 'utf8');

// Update isAdmin to include the hardcoded email
rules = rules.replace(
  /function isAdmin\(\) \{\s*return isAuthenticated\(\) &&\s*\(getUserData\(\)\.role == 'ADMIN' \|\| getUserData\(\)\.role == 'SUPER_ADMIN'\);\s*\}/,
  `function isAdmin() {
      return isAuthenticated() && (
        (getUserData() != null && (getUserData().role == 'ADMIN' || getUserData().role == 'SUPER_ADMIN')) ||
        request.auth.token.email == 'yombivictor@gmail.com'
      );
    }`
);

// Update isContentManager
rules = rules.replace(
  /function isContentManager\(\) \{\s*return isAuthenticated\(\) &&\s*\(getUserData\(\)\.role == 'ADMIN' \|\| getUserData\(\)\.role == 'SUPER_ADMIN' \|\| getUserData\(\)\.role == 'CONTENT_MANAGER'\);\s*\}/,
  `function isContentManager() {
      return isAuthenticated() && (
        (getUserData() != null && (getUserData().role == 'ADMIN' || getUserData().role == 'SUPER_ADMIN' || getUserData().role == 'CONTENT_MANAGER')) ||
        request.auth.token.email == 'yombivictor@gmail.com'
      );
    }`
);

// Update user creation rules to allow status PENDING and membershipStatus PENDING
rules = rules.replace(
  /allow create: if isAuthenticated\(\) && request\.auth\.uid == userId\s*&& request\.resource\.data\.role == 'MEMBER'\s*&& request\.resource\.data\.status == 'ACTIVE';/,
  `allow create: if isAuthenticated() && request.auth.uid == userId
                    && request.resource.data.role == 'MEMBER'
                    && request.resource.data.membershipStatus == 'PENDING';`
);

// Allow users to update their own docs, but not their role or membershipStatus, unless they are admin
rules = rules.replace(
  /allow update: if isAuthenticated\(\) &&\s*\(\(request\.auth\.uid == userId\s*&& request\.resource\.data\.role == resource\.data\.role\s*&& request\.resource\.data\.status == resource\.data\.status\)\s*\|\| isAdmin\(\)\);/,
  `allow update: if isAdmin() || (
        isAuthenticated() && request.auth.uid == userId
        && request.resource.data.role == resource.data.role
        && request.resource.data.membershipStatus == resource.data.membershipStatus
      );`
);

fs.writeFileSync('firestore.rules', rules);

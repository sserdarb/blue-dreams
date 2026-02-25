const fs = require('fs');
const file = 'app/[locale]/admin/page.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Replace t('something') with (t as any).something
txt = txt.replace(/t\('([^']+)'\)/g, function (match, p1) {
    return "(t as any)." + p1;
});

// Since AdminTranslations has properties, another approach is to keep it typed:
// But it complains "This expression is not callable" because it's an object.
// We'll use (t as any).property

fs.writeFileSync(file, txt);
console.log("Fixed page.tsx");

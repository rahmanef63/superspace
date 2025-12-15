const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'features');
const features = fs.readdirSync(featuresDir).filter(f => fs.statSync(path.join(featuresDir, f)).isDirectory());

const report = {};

function grepRecursive(dir, pattern, exclude = []) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (exclude.includes(file)) continue;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            results = results.concat(grepRecursive(filePath, pattern, exclude));
        } else {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content.match(pattern)) {
                results.push(filePath);
            }
        }
    }
    return results;
}

function countTodos(dir) {
    const files = grepRecursive(dir, /TODO:/);
    return files.length;
}

function checkLayoutUsage(dir) {
    if (!fs.existsSync(dir)) return "N/A";
    // Look for standard layout components in likely view files
    const viewFiles = grepRecursive(dir, /FeatureLayout|ThreeColumnLayout|PageContainer|Layout|MainLayout/);
    return viewFiles.length > 0;
}

features.forEach(feature => {
    if (feature.startsWith('_') || feature === 'menu-store' || feature === 'workspace-store' || feature === 'industryTemplates') return;

    const featurePath = path.join(featuresDir, feature);

    report[feature] = {
        hasConsistentLayout: checkLayoutUsage(featurePath),
        todoCount: countTodos(featurePath)
    };
});

console.log(JSON.stringify(report, null, 2));

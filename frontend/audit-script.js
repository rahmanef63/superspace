const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'features');
const features = fs.readdirSync(featuresDir).filter(f => fs.statSync(path.join(featuresDir, f)).isDirectory());

const failures = {};

features.forEach(feature => {
    if (feature.startsWith('_') || feature === 'menu-store' || feature === 'workspace-store' || feature === 'industryTemplates') return;

    const featurePath = path.join(featuresDir, feature);
    const checks = {
        hasConfig: fs.existsSync(path.join(featurePath, 'config.ts')),
        hasAgentsIndex: fs.existsSync(path.join(featurePath, 'agents', 'index.ts')),
        hasSettingsIndex: fs.existsSync(path.join(featurePath, 'settings', 'index.ts')),
        hasSettingsComponent: false,
        hasSettingsHook: false
    };

    if (fs.existsSync(path.join(featurePath, 'settings'))) {
        const settingsFiles = fs.readdirSync(path.join(featurePath, 'settings'));
        checks.hasSettingsComponent = settingsFiles.some(f => f.endsWith('Settings.tsx'));
        checks.hasSettingsHook = settingsFiles.some(f => f.startsWith('use') && f.endsWith('Settings.ts'));
    }

    const failed = Object.entries(checks).filter(([k, v]) => !v).map(([k]) => k);
    if (failed.length > 0) {
        failures[feature] = failed;
    }
});

console.log(JSON.stringify(failures, null, 2));

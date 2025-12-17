const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'features');
const features = fs.readdirSync(featuresDir).filter(f => fs.statSync(path.join(featuresDir, f)).isDirectory());

features.forEach(feature => {
    if (feature.startsWith('_')) return;

    const featurePath = path.join(featuresDir, feature);
    const agentsDir = path.join(featurePath, 'agents');

    if (!fs.existsSync(agentsDir)) {
        fs.mkdirSync(agentsDir, { recursive: true });

        const indexFile = path.join(agentsDir, 'index.ts');
        if (!fs.existsSync(indexFile)) {
            const content = `/**
 * Server-side agents/tools for ${feature}
 */

export const tools = [];
`;
            fs.writeFileSync(indexFile, content);

        }
    }
});

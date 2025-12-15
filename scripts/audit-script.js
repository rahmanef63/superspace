const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'features');
const features = fs.readdirSync(featuresDir).filter(f => fs.statSync(path.join(featuresDir, f)).isDirectory());

const report = {};

features.forEach(feature => {
    if (feature.startsWith('_')) return;

    const featurePath = path.join(featuresDir, feature);
    const checks = {
        hasAgents: fs.existsSync(path.join(featurePath, 'agents')),
        hasMutations: fs.existsSync(path.join(featurePath, 'mutations.ts')),
        hasRequirePermission: true,
        hasLogAuditEvent: true
    };

    if (checks.hasMutations) {
        const content = fs.readFileSync(path.join(featurePath, 'mutations.ts'), 'utf-8');
        // Simple heuristic: if it exports a mutation, it should have the checks.
        // We look for "mutation({" and then check if the file contains the imports/calls.
        // This is a rough check. Ideally checking per-handler.

        if (content.includes('mutation({')) {
            checks.hasRequirePermission = content.includes('requirePermission');
            checks.hasLogAuditEvent = content.includes('logAuditEvent');
        } else {
            // NO mutations? might be empty.
            checks.hasRequirePermission = "N/A";
            checks.hasLogAuditEvent = "N/A";
        }
    } else {
        checks.hasRequirePermission = "N/A";
        checks.hasLogAuditEvent = "N/A";
    }

    const failed = [];
    if (!checks.hasAgents) failed.push('hasAgents');
    if (checks.hasMutations) {
        if (checks.hasRequirePermission === false) failed.push('hasRequirePermission');
        if (checks.hasLogAuditEvent === false) failed.push('hasLogAuditEvent');
    }

    if (failed.length > 0) {
        report[feature] = failed;
    }
});

console.log(JSON.stringify(report, null, 2));

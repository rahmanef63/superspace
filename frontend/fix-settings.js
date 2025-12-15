const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'features');

const specialCase = {
    'bi': 'BI',
    'hr': 'HR',
    'pos': 'POS',
    'crm': 'CRM',
    'cms-lite': 'CmsLite', // Special case
    'api-access': 'ApiAccess'
};

function toPascalCase(str) {
    if (specialCase[str]) return specialCase[str];
    return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toConstantCase(str) {
    return str.replace(/-/g, '_').toUpperCase();
}

const targets = [
    'accounting', 'approvals', 'audit-log', 'bi', 'builder',
    'contact', 'content', 'hr', 'import-export', 'integrations',
    'overview', 'platform-admin', 'pos', 'sales', 'user-management'
];

targets.forEach(feature => {
    const PascalName = toPascalCase(feature);
    const ConstantName = toConstantCase(feature);
    const featurePath = path.join(featuresDir, feature);
    const settingsDir = path.join(featurePath, 'settings');

    if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
    }

    // 1. useXxxSettings.ts
    const hookFileName = `use${PascalName}Settings.ts`;
    const hookFilePath = path.join(settingsDir, hookFileName);

    if (!fs.existsSync(hookFilePath)) {
        const hookContent = `"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface ${PascalName}SettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_${ConstantName}_SETTINGS: ${PascalName}SettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const use${PascalName}SettingsStorage = createFeatureSettingsHook<${PascalName}SettingsSchema>(
    "${feature}",
    DEFAULT_${ConstantName}_SETTINGS
)
`;
        fs.writeFileSync(hookFilePath, hookContent);
        console.log(`Created ${hookFileName}`);
    }

    // 2. XxxSettings.tsx
    const compFileName = `${PascalName}Settings.tsx`;
    const compFilePath = path.join(settingsDir, compFileName);

    if (!fs.existsSync(compFilePath)) {
        const compContent = `"use client"

import { use${PascalName}SettingsStorage } from "./use${PascalName}Settings"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ${PascalName}Settings() {
    const [settings, setSettings] = use${PascalName}SettingsStorage()

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure general preferences for ${feature}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications for updates
                            </p>
                        </div>
                        <Switch
                            checked={settings.notificationsEnabled}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, notificationsEnabled: checked })
                            }
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto Save</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically save changes
                            </p>
                        </div>
                        <Switch
                            checked={settings.autoSave}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, autoSave: checked })
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
`;
        fs.writeFileSync(compFilePath, compContent);
        console.log(`Created ${compFileName}`);
    }

    // 3. index.ts
    const indexFilePath = path.join(settingsDir, 'index.ts');
    // We overwrite index.ts to ensure exports are correct
    const indexContent = `export { ${PascalName}Settings } from "./${PascalName}Settings"
export { 
    use${PascalName}SettingsStorage,
    DEFAULT_${ConstantName}_SETTINGS,
    type ${PascalName}SettingsSchema 
} from "./use${PascalName}Settings"
`;
    fs.writeFileSync(indexFilePath, indexContent);
    console.log(`Updated index.ts for ${feature}`);
});

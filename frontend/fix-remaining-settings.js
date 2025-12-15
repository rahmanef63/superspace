const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'features');

const missing = [
    { slug: 'cms-lite', pascal: 'CmsLite', constant: 'CMS_LITE' },
    { slug: 'communications', pascal: 'Communications', constant: 'COMMUNICATIONS' }
];

missing.forEach(({ slug, pascal, constant }) => {
    const featurePath = path.join(featuresDir, slug);
    const settingsDir = path.join(featurePath, 'settings');

    if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
    }

    // Hook
    const hookFile = path.join(settingsDir, `use${pascal}Settings.ts`);
    const hookContent = `"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface ${pascal}SettingsSchema {
    notificationsEnabled: boolean
}

export const DEFAULT_${constant}_SETTINGS: ${pascal}SettingsSchema = {
    notificationsEnabled: true
}

export const use${pascal}SettingsStorage = createFeatureSettingsHook<${pascal}SettingsSchema>(
    "${slug}",
    DEFAULT_${constant}_SETTINGS
)
`;
    fs.writeFileSync(hookFile, hookContent);
    console.log(`Created use${pascal}Settings.ts`);

    // Component
    const compFile = path.join(settingsDir, `${pascal}Settings.tsx`);
    const compContent = `"use client"

import { use${pascal}SettingsStorage } from "./use${pascal}Settings"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ${pascal}Settings() {
    const [settings, setSettings] = use${pascal}SettingsStorage()

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage settings for ${slug}</CardDescription>
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
                </CardContent>
            </Card>
        </div>
    )
}
`;
    fs.writeFileSync(compFile, compContent);
    console.log(`Created ${pascal}Settings.tsx`);

    // Index
    const indexFile = path.join(settingsDir, 'index.ts');
    const indexContent = `export { ${pascal}Settings } from "./${pascal}Settings"
export { 
    use${pascal}SettingsStorage,
    DEFAULT_${constant}_SETTINGS,
    type ${pascal}SettingsSchema 
} from "./use${pascal}Settings"
`;
    fs.writeFileSync(indexFile, indexContent);
    console.log(`Updated index.ts for ${slug}`);
});

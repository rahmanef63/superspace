"use client";

import { Phone, Settings, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCallsSettings } from "./settings";

/**
 * Example Calls Page Component
 *
 * This demonstrates how to integrate feature settings with your feature UI.
 *
 * Key points:
 * 1. Call useCallsSettings() to auto-register settings
 * 2. Add a settings icon that navigates to workspace settings
 * 3. Settings automatically appear/disappear based on feature installation
 */
export function CallsPageExample() {
  const router = useRouter();

  // ✨ This single line registers all calls settings!
  // When this component mounts, calls settings appear in workspace settings.
  // When it unmounts, they're automatically cleaned up.
  useCallsSettings();

  const handleOpenSettings = () => {
    // Navigate to workspace settings and pre-select calls quality category
    router.push('/dashboard/settings?category=calls-quality');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Settings Icon */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          <h1 className="text-xl font-semibold">Calls</h1>
        </div>

        {/* Settings Icon - Opens workspace settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenSettings}
          title="Call Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Call Content */}
      <div className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Video className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-lg font-medium">No active calls</h2>
          <p className="text-sm text-muted-foreground">
            Your call history and recent calls will appear here
          </p>

          <div className="mt-4">
            <Button onClick={handleOpenSettings} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure Call Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * USAGE NOTES:
 *
 * 1. Import and use this component in your calls route:
 *    ```tsx
 *    // app/dashboard/calls/page.tsx
 *    import { CallsPageExample } from '@/frontend/features/chat/components/calls/EXAMPLE_PAGE';
 *
 *    export default function CallsPage() {
 *      return <CallsPageExample />;
 *    }
 *    ```
 *
 * 2. The settings will automatically appear in workspace settings when:
 *    - The calls feature is installed (in features.config.ts)
 *    - The user navigates to the calls page
 *    - The component is mounted
 *
 * 3. Settings automatically disappear when:
 *    - The user navigates away from calls
 *    - The feature is uninstalled
 *    - The component unmounts
 *
 * 4. Users can access settings via:
 *    - The settings icon in the calls header
 *    - Direct navigation to /dashboard/settings
 *    - Settings appear under "Calls" group in sidebar
 */

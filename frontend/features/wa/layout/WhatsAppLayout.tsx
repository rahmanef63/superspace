import { useInitializeWhatsApp } from '../shared/hooks';
import { WhatsAppSidebarProvider } from './sidebar-wa';
import { ChatsView } from '../components/chat/ChatsView';
import { CallsView } from '../components/calls/CallsView';
import { StatusView } from '../components/status/StatusView';
import { AIView } from '../components/ai/AIView';
import { StarredView } from '../components/starred/StarredView';
import { ArchivedView } from '../components/archived/ArchivedView';
import { SettingsView } from '../components/settings/SettingsView';
import { useWhatsAppStore } from '../shared/stores';
import type { TabType } from '../shared/types';

const VIEW_COMPONENTS: Record<TabType, React.ComponentType> = {
  chats: ChatsView,
  calls: CallsView,
  status: StatusView,
  ai: AIView,
  starred: StarredView,
  archived: ArchivedView,
  settings: SettingsView,
  profile: SettingsView,
};

export function WhatsAppLayout() {
  useInitializeWhatsApp();
  
  const { activeTab } = useWhatsAppStore();
  const ActiveView = VIEW_COMPONENTS[activeTab] || ChatsView;

  return (
    <WhatsAppSidebarProvider>
      <div className="flex-1">
        <ActiveView />
      </div>
    </WhatsAppSidebarProvider>
  );
}

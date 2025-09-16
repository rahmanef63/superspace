import { useInitializeWhatsApp } from '../shared/hooks';
import { WhatsAppSidebarProvider } from './sidebar-wa';
import { ChatsView } from '../views/ChatsView';
import { CallsView } from '../views/CallsView';
import { StatusView } from '../views/StatusView';
import { AIView } from '../views/AIView';
import { StarredView } from '../views/StarredView';
import { ArchivedView } from '../views/ArchivedView';
import { SettingsView } from '../views/SettingsView';
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

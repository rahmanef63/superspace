import { TooltipProvider } from "@/components/ui/tooltip";
import WAChatsPage from "./components/chat/page";

const Message = () => {
  return (
    <TooltipProvider>
      <WAChatsPage />
    </TooltipProvider>
  );
};

export default Message;

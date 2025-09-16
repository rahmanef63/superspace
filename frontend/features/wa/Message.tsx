import { TooltipProvider } from "@/components/ui/tooltip";
import { WhatsAppLayout } from "./layout";

const Message = () => {
  return (
      <TooltipProvider>
        <WhatsAppLayout />
      </TooltipProvider>
  );
};

export default Message;

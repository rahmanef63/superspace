import { Button } from "@/components/ui/button";
import { ExternalLink, Star, HelpCircle, FileText, Shield } from "lucide-react";

export function HelpSettings() {
  const helpLinks = [
    {
      icon: HelpCircle,
      label: "Contact us",
      description: "We'd like to know your thoughts about this app.",
      action: "Contact us"
    },
    {
      icon: Star,
      label: "Rate the app",
      description: "Tell us what you think about Chats for Windows",
      action: "Rate the app"
    },
    {
      icon: HelpCircle,
      label: "Help center",
      description: "Find answers to frequently asked questions",
      action: "Help center"
    },
    {
      icon: FileText,
      label: "Licenses",
      description: "View third-party licenses and attributions",
      action: "Licenses"
    },
    {
      icon: Shield,
      label: "Terms and Privacy Policy",
      description: "Read our terms of service and privacy policy",
      action: "Terms and Privacy Policy"
    }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Help</h1>
      
      <div className="space-y-6">
        {/* Chats Info */}
        <section>
          <div className="bg-card rounded-lg border p-6 text-center">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Chats for Windows</h2>
            <p className="text-muted-foreground mb-4">Version 2.2534.2.0</p>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Contact us</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            We'd like to know your thoughts about this app.
          </p>
          
          <div className="space-y-3">
            {helpLinks.slice(0, 2).map((item) => (
              <Button
                key={item.label}
                variant="outline"
                className="w-full justify-start text-left h-auto p-4"
              >
                <item.icon className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-card-foreground">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</div>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Button>
            ))}
          </div>
        </section>

        {/* Additional Resources */}
        <section>
          <div className="space-y-3">
            {helpLinks.slice(2).map((item) => (
              <Button
                key={item.label}
                variant="outline"
                className="w-full justify-start text-left h-auto p-4"
              >
                <item.icon className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-card-foreground">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</div>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Button>
            ))}
          </div>
        </section>

        {/* Copyright */}
        <section className="pt-6 text-center border-t">
          <p className="text-sm text-muted-foreground">2025 © Chats Inc.</p>
        </section>
      </div>
    </div>
  );
}

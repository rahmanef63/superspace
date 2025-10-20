import { Shield, Users, Info, UserPlus, Eye, Phone } from "lucide-react";

export function AccountSettings() {
  const privacySettings = [
    {
      icon: Eye,
      label: "Last seen and online",
      value: "Nobody, Everyone",
      description: "If you don't share your Last Seen, you won't be able to see other people's Last Seen."
    },
    {
      icon: Users,
      label: "Profile photo",
      value: "My contacts"
    },
    {
      icon: Info,
      label: "About",
      value: "My contacts"
    },
    {
      icon: UserPlus,
      label: "Add to groups",
      value: "My contacts"
    },
    {
      icon: Phone,
      label: "Read receipts",
      value: "On",
      description: "Read receipts are always sent for group chats"
    }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Account</h1>
      
      <div className="space-y-6">
        {/* Privacy Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Privacy</h2>
          <p className="text-sm text-muted-foreground mb-4 italic">Managed on your phone</p>
          
          <div className="bg-card rounded-lg border divide-y">
            {privacySettings.map((setting) => (
              <div key={setting.label} className="p-4">
                <div className="flex items-start gap-3 mb-2">
                  <setting.icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-card-foreground">{setting.label}</h3>
                    <p className="text-sm text-muted-foreground break-words">{setting.value}</p>
                  </div>
                </div>
                {setting.description && (
                  <p className="text-xs text-muted-foreground mt-2 ml-8 leading-relaxed">
                    {setting.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Blocked Members Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Blocked contacts</h2>
          <p className="text-sm text-muted-foreground mb-4 italic">Managed on your phone</p>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium text-card-foreground">34 blocked contacts</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

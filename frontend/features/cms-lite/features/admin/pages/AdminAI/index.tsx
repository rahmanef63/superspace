import { useEffect, useState } from "react";
import { useBackend } from "../../../../shared/hooks/useBackend";
import { LoadingSpinner } from "../../../../shared/components/Loading";
import { ErrorState } from "../../../../shared/components/ErrorState";
import { Button } from "../../../../shared/components/Button";
import { Input, Textarea, Select } from "../../../../shared/components/Form";
import { Modal } from "../../../../shared/components/Modal";
import { AlertCircle, TrendingUp, MessageSquare, Globe, Plus, Trash2, Pencil, FileText } from "lucide-react";
import ErrorBoundary from "../../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";

// Placeholder type until backend is integrated
interface KBDocument {
  id: string | number;
  title: string;
  content: string;
  fileUrl?: string;
  category: string;
  active?: boolean;
  createdAt: Date;
}

interface ErrorLog {
  id: number;
  errorType: string;
  errorMessage: string;
  userMessage: string;
  locale: string;
  context: any;
  createdAt: Date;
}

interface UsageStats {
  totalRequests: number;
  rateLimitedRequests: number;
  averageMessageLength: number;
  averageResponseLength: number;
  requestsByLocale: Record<string, number>;
  recentActivity: {
    id: number;
    userId: string;
    messageLength: number;
    responseLength: number;
    referencesCount: number;
    locale: string;
    rateLimited: boolean;
    createdAt: Date;
  }[];
}

export default function AdminAI() {
  const backend = useBackend();
  const { toast } = useToast();
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [kbDocuments, setKbDocuments] = useState<KBDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "errors" | "activity" | "settings" | "knowledge" | "prompts">("stats");

  const [isKBFormOpen, setIsKBFormOpen] = useState(false);
  const [editingKBDoc, setEditingKBDoc] = useState<KBDocument | null>(null);
  const [kbForm, setKbForm] = useState({
    title: "",
    content: "",
    fileUrl: "",
    category: "general",
  });

  const [formData, setFormData] = useState({
    enabled: true,
    defaultLocale: "en",
    rateLimitPerMinute: 10,
    rateLimitPerHour: 100,
    systemPromptId: "",
    systemPromptEn: "",
    systemPromptAr: "",
    personality: "professional",
    customPersonality: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [errorsRes, statsRes, settingsData, kbData] = await Promise.all([
        backend.ai.getErrors({ limit: 50 }),
        backend.ai.getStats(),
        backend.ai.getSettings(),
        backend.ai.listKBDocuments(),
      ]);
      setErrors(errorsRes.errors);
      setStats(statsRes);
      setSettings(settingsData);
      setKbDocuments(kbData.documents);
      setFormData({
        enabled: settingsData.enabled,
        defaultLocale: settingsData.defaultLocale,
        rateLimitPerMinute: settingsData.rateLimitPerMinute,
        rateLimitPerHour: settingsData.rateLimitPerHour,
        systemPromptId: settingsData.systemPromptId || "",
        systemPromptEn: settingsData.systemPromptEn || "",
        systemPromptAr: settingsData.systemPromptAr || "",
        personality: settingsData.personality || "professional",
        customPersonality: settingsData.customPersonality || "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err);
      toast({
        title: "Failed to load AI data",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await backend.ai.updateSettings(formData);
      toast({ title: "AI settings updated successfully" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error updating settings", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateKBDoc = () => {
    setEditingKBDoc(null);
    setKbForm({ title: "", content: "", fileUrl: "", category: "general" });
    setIsKBFormOpen(true);
  };

  const handleEditKBDoc = (doc: KBDocument) => {
    setEditingKBDoc(doc);
    setKbForm({
      title: doc.title,
      content: doc.content,
      fileUrl: doc.fileUrl || "",
      category: doc.category,
    });
    setIsKBFormOpen(true);
  };

  const handleSaveKBDoc = async () => {
    try {
      setSaving(true);
      if (editingKBDoc) {
        await backend.ai.updateKBDocument({
          id: editingKBDoc.id,
          ...kbForm,
        });
        toast({ title: "Knowledge base document updated" });
      } else {
        await backend.ai.createKBDocument(kbForm);
        toast({ title: "Knowledge base document created" });
      }
      setIsKBFormOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error saving document", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKBDoc = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await backend.ai.deleteKBDocument({ id });
      toast({ title: "Document deleted" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error deleting document", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={loadData} />;
  }

  return (
    <ErrorBoundary>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AI Chatbot</h1>
          <Button onClick={loadData} size="sm" variant="ghost">
            Refresh
          </Button>
        </div>

        <div className="mb-6 flex gap-2 border-b overflow-x-auto">
          {(["stats", "errors", "activity", "settings", "knowledge", "prompts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize whitespace-nowrap ${
                activeTab === tab
                  ? "border-b-2 border-primary font-medium"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "stats" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Total Requests</h3>
                </div>
                <p className="text-3xl font-bold">{stats.totalRequests}</p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-medium">Rate Limited</h3>
                </div>
                <p className="text-3xl font-bold">{stats.rateLimitedRequests}</p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h3 className="font-medium">Avg Message</h3>
                </div>
                <p className="text-3xl font-bold">{stats.averageMessageLength}</p>
                <p className="text-sm text-foreground/60">characters</p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <h3 className="font-medium">Avg Response</h3>
                </div>
                <p className="text-3xl font-bold">{stats.averageResponseLength}</p>
                <p className="text-sm text-foreground/60">characters</p>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-lg">Requests by Language</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(stats.requestsByLocale).map(([locale, count]) => (
                  <div key={locale} className="flex items-center justify-between">
                    <span className="font-medium uppercase">{locale}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-48 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(count / stats.totalRequests) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-foreground/60 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "errors" && (
          <div className="bg-card border rounded-lg">
            {errors.length === 0 ? (
              <div className="p-12 text-center text-foreground/60">
                No errors logged
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Message</th>
                      <th className="text-left p-4">User Message</th>
                      <th className="text-left p-4">Locale</th>
                      <th className="text-left p-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((error) => (
                      <tr key={error.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                            {error.errorType}
                          </span>
                        </td>
                        <td className="p-4 max-w-md truncate">{error.errorMessage}</td>
                        <td className="p-4 max-w-xs truncate">{error.userMessage}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-muted rounded text-xs">
                            {error.locale.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-foreground/60">
                          {new Date(error.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && stats && (
          <div className="bg-card border rounded-lg">
            {stats.recentActivity.length === 0 ? (
              <div className="p-12 text-center text-foreground/60">
                No activity yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Message Length</th>
                      <th className="text-left p-4">Response Length</th>
                      <th className="text-left p-4">References</th>
                      <th className="text-left p-4">Locale</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentActivity.map((activity) => (
                      <tr key={activity.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{activity.userId}</td>
                        <td className="p-4">{activity.messageLength}</td>
                        <td className="p-4">{activity.responseLength}</td>
                        <td className="p-4">{activity.referencesCount}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-muted rounded text-xs">
                            {activity.locale.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          {activity.rateLimited ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                              Rate Limited
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              Success
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-foreground/60">
                          {new Date(activity.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card border p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">General Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="mr-3 h-4 w-4"
                  />
                  <label htmlFor="enabled" className="font-medium">
                    Enable AI Chatbot
                  </label>
                </div>

                <Select
                  label="Default Locale"
                  value={formData.defaultLocale}
                  onChange={(value) => setFormData({ ...formData, defaultLocale: value })}
                  options={[
                    { value: "id", label: "Indonesian" },
                    { value: "en", label: "English" },
                    { value: "ar", label: "Arabic" },
                  ]}
                />
              </div>
            </div>

            <div className="bg-card border p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Personality</h2>

              <div className="space-y-4">
                <Select
                  label="Personality Type"
                  value={formData.personality}
                  onChange={(value) => setFormData({ ...formData, personality: value })}
                  options={[
                    { value: "professional", label: "Professional" },
                    { value: "friendly", label: "Friendly" },
                    { value: "casual", label: "Casual" },
                    { value: "enthusiastic", label: "Enthusiastic" },
                    { value: "formal", label: "Formal" },
                    { value: "custom", label: "Custom" },
                  ]}
                />

                {formData.personality === "custom" && (
                  <Textarea
                    label="Custom Personality Instructions"
                    value={formData.customPersonality}
                    onChange={(value) => setFormData({ ...formData, customPersonality: value })}
                    rows={4}
                    placeholder="Describe the personality traits and behavior for the AI chatbot..."
                  />
                )}
              </div>
            </div>

            <div className="bg-card border p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Rate Limiting</h2>

              <div className="space-y-4">
                <Input
                  label="Requests per Minute"
                  type="number"
                  value={String(formData.rateLimitPerMinute)}
                  onChange={(value) => setFormData({ ...formData, rateLimitPerMinute: Number(value) })}
                  min={1}
                  max={100}
                />

                <Input
                  label="Requests per Hour"
                  type="number"
                  value={String(formData.rateLimitPerHour)}
                  onChange={(value) => setFormData({ ...formData, rateLimitPerHour: Number(value) })}
                  min={1}
                  max={1000}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        )}

        {activeTab === "knowledge" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-foreground/60">
                Upload custom documents to enhance the AI's knowledge base
              </p>
              <Button onClick={handleCreateKBDoc}>
                <Plus className="w-4 h-4" />
                Add Document
              </Button>
            </div>

            {kbDocuments.length === 0 ? (
              <div className="bg-card border rounded-lg p-12 text-center text-foreground/60">
                No custom knowledge base documents yet
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4">Title</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kbDocuments.map((doc) => (
                      <tr key={doc.id} className="border-t hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-sm text-foreground/60 line-clamp-1">
                                {doc.content.substring(0, 100)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-muted rounded text-xs">
                            {doc.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              doc.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {doc.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditKBDoc(doc)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteKBDoc(doc.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "prompts" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card border p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Custom System Prompts</h2>
              <p className="text-sm text-foreground/60 mb-4">
                Leave empty to use default prompts
              </p>

              <div className="space-y-4">
                <Textarea
                  label="Indonesian Prompt"
                  value={formData.systemPromptId}
                  onChange={(value) => setFormData({ ...formData, systemPromptId: value })}
                  rows={6}
                  placeholder="Custom system prompt in Indonesian..."
                />

                <Textarea
                  label="English Prompt"
                  value={formData.systemPromptEn}
                  onChange={(value) => setFormData({ ...formData, systemPromptEn: value })}
                  rows={6}
                  placeholder="Custom system prompt in English..."
                />

                <Textarea
                  label="Arabic Prompt"
                  value={formData.systemPromptAr}
                  onChange={(value) => setFormData({ ...formData, systemPromptAr: value })}
                  rows={6}
                  placeholder="Custom system prompt in Arabic..."
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The GROQ_API_KEY should be configured in Settings → Secrets
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Prompts"}
              </Button>
            </div>
          </form>
        )}

        <Modal
          isOpen={isKBFormOpen}
          onClose={() => setIsKBFormOpen(false)}
          title={editingKBDoc ? "Edit Knowledge Base Document" : "Add Knowledge Base Document"}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={kbForm.title}
              onChange={(value) => setKbForm({ ...kbForm, title: value })}
              required
            />

            <Select
              label="Category"
              value={kbForm.category}
              onChange={(value) => setKbForm({ ...kbForm, category: value })}
              options={[
                { value: "general", label: "General" },
                { value: "services", label: "Services" },
                { value: "products", label: "Products" },
                { value: "policies", label: "Policies" },
                { value: "faq", label: "FAQ" },
              ]}
            />

            <Input
              label="File URL (optional)"
              value={kbForm.fileUrl}
              onChange={(value) => setKbForm({ ...kbForm, fileUrl: value })}
              placeholder="https://example.com/document.pdf"
            />

            <Textarea
              label="Content"
              value={kbForm.content}
              onChange={(value) => setKbForm({ ...kbForm, content: value })}
              rows={10}
              placeholder="Enter the document content here..."
              required
            />

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsKBFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveKBDoc} disabled={saving}>
                {saving ? "Saving..." : "Save Document"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}

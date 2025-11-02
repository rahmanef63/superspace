import { useEffect, useState } from "react";
import { useWebsiteSettings, useWorkspaceId } from "../../../shared/hooks/useWebsiteSettings";
import { Button } from "../../../shared/components/Button";
import { Input, Select } from "../../../shared/components/Form";
import { Save, Globe, Search, BarChart, CheckCircle, XCircle, Copy, ExternalLink, AlertCircle } from "lucide-react";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminWebsiteSettings() {
  const { toast } = useToast();
  const workspaceId = useWorkspaceId();
  
  // Get website settings from Convex
  const { settings, loading, updateSettings, verifyDomain: verifyDomainMutation } = useWebsiteSettings(
    workspaceId
  );
  
  const [form, setForm] = useState({
    // Domain Settings
    customDomain: "",
    subdomain: "",
    useCustomDomain: false,
    
    // SEO Settings
    siteTitle: "",
    siteDescription: "",
    keywords: "",
    favicon: "",
    ogImage: "",
    
    // Analytics
    googleAnalyticsId: "",
    facebookPixelId: "",
    
    // Social Media
    twitterHandle: "",
    facebookPage: "",
    linkedinPage: "",
    
    // Advanced
    robotsTxt: "User-agent: *\nAllow: /",
    customCss: "",
    customHeadCode: "",
  });
  
  const [saving, setSaving] = useState(false);
  const [domainVerified, setDomainVerified] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  
  // Validation states
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Generate subdomain suggestion from workspace name
  const suggestedSubdomain = "yoursite"; // TODO: Get from workspace name

  // Check subdomain availability
  const subdomainAvailable = useQuery(
    api.features.cms_lite.website_settings.api.queries.isSubdomainAvailable,
    checkingSubdomain && form.subdomain 
      ? { subdomain: form.subdomain, excludeWorkspaceId: workspaceId! }
      : "skip"
  );

  // Load settings from Convex when available
  useEffect(() => {
    if (settings) {
      logger.loaded("website settings", "Convex");
      setForm({
        customDomain: settings.customDomain || "",
        subdomain: settings.subdomain || suggestedSubdomain,
        useCustomDomain: settings.useCustomDomain || false,
        siteTitle: settings.siteTitle || "",
        siteDescription: settings.siteDescription || "",
        keywords: settings.keywords || "",
        favicon: settings.favicon || "",
        ogImage: settings.ogImage || "",
        googleAnalyticsId: settings.googleAnalyticsId || "",
        facebookPixelId: settings.facebookPixelId || "",
        twitterHandle: settings.twitterHandle || "",
        facebookPage: settings.facebookPage || "",
        linkedinPage: settings.linkedinPage || "",
        robotsTxt: settings.robotsTxt || "User-agent: *\nAllow: /",
        customCss: settings.customCss || "",
        customHeadCode: settings.customHeadCode || "",
      });
      setDomainVerified(settings.domainVerified || false);
    }
  }, [settings, suggestedSubdomain]);

  // Validate subdomain format
  const validateSubdomain = (value: string): string | null => {
    if (!value) return "Subdomain is required";
    if (value.length < 3) return "Subdomain must be at least 3 characters";
    if (value.length > 63) return "Subdomain must be less than 63 characters";
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value)) {
      return "Subdomain can only contain lowercase letters, numbers, and hyphens (cannot start/end with hyphen)";
    }
    return null;
  };

  // Validate URL format
  const validateUrl = (url: string, fieldName: string): string | null => {
    if (!url) return null; // Optional field
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return null;
    } catch {
      return `${fieldName} must be a valid URL`;
    }
  };

  // Validate Google Analytics ID
  const validateGoogleAnalyticsId = (id: string): string | null => {
    if (!id) return null;
    if (!/^(G|UA|GT)-[A-Z0-9]+$/.test(id)) {
      return "Google Analytics ID format: G-XXXXXXXXXX or UA-XXXXXXXXX";
    }
    return null;
  };

  // Validate Facebook Pixel ID
  const validateFacebookPixelId = (id: string): string | null => {
    if (!id) return null;
    if (!/^\d{15,16}$/.test(id)) {
      return "Facebook Pixel ID must be 15-16 digits";
    }
    return null;
  };

  // Handle subdomain change with debounced validation
  useEffect(() => {
    // Clear previous errors and validation state when subdomain changes
    setSubdomainError(null);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.subdomain;
      return newErrors;
    });
    
    const formatError = validateSubdomain(form.subdomain);
    if (formatError) {
      setSubdomainError(formatError);
      setCheckingSubdomain(false);
      return;
    }

    // Check availability after 500ms delay
    const timer = setTimeout(() => {
      setCheckingSubdomain(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [form.subdomain]);

  // Handle availability check result
  useEffect(() => {
    if (checkingSubdomain && subdomainAvailable !== undefined) {
      if (!subdomainAvailable) {
        setSubdomainError("This subdomain is already taken. Please choose another.");
      } else {
        setSubdomainError(null);
      }
      setCheckingSubdomain(false);
    }
  }, [subdomainAvailable, checkingSubdomain]);

  // Real-time validation - run whenever form changes
  useEffect(() => {
    validateForm();
  }, [
    form.subdomain,
    form.customDomain,
    form.useCustomDomain,
    form.favicon,
    form.ogImage,
    form.siteDescription,
    form.googleAnalyticsId,
    form.facebookPixelId,
    subdomainAvailable,
    checkingSubdomain,
    domainVerified,
  ]);

  // Validate all form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Subdomain validation
    if (!form.useCustomDomain) {
      const subdomainErr = validateSubdomain(form.subdomain);
      if (subdomainErr) {
        errors.subdomain = subdomainErr;
      } else if (checkingSubdomain) {
        errors.subdomain = "Checking availability...";
      } else if (subdomainAvailable === false) {
        errors.subdomain = "Subdomain is already taken";
      }
    }

    // Custom domain validation
    if (form.useCustomDomain) {
      const domainErr = validateUrl(form.customDomain, "Custom domain");
      if (domainErr) errors.customDomain = domainErr;
      if (!domainVerified) errors.customDomain = "Custom domain must be verified before use";
    }

    // URL validations
    const faviconErr = validateUrl(form.favicon, "Favicon URL");
    if (faviconErr) errors.favicon = faviconErr;

    const ogImageErr = validateUrl(form.ogImage, "OG Image URL");
    if (ogImageErr) errors.ogImage = ogImageErr;

    // Analytics validations
    const gaErr = validateGoogleAnalyticsId(form.googleAnalyticsId);
    if (gaErr) errors.googleAnalyticsId = gaErr;

    const fbErr = validateFacebookPixelId(form.facebookPixelId);
    if (fbErr) errors.facebookPixelId = fbErr;

    // Character limit validations
    if (form.siteDescription.length > 160) {
      errors.siteDescription = "Description must be 160 characters or less";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!workspaceId) {
      toast({
        title: "No workspace found",
        description: "Please make sure you're logged in",
        variant: "destructive",
      });
      return;
    }

    // Validate form before saving
    if (!validateForm()) {
      toast({
        title: "Validation errors",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    logger.save("website settings", "Convex", form);
    
    try {
      await updateSettings(form);
      logger.saved("website settings", "Convex");
      toast({ 
        title: "✅ Settings saved!",
        description: "Your website settings have been updated successfully",
      });
      setValidationErrors({});
    } catch (err: any) {
      logger.error("menyimpan", "website settings", err);
      toast({
        title: "Failed to save settings",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!workspaceId) {
      toast({
        title: "No workspace found",
        description: "Please make sure you're logged in",
        variant: "destructive",
      });
      return;
    }
    
    if (!form.customDomain) {
      toast({
        title: "Please enter a custom domain",
        variant: "destructive",
      });
      return;
    }

    setVerifyingDomain(true);
    logger.action(`Verifying domain: ${form.customDomain}`);
    
    try {
      // First, ensure settings exist by updating them
      await updateSettings({
        ...form,
        customDomain: form.customDomain,
        useCustomDomain: true,
      });
      
      // Then verify the domain
      const result = await verifyDomainMutation(form.customDomain);
      setDomainVerified(result.verified);
      
      logger.action(`Domain ${form.customDomain} verified successfully`);
      toast({ 
        title: "✅ Domain verified successfully!",
        description: `${form.customDomain} is now active`,
      });
    } catch (err: any) {
      logger.error("verify", "domain", err);
      console.error("❌ Error verify domain:", err);
      toast({
        title: "Domain verification failed",
        description: err?.message || "Please check your DNS settings.",
        variant: "destructive",
      });
      setDomainVerified(false);
    } finally {
      setVerifyingDomain(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ 
        title: "✅ Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const currentUrl = form.useCustomDomain && form.customDomain 
    ? `https://${form.customDomain}` 
    : `https://${form.subdomain || suggestedSubdomain}.superspace.app`;

  // Show loading state while workspace ID is being fetched or settings are loading
  if (!workspaceId || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {!workspaceId ? "Loading workspace..." : "Loading website settings..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Website Settings</h1>
            <p className="text-muted-foreground">
              Configure your website domain, SEO, and analytics
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving || Object.keys(validationErrors).length > 0}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Validation Errors Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Current Website URL */}
        <div className="mb-6 p-4 bg-muted rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your website is live at:</p>
            <a 
              href={currentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg font-medium text-primary hover:underline flex items-center gap-2"
            >
              {currentUrl}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => copyToClipboard(currentUrl, "Website URL")}
          >
            <Copy className="w-4 h-4" />
            Copy URL
          </Button>
        </div>

        <div className="space-y-6">
          {/* Domain Settings */}
          <div className="border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5" />
              <h2 className="text-xl font-bold">Domain Settings</h2>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">🎉 Free Superspace Subdomain</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your website is automatically available at a free subdomain
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">Subdomain *</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className={`${subdomainError ? "ring-2 ring-red-500 rounded-lg" : ""}`}>
                      <Input
                        value={form.subdomain || suggestedSubdomain}
                        onChange={(value) => setForm({ ...form, subdomain: value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        placeholder="yoursite"
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">.superspace.app</span>
                  {checkingSubdomain && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  )}
                  {!checkingSubdomain && !subdomainError && form.subdomain && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                {subdomainError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {subdomainError}
                  </p>
                )}
                {!subdomainError && form.subdomain && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Available: <strong>{form.subdomain}.superspace.app</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="useCustomDomain"
                  checked={form.useCustomDomain}
                  onChange={(e) => setForm({ ...form, useCustomDomain: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="useCustomDomain" className="font-medium">
                  Use Custom Domain (e.g., www.yoursite.com)
                </label>
              </div>

              {form.useCustomDomain && (
                <div className="space-y-4 pl-7">
                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Domain *</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className={`${validationErrors.customDomain ? "ring-2 ring-red-500 rounded-lg" : ""}`}>
                          <Input
                            value={form.customDomain}
                            onChange={(value) => setForm({ ...form, customDomain: value })}
                            placeholder="www.yoursite.com"
                          />
                        </div>
                        {validationErrors.customDomain && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {validationErrors.customDomain}
                          </p>
                        )}
                      </div>
                      <Button 
                        onClick={handleVerifyDomain} 
                        disabled={verifyingDomain || !form.customDomain}
                        variant="secondary"
                      >
                        {verifyingDomain ? "Verifying..." : "Verify Domain"}
                      </Button>
                    </div>
                  </div>

                  {domainVerified ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Domain verified and active</span>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Domain not verified</h4>
                          <p className="text-sm text-muted-foreground">
                            Add these DNS records to your domain provider:
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mt-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-muted-foreground">A Record</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => copyToClipboard("76.76.21.21", "IP Address")}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <code className="text-sm">@ → 76.76.21.21</code>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-muted-foreground">CNAME Record</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => copyToClipboard("cname.superspace.app", "CNAME")}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <code className="text-sm">www → cname.superspace.app</code>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        💡 DNS changes can take up to 24-48 hours to propagate
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SEO Settings */}
          <div className="border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5" />
              <h2 className="text-xl font-bold">SEO Settings</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Site Title</label>
              <Input
                value={form.siteTitle}
                onChange={(value) => setForm({ ...form, siteTitle: value })}
                placeholder="My Awesome Website"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Appears in browser tabs and search results
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Site Description</label>
              <textarea
                value={form.siteDescription}
                onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
                placeholder="A brief description of your website..."
                className={`w-full min-h-[100px] px-3 py-2 border rounded-lg ${
                  validationErrors.siteDescription ? "border-red-500" : ""
                }`}
                maxLength={160}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  {form.siteDescription.length}/160 characters • Shown in search results
                </p>
                {validationErrors.siteDescription && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.siteDescription}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Keywords</label>
              <Input
                value={form.keywords}
                onChange={(value) => setForm({ ...form, keywords: value })}
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated keywords for SEO
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Favicon URL</label>
                <div className={`${validationErrors.favicon ? "ring-2 ring-red-500 rounded-lg" : ""}`}>
                  <Input
                    value={form.favicon}
                    onChange={(value) => setForm({ ...form, favicon: value })}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
                {validationErrors.favicon ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.favicon}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    16x16 or 32x32 icon file
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Social Share Image (OG Image)</label>
                <div className={`${validationErrors.ogImage ? "ring-2 ring-red-500 rounded-lg" : ""}`}>
                  <Input
                    value={form.ogImage}
                    onChange={(value) => setForm({ ...form, ogImage: value })}
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
                {validationErrors.ogImage ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.ogImage}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    1200x630px recommended
                  </p>
                )}
              </div>
            </div>

            {form.ogImage && !validationErrors.ogImage && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Preview: Social Share</p>
                <div className="bg-white dark:bg-gray-800 border rounded-lg overflow-hidden max-w-md">
                  <img 
                    src={form.ogImage} 
                    alt="OG Preview" 
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/1200x630?text=Invalid+Image";
                    }}
                  />
                  <div className="p-3">
                    <p className="font-medium text-sm">{form.siteTitle || "Your Site Title"}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {form.siteDescription || "Your site description will appear here"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analytics */}
          <div className="border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart className="w-5 h-5" />
              <h2 className="text-xl font-bold">Analytics & Tracking</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
              <div className={`${validationErrors.googleAnalyticsId ? "ring-2 ring-red-500 rounded-lg" : ""}`}>
                <Input
                  value={form.googleAnalyticsId}
                  onChange={(value) => setForm({ ...form, googleAnalyticsId: value })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              {validationErrors.googleAnalyticsId ? (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.googleAnalyticsId}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Track website visitors and behavior
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
              <div className={`${validationErrors.facebookPixelId ? "ring-2 ring-red-500 rounded-lg" : ""}`}>
                <Input
                  value={form.facebookPixelId}
                  onChange={(value) => setForm({ ...form, facebookPixelId: value })}
                  placeholder="123456789012345"
                />
              </div>
              {validationErrors.facebookPixelId ? (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.facebookPixelId}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Track conversions and run Facebook ads
                </p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">📊 How to get your tracking IDs:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Google Analytics: Visit <a href="https://analytics.google.com" target="_blank" className="text-primary hover:underline">analytics.google.com</a> → Admin → Data Streams</li>
                <li>• Facebook Pixel: Visit <a href="https://business.facebook.com" target="_blank" className="text-primary hover:underline">business.facebook.com</a> → Events Manager</li>
              </ul>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="border rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Social Media Links</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Twitter/X Handle</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">twitter.com/</span>
                  <Input
                    value={form.twitterHandle}
                    onChange={(value) => setForm({ ...form, twitterHandle: value })}
                    placeholder="@yourhandle"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Facebook Page</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">facebook.com/</span>
                  <Input
                    value={form.facebookPage}
                    onChange={(value) => setForm({ ...form, facebookPage: value })}
                    placeholder="yourpage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn Page</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">linkedin.com/</span>
                  <Input
                    value={form.linkedinPage}
                    onChange={(value) => setForm({ ...form, linkedinPage: value })}
                    placeholder="company/yourpage"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Advanced Settings</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">robots.txt</label>
              <textarea
                value={form.robotsTxt}
                onChange={(e) => setForm({ ...form, robotsTxt: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 border rounded-lg font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Controls how search engines crawl your website
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Custom CSS</label>
              <textarea
                value={form.customCss}
                onChange={(e) => setForm({ ...form, customCss: e.target.value })}
                placeholder=".custom-class { color: red; }"
                className="w-full min-h-[150px] px-3 py-2 border rounded-lg font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add custom styles to your website
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Custom Head Code</label>
              <textarea
                value={form.customHeadCode}
                onChange={(e) => setForm({ ...form, customHeadCode: e.target.value })}
                placeholder="<script>console.log('Hello!');</script>"
                className="w-full min-h-[100px] px-3 py-2 border rounded-lg font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Injected into &lt;head&gt; tag (verification codes, custom scripts)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
}

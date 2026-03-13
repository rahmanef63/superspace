/**
 * Studio LLM Settings
 *
 * Configure the AI model used by Studio Builder to generate JSON layouts.
 * Supports Anthropic Claude and OpenAI models.
 * API keys are stored locally in browser storage (never sent to Convex).
 */
"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useLLMSettings } from "./useLLMSettings";

export function StudioLLMSettings() {
    const { settings, update } = useLLMSettings();
    const [showKey, setShowKey] = useState(false);

    return (
        <div className="p-4 space-y-5">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-primary" />
                <h3 className="text-sm font-semibold">AI Builder Configuration</h3>
            </div>
            <p className="text-xs text-muted-foreground">
                Configure the LLM used by Studio to generate JSON layouts directly on the canvas.
                Your API key is stored only in your browser — never uploaded.
            </p>

            {/* Enable / Disable */}
            <div className="flex items-center justify-between">
                <Label className="text-sm">Enable AI Builder</Label>
                <Switch
                    checked={settings.enabled}
                    onCheckedChange={(v) => update("enabled", v)}
                />
            </div>

            {settings.enabled && (
                <>
                    {/* Provider */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Provider</Label>
                        <Select value={settings.provider} onValueChange={(v) => update("provider", v as any)}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                                <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Model */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Model</Label>
                        <Select value={settings.model} onValueChange={(v) => update("model", v)}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {settings.provider === "anthropic" ? (
                                    <>
                                        <SelectItem value="claude-sonnet-4-6">Claude Sonnet 4.6 (Recommended)</SelectItem>
                                        <SelectItem value="claude-opus-4-6">Claude Opus 4.6</SelectItem>
                                        <SelectItem value="claude-haiku-4-5-20251001">Claude Haiku 4.5</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                                        <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
                                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* API Key */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">API Key</Label>
                        <div className="relative">
                            <Input
                                type={showKey ? "text" : "password"}
                                value={settings.apiKey}
                                onChange={(e) => update("apiKey", e.target.value)}
                                placeholder={settings.provider === "anthropic" ? "sk-ant-..." : "sk-..."}
                                className="h-8 text-xs pr-8 font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Stored in localStorage. Never leaves your browser.
                        </p>
                    </div>

                    {/* Max Tokens */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Max Tokens (response length)</Label>
                        <Input
                            type="number"
                            value={settings.maxTokens}
                            onChange={(e) => update("maxTokens", Number(e.target.value))}
                            min={256}
                            max={8192}
                            step={256}
                            className="h-8 text-xs"
                        />
                    </div>

                    {/* System prompt override */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">System Prompt Override (optional)</Label>
                        <textarea
                            value={settings.systemPromptOverride}
                            onChange={(e) => update("systemPromptOverride", e.target.value)}
                            placeholder="Leave empty to use the built-in Studio JSON schema prompt…"
                            rows={4}
                            className="w-full text-xs rounded-md border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => update("apiKey", "")}
                    >
                        Clear API Key
                    </Button>
                </>
            )}
        </div>
    );
}

# 📋 CMS Lite Enhancement Plan: Website Settings & Page Preview

## 🎯 Objectives

### Feature 1: Website Settings (Pengaturan Website)
Enable users to configure their website settings in user-friendly way:
- **Domain Settings** - Custom domain atau subdomain Superspace gratis
- **SEO Settings** - Site title, description, keywords, favicon, OG image
- **Analytics & Tracking** - Google Analytics, Facebook Pixel
- **Social Media Links** - Twitter, Facebook, LinkedIn profiles
- **Advanced Settings** - robots.txt, custom CSS, custom head code

### Feature 2: Page Preview
Enable real-time preview of pages before publishing using existing CMSPreview component:
- Preview pages in design mode (click to select elements)
- Preview pages in interactive mode (test functionality)
- Responsive preview (mobile/tablet/desktop)
- Preview unpublished changes
- Preview with live data

---

## 📅 Implementation Plan (4 Phases)

### PHASE 1: DNS Configuration Foundation (Days 1-2)

#### ✅ Checkpoint 1.1: Database Schema
**Task:** Create DNS settings schema in Convex
```
Files: convex/features/cms_lite/dns/api/schema.ts
```

**Expected Outcome:**
- ✅ Schema compiled without errors
- ✅ Table `cms_lite_dns_settings` appears in Convex dashboard
- ✅ Can manually insert test DNS record

**Validation:**
```bash
# Check Convex dashboard → Data → cms_lite_dns_settings
# Should show table structure with fields
```

---

#### ✅ Checkpoint 1.2: Backend API
**Task:** Create DNS CRUD operations
```
Files:
- convex/features/cms_lite/dns/api/queries.ts
- convex/features/cms_lite/dns/api/mutations.ts
```

**Expected Outcome:**
- ✅ `getDnsSettings(workspaceId)` returns DNS config
- ✅ `updateDnsSettings(...)` saves custom domain
- ✅ `verifyDomain(domain)` checks DNS records
- ✅ All mutations protected by `requireAdmin`

**Validation:**
```typescript
// Test in Convex dashboard Functions tab:
api.features.cms_lite.dns.api.queries.getDnsSettings({ workspaceId: "..." })
// Should return DNS settings or null
```

---

#### ✅ Checkpoint 1.3: Frontend UI
**Task:** Create DNS Manager component
```
Files: frontend/features/cms-lite/components/DnsManager.tsx
```

**Expected Outcome:**
- ✅ Form with inputs: Custom Domain, Nameservers, SSL Enable
- ✅ "Verify Domain" button works
- ✅ "Save Configuration" saves to Convex
- ✅ Shows verification status (pending/verified/failed)
- ✅ Copy-to-clipboard for DNS records

**Validation:**
```
1. Open /dashboard/cms-lite/dns
2. Enter custom domain: "example.com"
3. Click "Verify Domain" → Shows DNS records to add
4. Click "Save" → Data saved to Convex
5. Reload page → Configuration persists
```

---

#### ✅ Checkpoint 1.4: Integration Test
**Task:** Complete DNS workflow test

**Expected Outcome:**
- ✅ Add domain → Save → Verify → Update status
- ✅ No errors in browser console
- ✅ Data persists across page reloads
- ✅ Multiple workspaces have separate DNS configs

**Test Cases:**
```
1. ✅ Add domain for workspace A
2. ✅ Switch to workspace B
3. ✅ Add different domain for workspace B
4. ✅ Switch back to workspace A
5. ✅ Verify workspace A still has its domain
```

---

### PHASE 2: Page Preview Foundation (Days 3-4)

#### ✅ Checkpoint 2.1: Preview Metadata Schema
**Task:** Extend pages schema for preview tracking
```
Files: convex/features/cms_lite/pages/api/schema.ts
```

**Expected Outcome:**
- ✅ Added fields: `previewMode`, `lastPreviewedAt`, `previewToken`
- ✅ Existing pages not affected by schema change
- ✅ Can query pages with preview metadata

**Validation:**
```typescript
// Check existing pages still work:
api.features.cms_lite.pages.api.queries.listPages({})
// Should return pages without errors
```

---

#### ✅ Checkpoint 2.2: Preview Data Queries
**Task:** Create query to fetch complete page preview data
```
Files: convex/features/cms_lite/pages/api/queries.ts
```

**Expected Outcome:**
- ✅ `getPagePreviewData(pageId)` returns page + related data
- ✅ Includes: page config, quicklinks, products, posts, portfolio
- ✅ Works for both published and unpublished pages
- ✅ Fast query (< 500ms)

**Validation:**
```typescript
// Test in Convex dashboard:
api.features.cms_lite.pages.api.queries.getPagePreviewData({ 
  pageId: "..." 
})
// Should return:
// { page: {...}, quicklinks: [...], products: [...], ... }
```

---

#### ✅ Checkpoint 2.3: Preview Component Wrapper
**Task:** Create CMS Lite preview component
```
Files: frontend/features/cms-lite/components/CmsLitePreview.tsx
```

**Expected Outcome:**
- ✅ Wraps existing `CMSPreview` component
- ✅ Loads page data from Convex
- ✅ Renders appropriate page component based on `pageType`
- ✅ Design/Interactive toggle buttons visible
- ✅ Shows loading state while fetching data

**Validation:**
```
1. Component renders without crashing
2. Toggle buttons appear in top-right
3. Can switch between Design/Interactive modes
4. Shows "Loading..." when data is undefined
```

---

#### ✅ Checkpoint 2.4: Preview Route
**Task:** Create preview page route
```
Files: app/(cms)/preview/[pageId]/page.tsx
```

**Expected Outcome:**
- ✅ Route `/preview/[pageId]` works
- ✅ Fetches page data via useQuery
- ✅ Renders CmsLitePreview component
- ✅ Shows 404 if page not found
- ✅ URL shareable (can send to others)

**Validation:**
```
1. Navigate to /preview/[existing-page-id]
2. Page loads with preview UI
3. Navigate to /preview/invalid-id
4. Shows "Page not found" error
```

---

#### ✅ Checkpoint 2.5: PagesManager Integration
**Task:** Add preview button to pages table
```
Files: frontend/features/cms-lite/components/PagesManager.tsx
```

**Expected Outcome:**
- ✅ "Preview" button in actions column
- ✅ Opens preview in new tab
- ✅ Works for both published and draft pages
- ✅ Preview URL: `/preview/[pageId]`

**Validation:**
```
1. Open /dashboard/cms-lite/pages
2. See "Preview" button on each row
3. Click preview → Opens new tab
4. Preview page loads correctly
5. URL in address bar: /preview/[id]
```

---

#### ✅ Checkpoint 2.6: Mode Switching
**Task:** Implement design vs interactive modes
```
Files: frontend/features/cms-lite/components/CmsLitePreview.tsx
```

**Expected Outcome:**
- ✅ Design mode: Click elements to inspect (future: open editor)
- ✅ Interactive mode: Links/buttons work normally
- ✅ Mode state persists during session
- ✅ Visual indicator of current mode

**Validation:**
```
1. Open preview page
2. Default: Design mode active
3. Click link → Nothing happens (design mode)
4. Switch to Interactive mode
5. Click link → Navigates (interactive mode)
6. Switch back to Design → Links disabled again
```

---

### PHASE 3: Polish & Enhancement (Days 5-6)

#### ✅ Checkpoint 3.1: DNS Manager Polish
**Task:** Add advanced DNS features

**Expected Outcome:**
- ✅ Domain verification status badge (Pending/Verified/Failed)
- ✅ Copy DNS records button with success toast
- ✅ SSL certificate status indicator
- ✅ Instructions for common DNS providers (Cloudflare, Namecheap, GoDaddy)
- ✅ Automatic re-verification every 5 minutes

**Validation:**
```
1. Add domain
2. See step-by-step instructions
3. Click "Copy" on DNS record → Copied to clipboard
4. See SSL status: "Certificate pending"
5. After verification: SSL status: "Active"
```

---

#### ✅ Checkpoint 3.2: Responsive Preview
**Task:** Add device size switcher

**Expected Outcome:**
- ✅ Buttons: Mobile (375px), Tablet (768px), Desktop (1440px)
- ✅ Preview iframe/div resizes smoothly
- ✅ Can rotate device (portrait/landscape)
- ✅ Responsive issues clearly visible

**Validation:**
```
1. Open preview
2. Click "Mobile" → Preview shrinks to 375px
3. Click "Tablet" → Preview widens to 768px
4. Click "Desktop" → Full width
5. UI looks good at all sizes
```

---

#### ✅ Checkpoint 3.3: Dashboard Navigation
**Task:** Add new features to dashboard menu

**Expected Outcome:**
- ✅ "DNS Configuration" menu item in CMS Lite section
- ✅ "Page Preview" accessible via pages table
- ✅ Breadcrumbs show current location
- ✅ Active state on current page

**Validation:**
```
1. Open /dashboard/cms-lite
2. See "DNS Configuration" in sidebar
3. Click DNS Config → /dashboard/cms-lite/dns
4. See "Pages" in sidebar
5. Click page preview button → /preview/[id]
```

---

### PHASE 4: Testing & Documentation (Day 7)

#### ✅ Checkpoint 4.1: End-to-End Testing

**Test Scenario 1: DNS Configuration Flow**
```
1. ✅ User creates new workspace
2. ✅ Go to DNS Configuration
3. ✅ Enter custom domain: "mysite.com"
4. ✅ System shows DNS records to add
5. ✅ User adds records to DNS provider
6. ✅ Click "Verify Domain"
7. ✅ Status changes to "Verified"
8. ✅ Enable SSL
9. ✅ SSL certificate provisions
10. ✅ Site accessible at custom domain
```

**Test Scenario 2: Page Preview Flow**
```
1. ✅ User creates new page (unpublished)
2. ✅ Click "Preview" button
3. ✅ Preview opens in new tab
4. ✅ Page renders correctly
5. ✅ User edits page content
6. ✅ Refresh preview
7. ✅ Changes appear in preview
8. ✅ User publishes page
9. ✅ Preview still works
10. ✅ Public URL shows same content
```

**Expected Outcome:**
- ✅ Both flows work without errors
- ✅ Data persists correctly
- ✅ Preview matches published page
- ✅ Custom domain works after DNS propagation

---

#### ✅ Checkpoint 4.2: Documentation

**Create Documentation:**
```
1. docs/features/CMS_LITE_DNS_CONFIG.md
   - Setup guide
   - DNS provider instructions
   - SSL certificate setup
   - Troubleshooting
   - API reference

2. docs/features/CMS_LITE_PAGE_PREVIEW.md
   - How to use preview
   - Design vs Interactive modes
   - Responsive testing
   - Preview URL sharing
   - API reference
```

**Expected Outcome:**
- ✅ Complete documentation for both features
- ✅ Screenshots of UI
- ✅ Example configurations
- ✅ Common issues and solutions
- ✅ API endpoint reference

---

## 🎯 Success Criteria

### DNS Configuration
- [ ] User can add custom domain
- [ ] System generates correct DNS records
- [ ] Domain verification works
- [ ] SSL certificate provisions automatically
- [ ] Multiple domains per workspace
- [ ] Clear error messages for issues

### Page Preview
- [ ] Preview shows exact page rendering
- [ ] Design mode: Can inspect elements
- [ ] Interactive mode: All features work
- [ ] Responsive preview for mobile/tablet/desktop
- [ ] Preview works for unpublished pages
- [ ] Preview URL shareable with team

---

## 📊 Progress Tracking

### Phase Status
```
Phase 1: DNS Foundation       [ ] Not Started  [ ] In Progress  [ ] Complete
Phase 2: Preview Foundation   [ ] Not Started  [ ] In Progress  [ ] Complete
Phase 3: Polish & Enhancement [ ] Not Started  [ ] In Progress  [ ] Complete
Phase 4: Testing & Docs       [ ] Not Started  [ ] In Progress  [ ] Complete
```

### Current Status
- **Started:** Not yet
- **Blocked By:** None
- **Next Step:** Start Phase 1, Checkpoint 1.1 - Create DNS schema

---

## 🚨 Risk Mitigation

### Potential Issues & Solutions

**Issue 1: DNS propagation delays**
- Solution: Show clear message about 24-48h propagation time
- Implement automatic re-verification every 5 minutes
- Provide manual "Check Again" button

**Issue 2: SSL certificate provisioning failures**
- Solution: Partner with Let's Encrypt or Cloudflare
- Show clear error messages
- Provide manual certificate upload option

**Issue 3: Preview performance with large pages**
- Solution: Implement data pagination
- Lazy load images in preview
- Add loading indicators

**Issue 4: Preview state management complexity**
- Solution: Use React Context for preview state
- Keep preview isolated from main app state
- Clear documentation of state flow

---

## 📝 Notes

### DNS Configuration
- Use Convex for DNS settings storage (not external DNS API)
- Provide instructions for popular DNS providers
- Consider using Cloudflare API for automatic DNS updates (future)

### Page Preview
- Reuse existing `CMSPreview` component from `frontend/shared/ui`
- Keep preview lightweight - don't duplicate page components
- Preview should work offline for draft content

### Integration
- Both features accessible from `/dashboard/cms-lite`
- DNS config: `/dashboard/cms-lite/dns`
- Page preview: `/preview/[pageId]`
- Add to PagesManager table actions

---

## 🎉 Next Actions

1. **Review this plan** - Konfirmasi bahwa scope dan expectasi sudah sesuai
2. **Start Phase 1.1** - Create DNS settings schema
3. **Test checkpoint** - Verify schema in Convex dashboard
4. **Continue to 1.2** - Build DNS API endpoints

Ready to start? Let me know and I'll begin with Phase 1, Checkpoint 1.1! 🚀

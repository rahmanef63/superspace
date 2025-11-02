# 🧪 CMS Lite Website Settings - Test Cases

## Test Environment Setup

**Prerequisites:**
- ✅ Convex backend running (`npx convex dev`)
- ✅ Next.js dev server running (`npm run dev`)
- ✅ User logged in with workspace
- ✅ Navigate to: `/dashboard/cms-lite` → "Website Settings"

---

## 📋 Test Suite 1: Subdomain Validation

### Test 1.1: Valid Subdomain Format ✅
**Steps:**
1. Enter subdomain: `my-awesome-site`
2. Wait 500ms for validation

**Expected:**
- ✅ Green checkmark appears
- ✅ Message: "Available: my-awesome-site.superspace.app"
- ✅ No error message
- ✅ Save button is enabled

**Status:** [✅] Pass [ ] Fail

---

### Test 1.2: Invalid Subdomain - Too Short ❌
**Steps:**
1. Enter subdomain: `ab`
2. Wait 500ms

**Expected:**
- ❌ Red X appears
- ❌ Error: "Subdomain must be at least 3 characters"
- ❌ Save button is disabled

**Status:** [✅] Pass [ ] Fail

---

### Test 1.3: Invalid Subdomain - Special Characters ❌
**Steps:**
1. Enter subdomain: `my_site@123`
2. Auto-cleaned to: `mysite123`

**Expected:**
- ✅ Input automatically strips invalid characters
- ✅ Only lowercase letters, numbers, hyphens allowed
- ✅ Green checkmark after cleanup

**Status:** [✅] Pass [ ] Fail

---

### Test 1.4: Invalid Subdomain - Starts with Hyphen ❌
**Steps:**
1. Enter subdomain: `-mysite`

**Expected:**
- ❌ Error: "Subdomain can only contain lowercase letters, numbers, and hyphens (cannot start/end with hyphen)"
- ❌ Save button is disabled

**Status:** [✅] Pass [ ] Fail

---

### Test 1.5: Subdomain Already Taken ❌
**Steps:**
1. Create a website with subdomain: `test123`
2. In another workspace, try to use: `test123`

**Expected:**
- ❌ Error: "This subdomain is already taken. Please choose another."
- ❌ Save button is disabled

**Status:** [ ] Pass [ ] Fail

**Known Issue (FIXED):** 
- ✅ Error now clears when subdomain is changed
- ✅ Save button enables after valid subdomain entered

---

## 📋 Test Suite 2: Custom Domain

### Test 2.1: Valid Custom Domain ✅
**Steps:**
1. Check "Use Custom Domain"
2. Enter: `www.mysite.com`
3. Click "Verify Domain"

**Expected:**
- ✅ Domain input accepts value
- ✅ Verification starts (button shows "Verifying...")
- ✅ Mock verification succeeds
- ✅ Toast: "✅ Domain verified successfully! www.mysite.com is now active"
- ✅ Save button enabled after verification

**Status:** [ ] Pass [ ] Fail

**Known Issue (FIXED):**
- ✅ Now creates settings before verifying (no more "Website settings not found" error)
- ✅ Success toast now appears

---

### Test 2.2: Invalid Custom Domain - No Protocol ❌
**Steps:**
1. Enter: `mysite`
2. Try to save

**Expected:**
- ❌ Validation error shown in error summary box
- ❌ Save button disabled

**Status:** [ ] Pass [ ] Fail

---

### Test 2.3: Custom Domain Not Verified ❌
**Steps:**
1. Enter valid domain: `www.mysite.com`
2. Don't click "Verify Domain"
3. Try to save

**Expected:**
- ❌ Error: "Custom domain must be verified before use"
- ❌ Save button disabled
- ⚠️ DNS instructions visible

**Status:** [✅] Pass [ ] Fail

---

### Test 2.4: DNS Instructions Copy ✅
**Steps:**
1. Enter custom domain (unverified)
2. Click copy button on A Record
3. Click copy button on CNAME Record

**Expected:**
- ✅ Toast: "✅ Copied! IP Address copied to clipboard"
- ✅ Toast: "✅ Copied! CNAME copied to clipboard"
- ✅ Values: `76.76.21.21` and `cname.superspace.app`

**Status:** [ ] Pass [ ] Fail

**Known Issue (FIXED):**
- ✅ Copy toasts now appear correctly

---

## 📋 Test Suite 3: SEO Settings

### Test 3.1: Valid SEO Fields ✅
**Steps:**
1. Site Title: `My Awesome Website`
2. Description: `A great website for everyone` (< 160 chars)
3. Keywords: `web, design, development`
4. Favicon: `https://example.com/favicon.ico`
5. OG Image: `https://example.com/og.jpg`
6. Click Save

**Expected:**
- ✅ All fields accept values
- ✅ Character counter shows: `29/160 characters`
- ✅ Toast: "✅ Settings saved! Your website settings have been updated successfully"

**Status:** [ ] Pass [ ] Fail

**Known Issue (FIXED):**
- ✅ Save toast now appears correctly

---

### Test 3.2: Description Too Long ❌
**Steps:**
1. Enter description with 161+ characters
2. Try to save

**Expected:**
- ❌ Error summary shows: "Description must be 160 characters or less"
- ❌ Character counter shows over limit
- ❌ Save button disabled

**Status:** [✅] Pass [ ] Fail

---

### Test 3.3: Invalid Favicon URL ❌
**Steps:**
1. Enter favicon: `not-a-url`
2. Try to save

**Expected:**
- ❌ Error: "Favicon URL must be a valid URL"
- ❌ Red ring around input field
- ❌ Save button disabled

**Status:** [ ] Pass [ ] Fail

---

### Test 3.4: OG Image Preview ✅
**Steps:**
1. Enter valid OG image URL: `https://picsum.photos/1200/630`
2. Enter site title and description
3. Scroll to preview section

**Expected:**
- ✅ Social media card preview renders
- ✅ Shows image, title, description
- ✅ Handles image load errors gracefully

**Status:** [ ] Pass [ ] Fail

---

## 📋 Test Suite 4: Analytics Validation

### Test 4.1: Valid Google Analytics ID ✅
**Steps:**
1. Enter: `G-ABC123XYZ`
2. Click Save

**Expected:**
- ✅ Accepts format `G-XXXXXXXXXX`
- ✅ Also accepts `UA-XXXXXXXX`
- ✅ Also accepts `GT-XXXXXXXX`
- ✅ Saves successfully

**Status:** [ ] Pass [ ] Fail

---

### Test 4.2: Invalid Google Analytics ID ❌
**Steps:**
1. Enter: `INVALID-123`
2. Try to save

**Expected:**
- ❌ Error: "Google Analytics ID format: G-XXXXXXXXXX or UA-XXXXXXXXX"
- ❌ Red ring around input
- ❌ Save button disabled

**Status:** [ ] Pass [ ] Fail

---

### Test 4.3: Valid Facebook Pixel ID ✅
**Steps:**
1. Enter: `123456789012345` (15 digits)
2. Click Save

**Expected:**
- ✅ Accepts 15-16 digit number
- ✅ Saves successfully

**Status:** [ ] Pass [ ] Fail

---

### Test 4.4: Invalid Facebook Pixel ID ❌
**Steps:**
1. Enter: `12345` (too short)
2. Try to save

**Expected:**
- ❌ Error: "Facebook Pixel ID must be 15-16 digits"
- ❌ Save button disabled

**Status:** [ ] Pass [ ] Fail

---

## 📋 Test Suite 5: Form Persistence

### Test 5.1: Create New Settings ✅
**Steps:**
1. First time user, no settings exist
2. Fill out all fields:
   - Subdomain: `mysite`
   - Site Title: `My Site`
   - Description: `Test site`
3. Click Save
4. Refresh page

**Expected:**
- ✅ Settings save to Convex
- ✅ After refresh, all fields populated
- ✅ No data loss

**Status:** [ ] Pass [ ] Fail

---

### Test 5.2: Update Existing Settings ✅
**Steps:**
1. Load page with existing settings
2. Change subdomain from `oldname` to `newname`
3. Click Save
4. Refresh page

**Expected:**
- ✅ New subdomain shows: `newname`
- ✅ Other fields unchanged
- ✅ Updated in database

**Status:** [ ] Pass [ ] Fail

---

### Test 5.3: Switch Between Subdomain and Custom Domain ✅
**Steps:**
1. Start with subdomain: `mysite.superspace.app`
2. Save
3. Check "Use Custom Domain"
4. Enter and verify: `www.mysite.com`
5. Save
6. Refresh
7. Uncheck "Use Custom Domain"
8. Save

**Expected:**
- ✅ URL preview updates: subdomain → custom → subdomain
- ✅ Both configurations persist
- ✅ Can switch back and forth

**Status:** [ ] Pass [ ] Fail

---

## 📋 Test Suite 6: Validation Error Summary

### Test 6.1: Multiple Validation Errors ❌
**Steps:**
1. Enter subdomain: `ab` (too short)
2. Enter GA ID: `invalid`
3. Enter FB Pixel: `123` (too short)
4. Try to save

**Expected:**
- ❌ Red error box at top shows all 3 errors
- ❌ Save button disabled
- ❌ Inline errors on each field

**Status:** [ ] Pass [ ] Fail

---

### Test 6.2: Fix Errors One by One ✅
**Steps:**
1. Start with 3 validation errors (from 6.1)
2. Fix subdomain → 2 errors remain
3. Fix GA ID → 1 error remains
4. Fix FB Pixel → 0 errors

**Expected:**
- ✅ Error count decreases: 3 → 2 → 1 → 0
- ✅ Red box disappears when all fixed
- ✅ Save button enables when all fixed

**Status:** [ ] Pass [ ] Fail

---

## 📋 Test Suite 7: Loading States

### Test 7.1: Initial Page Load ✅
**Steps:**
1. Navigate to Website Settings
2. Observe loading sequence

**Expected:**
- ✅ Shows: "Loading workspace..."
- ✅ Then: "Loading website settings..."
- ✅ Then: Form with data or empty form
- ✅ No flash of empty state

**Status:** [ ] Pass [ ] Fail

---

### Test 7.2: Save Loading State ✅
**Steps:**
1. Fill out form
2. Click Save
3. Observe button

**Expected:**
- ✅ Button shows: "Saving..."
- ✅ Button is disabled during save
- ✅ After save: "Save Changes"
- ✅ Toast appears: "Website settings saved successfully"

**Status:** [ ] Pass [ ] Fail

---

### Test 7.3: Domain Verification Loading ✅
**Steps:**
1. Enter custom domain
2. Click "Verify Domain"
3. Observe button

**Expected:**
- ✅ Button shows: "Verifying..."
- ✅ Button is disabled during verification
- ✅ After verify: "Verify Domain"
- ✅ Toast appears with result

**Status:** [ ] Pass [ ] Fail

---

### Test 7.4: Subdomain Availability Check Loading ✅
**Steps:**
1. Start typing subdomain: `my`
2. Continue typing: `mysite`
3. Observe spinner

**Expected:**
- ✅ Spinner appears after 500ms delay
- ✅ Query runs in background
- ✅ Checkmark or error appears
- ✅ No UI freeze

**Status:** [ ] Pass [ ] Fail

---

## 📋 Test Suite 8: UI/UX

### Test 8.1: Current Website URL Display ✅
**Steps:**
1. Set subdomain: `mysite`
2. Observe URL bar at top

**Expected:**
- ✅ Shows: `https://mysite.superspace.app`
- ✅ URL is clickable link
- ✅ Opens in new tab
- ✅ Copy button works

**Status:** [ ] Pass [ ] Fail

---

### Test 8.2: URL Updates on Domain Change ✅
**Steps:**
1. Start with subdomain: `mysite`
2. Change to: `newsite`
3. Observe URL bar
4. Check "Use Custom Domain"
5. Enter: `www.mysite.com`

**Expected:**
- ✅ URL updates: `https://newsite.superspace.app`
- ✅ Then updates: `https://www.mysite.com`

**Status:** [ ] Pass [ ] Fail

---

### Test 8.3: Responsive Design 📱
**Steps:**
1. Resize browser to mobile (375px)
2. Test tablet (768px)
3. Test desktop (1920px)

**Expected:**
- ✅ Mobile: Single column layout
- ✅ Tablet: 2-column grid for some sections
- ✅ Desktop: Full width, all elements visible
- ✅ No horizontal scroll

**Status:** [ ] Pass [ ] Fail

---

### Test 8.4: Dark Mode 🌙
**Steps:**
1. Toggle system to dark mode
2. Check all form elements

**Expected:**
- ✅ Background colors adapt
- ✅ Text readable in dark mode
- ✅ Borders visible
- ✅ Error messages readable

**Status:** [ ] Pass [ ] Fail

---

## 📊 Test Results Summary

| Test Suite | Total Tests | Passed | Failed | Skipped |
|-----------|-------------|--------|--------|---------|
| Subdomain Validation | 5 | [ ] | [ ] | [ ] |
| Custom Domain | 4 | [ ] | [ ] | [ ] |
| SEO Settings | 4 | [ ] | [ ] | [ ] |
| Analytics Validation | 4 | [ ] | [ ] | [ ] |
| Form Persistence | 3 | [ ] | [ ] | [ ] |
| Validation Error Summary | 2 | [ ] | [ ] | [ ] |
| Loading States | 4 | [ ] | [ ] | [ ] |
| UI/UX | 4 | [ ] | [ ] | [ ] |
| **TOTAL** | **30** | **[ ]** | **[ ]** | **[ ]** |

---

## 🐛 Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| DNS verification is mocked | Low | ⏳ Pending | Will implement real DNS lookup in production |
| Subdomain availability check has 500ms delay | Info | ✅ By Design | Prevents API spam |

## 🔧 Fixed Issues

| Issue | Status | Fix Description |
|-------|--------|----------------|
| Save button stuck disabled after subdomain change | ✅ FIXED | Added validation error clearing on subdomain change |
| "Website settings not found" error on verify domain | ✅ FIXED | Now creates settings before verification |
| Missing toast notifications | ✅ FIXED | Added descriptive toasts to all actions |
| Validation state persists after field changes | ✅ FIXED | Clear errors when relevant fields change |

---

## ✅ Pre-Production Checklist

Before moving to production:

- [ ] All 30 test cases pass
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile devices
- [ ] Dark mode fully tested
- [ ] Error scenarios handled
- [ ] Loading states smooth
- [ ] Form validation complete
- [ ] Data persistence verified
- [ ] No console errors
- [ ] Accessibility tested (keyboard navigation, screen readers)

---

## 📝 Test Execution Instructions

1. **Start Convex Dev Server:**
   ```bash
   npx convex dev
   ```

2. **Start Next.js:**
   ```bash
   npm run dev
   ```

3. **Login as Admin**

4. **Navigate to:**
   ```
   http://localhost:3000/dashboard/cms-lite
   ```

5. **Click:** "Website Settings" in Configuration section

6. **Execute tests** in order (1.1 → 8.4)

7. **Mark results** in checkboxes

8. **Report issues** with:
   - Test number (e.g., "Test 3.2 Failed")
   - Expected vs Actual behavior
   - Screenshots if UI issue
   - Browser and OS

---

**Happy Testing! 🧪**

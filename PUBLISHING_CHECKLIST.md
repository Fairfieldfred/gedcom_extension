# Chrome Web Store Publishing Checklist

## Pre-Publication Checklist ✅

### Testing & Quality Assurance
- [ ] Extension works with small GEDCOM files (< 100 individuals)
- [ ] Extension works with large GEDCOM files (1000+ individuals)
- [ ] All features functional (upload, visualization, search, export)
- [ ] Responsive design works on different screen sizes
- [ ] No JavaScript errors in console
- [ ] Performance is acceptable with large files
- [ ] All UI elements display correctly

### Required Files & Assets
- [x] **manifest.json** - Updated with correct version
- [x] **LICENSE** - MIT License included
- [x] **Privacy Policy** - Template created in store-assets/
- [ ] **Screenshots** - 5 high-quality screenshots (1280x800px)
- [ ] **Store Description** - Complete listing description
- [ ] **Promotional Images** - Optional but recommended

### Package Creation
- [x] **Clean Package Directory** - Created at `/Users/fred/Development/gedcom_extension_package/`
- [x] **ZIP Package** - `gedcom-family-tree-viewer.zip` ready for upload
- [x] **File Size Check** - Package under 128MB limit
- [ ] **Final Package Test** - Load ZIP package as unpacked extension

## Chrome Web Store Account Setup ⚙️

- [ ] **Developer Account** - Register at chrome.google.com/webstore/devconsole/
- [ ] **Registration Fee** - Pay $5 one-time fee
- [ ] **Identity Verification** - Complete verification process
- [ ] **Developer Console Access** - Confirm dashboard access

## Store Listing Creation 📝

### Basic Information
- [ ] **Extension Name**: "GEDCOM Family Tree Viewer"
- [ ] **Category**: Productivity
- [ ] **Language**: English
- [ ] **Summary**: Short description (132 characters max)
- [ ] **Detailed Description**: Full feature description

### Visual Assets
- [ ] **Icon**: Use assets/icons/icon128.png (128x128px)
- [ ] **Screenshots**: 5 screenshots showing key features
- [ ] **Promotional Tile (Small)**: 440x280px (optional)
- [ ] **Promotional Tile (Large)**: 920x680px (optional)
- [ ] **Marquee**: 1400x560px (optional)

### Legal & Privacy
- [ ] **Privacy Policy**: Link to hosted privacy policy
- [ ] **Permissions Justification**: Explain why each permission is needed
- [ ] **Website**: Link to GitHub repository or project website

## Submission Process 🚀

- [ ] **Upload Package**: Upload gedcom-family-tree-viewer.zip
- [ ] **Complete Listing**: Fill all required fields
- [ ] **Set Visibility**: Choose public/unlisted/private
- [ ] **Select Regions**: Choose target countries
- [ ] **Submit for Review**: Click submit button
- [ ] **Monitor Status**: Check developer dashboard for updates

## Post-Publication 📊

- [ ] **Extension Live**: Confirm extension appears in Chrome Web Store
- [ ] **Test Installation**: Install from store and test functionality
- [ ] **Monitor Reviews**: Check for user feedback and ratings
- [ ] **Update Documentation**: Update README with Chrome Web Store link
- [ ] **Marketing**: Share in genealogy communities and forums

## Screenshots to Create 📸

1. **Main Interface**: Upload screen with sample GEDCOM file
2. **Tree Visualization**: Large family tree with zoom/pan in action
3. **Search Feature**: Person search with results dropdown
4. **Customization**: Settings panel showing options
5. **Export Feature**: Tree being exported or print preview

## Store Description Template 📋

**Short Description (132 chars):**
"Transform GEDCOM genealogy files into beautiful, interactive family tree visualizations with zoom, search, and export features."

**Key Features to Highlight:**
- GEDCOM 5.5.1 support
- Interactive D3.js visualizations
- Multiple tree types (ancestor/descendant/combined)
- Advanced search and navigation
- Export as PNG images
- Responsive design
- Local processing (privacy-focused)

## Common Review Issues to Avoid ⚠️

- [ ] **Missing Privacy Policy**: Must have privacy policy for extensions handling user data
- [ ] **Poor Screenshots**: Use high-quality, representative screenshots
- [ ] **Incomplete Description**: Provide detailed feature descriptions
- [ ] **Excessive Permissions**: Only request permissions actually used
- [ ] **Functionality Issues**: Ensure extension works perfectly before submission

## Timeline Expectations ⏰

- **Preparation**: 1-2 days (screenshots, testing, descriptions)
- **Submission**: 30 minutes
- **Review**: 1-7 days (longer for first-time developers)
- **Total**: 3-10 days from start to published

---

## Next Steps 🎯

1. Create the 5 required screenshots
2. Set up Chrome Web Store developer account ($5 fee)
3. Complete store listing with descriptions and images
4. Submit for review
5. Monitor for approval and user feedback

## Quick Links 🔗

- [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole/)
- [Chrome Web Store Developer Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Chrome Extension Manifest Documentation](https://developer.chrome.com/docs/extensions/mv3/manifest/)
- [Package Location]: `/Users/fred/Development/gedcom_extension_package/gedcom-family-tree-viewer.zip`
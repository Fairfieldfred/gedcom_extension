# GEDCOM Family Tree Viewer Chrome Extension

<div align="center">

![Extension Icon](assets/icons/icon128.png)

**Interactive family tree visualization from GEDCOM genealogy files**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-blue)](chrome://extensions/)
[![Version](https://img.shields.io/badge/version-1.0.3-green)](manifest.json)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

</div>

## 🌳 Overview

The GEDCOM Family Tree Viewer is a powerful Chrome extension that transforms your genealogy files into beautiful, interactive family tree visualizations. Upload your GEDCOM (.ged) files and explore your family history through an intuitive, zoomable tree interface.

## ✨ Features

### 📁 **File Processing**

- **GEDCOM 5.5.1 Support**: Full compatibility with standard GEDCOM format
- **UTF-8 & ANSEL Encoding**: Handles multiple character encodings
- **Large File Support**: Efficient processing of extensive family trees
- **Data Validation**: Comprehensive parsing with error handling

### 🌲 **Tree Visualization**

- **Interactive D3.js Trees**: Smooth, responsive family tree rendering
- **Multiple Orientations**: Vertical and horizontal tree layouts
- **Zoom & Pan**: Navigate large family trees with ease
- **Responsive Design**: Adapts to different screen sizes

### 👥 **Family Relationships**

- **Multiple Tree Types**:
  - Descendant trees (children, grandchildren, etc.)
  - Ancestor trees (parents, grandparents, etc.)
  - Combined trees (both ancestors and descendants)
- **Configurable Generations**: Choose 1-10 generations to display
- **Relationship Links**: Visual connections between family members

### 🎨 **Customization**

- **Color Schemes**: Multiple visual themes
- **Gender Indicators**: Color-coded by gender (Male/Female/Unknown)
- **Date Display**: Toggle birth/death dates and places
- **Node Information**: Rich tooltips with biographical details

### 🔍 **Navigation & Search**

- **Person Search**: Find individuals by name
- **Tree Centering**: Auto-center and zoom controls
- **Export Functionality**: Save trees as images
- **Fullscreen Mode**: Immersive viewing experience

## 🚀 Installation

### From Source

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/gedcom-family-tree-extension.git
   cd gedcom-family-tree-extension
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the extension directory

5. The GEDCOM Family Tree Viewer icon will appear in your extensions toolbar

## 📖 Usage

### Basic Workflow

1. **Upload GEDCOM File**

   - Click the extension icon in Chrome toolbar
   - Click "Choose GEDCOM File" button
   - Select your .ged file from your computer

2. **Configure Tree Settings**

   - Choose number of generations (1-10)
   - Select tree orientation (vertical/horizontal)
   - Pick your preferred layout type

3. **Generate & View Tree**
   - Click "Generate Family Tree"
   - Your tree will open in a new tab
   - Use mouse to pan and zoom
   - Hover over nodes for detailed information

### Advanced Features

#### Tree Customization

- **Sidebar Controls**: Adjust tree type, generations, and visual settings
- **Color Schemes**: Choose from multiple color themes
- **Information Display**: Toggle dates, places, and other details

#### Navigation

- **Search**: Use the search box to find specific individuals
- **Zoom Controls**: Built-in zoom in/out/reset buttons
- **Keyboard Shortcuts**:
  - `Ctrl+F` / `Cmd+F`: Focus search box
  - `Ctrl+0` / `Cmd+0`: Center tree
  - `Ctrl+S` / `Cmd+S`: Export tree as PNG
  - `F11`: Toggle fullscreen
  - `Esc`: Close search results

#### Export Options

- **PNG Export**: Save tree visualizations as high-quality images
- **SVG Support**: Vector graphics for scalable output

## 🏗️ Architecture

### Core Components

```
gedcom-family-tree-extension/
├── manifest.json              # Extension configuration
├── popup/                     # Extension popup interface
│   ├── popup.html            # File upload UI
│   ├── popup.js              # Upload logic & parsing
│   └── popup.css             # Popup styling
├── viewer/                    # Tree visualization interface
│   ├── viewer.html           # Main viewer UI
│   ├── viewer.js             # Viewer application logic
│   └── viewer.css            # Tree styling
├── lib/                      # Core libraries
│   ├── gedcom-parser.js      # GEDCOM file parsing
│   ├── tree-builder.js       # Family tree data structures
│   ├── tree-renderer.js      # D3.js visualization
│   └── d3.v7.min.js          # D3.js library
├── background/               # Extension background service
│   └── background.js         # Service worker & data management
└── assets/                   # Static resources
    └── icons/                # Extension icons
```

### Key Technologies

- **JavaScript ES6+**: Modern JavaScript with classes and async/await
- **D3.js v7**: Advanced data visualization and SVG manipulation
- **Chrome Extension API**: Manifest V3 with service workers
- **HTML5 & CSS3**: Modern web standards with responsive design

### Data Processing Pipeline

1. **GEDCOM Parsing** (`GedcomParser`):

   - Parses GEDCOM 5.5.1 format files
   - Extracts individuals (INDI) and families (FAM)
   - Handles names, dates, places, and relationships
   - Validates data integrity and resolves references

2. **Tree Building** (`TreeBuilder`):

   - Processes parsed data into hierarchical structures
   - Builds ancestor/descendant/combined trees
   - Calculates generational relationships
   - Optimizes data for visualization

3. **Tree Rendering** (`TreeRenderer`):
   - Creates interactive D3.js visualizations
   - Handles zoom, pan, and responsive layouts
   - Manages node positioning and link drawing
   - Provides tooltips and user interactions

## 🔧 Development

### Prerequisites

- Node.js (for development tools)
- Chrome browser for testing
- Basic knowledge of JavaScript and Chrome Extensions

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-username/gedcom-family-tree-extension.git
cd gedcom-family-tree-extension

# Install development dependencies (if any)
npm install

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the extension directory
```

### File Structure Explanation

#### Popup Interface (`popup/`)

- Handles GEDCOM file uploads
- Parses files using `GedcomParser`
- Stores processed data in Chrome storage
- Provides basic configuration options

#### Viewer Interface (`viewer/`)

- Main tree visualization application
- Loads processed data from storage
- Implements interactive family tree display
- Handles user interactions and exports

#### Core Libraries (`lib/`)

- **`gedcom-parser.js`**: Comprehensive GEDCOM 5.5.1 parser
- **`tree-builder.js`**: Family relationship processor
- **`tree-renderer.js`**: D3.js-based tree visualization
- **`d3.v7.min.js`**: Data visualization library

### Testing

Test the extension with various GEDCOM files to ensure compatibility:

- Small family trees (< 100 individuals)
- Large genealogy databases (1000+ individuals)
- Files with complex relationships and multiple marriages
- Different character encodings and date formats

## � Publishing to Chrome Web Store

Ready to publish your extension? Here's the complete step-by-step process:

### Step 1: Prepare for Publication

1. **Final Testing Checklist**
   ```bash
   # Load as unpacked extension in chrome://extensions/
   # Test with multiple GEDCOM files
   # Verify all features work correctly
   # Check responsive design on different screen sizes
   # Test performance with large files
   ```

2. **Required Documents**
   - Privacy Policy (required for all extensions)
   - Store listing description and screenshots
   - High-quality promotional images

### Step 2: Create Chrome Web Store Developer Account

1. **Register as Developer**
   - Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Sign in with your Google account
   - Pay the **$5 one-time registration fee**
   - Complete identity verification process

### Step 3: Package Your Extension

1. **Create Clean Package**
   ```bash
   # Create package directory
   mkdir gedcom_extension_package
   
   # Copy only necessary files
   cp manifest.json gedcom_extension_package/
   cp -r assets background lib popup viewer gedcom_extension_package/
   
   # Remove development/test files
   rm gedcom_extension_package/lib/test-data.js
   
   # Create ZIP package
   cd gedcom_extension_package
   zip -r gedcom-family-tree-viewer.zip . -x "*.DS_Store"
   ```

2. **Package Requirements**
   - Maximum size: 128 MB (your extension should be much smaller)
   - Must contain `manifest.json` in root directory
   - All files must be web-safe (no executable files)

### Step 4: Create Store Listing

1. **Required Information**
   - **Extension Name**: "GEDCOM Family Tree Viewer"
   - **Description**: Detailed description (see `store-assets/STORE_LISTING.md`)
   - **Category**: Productivity
   - **Language**: English (and any others you support)

2. **Required Images** (create these in high quality)
   - **Screenshots** (1280x800px): 
     - Main tree visualization
     - File upload interface
     - Search and navigation features
     - Customization options
     - Large family tree example
   
   - **Store Icon** (128x128px): Use your `assets/icons/icon128.png`
   
   - **Promotional Images** (optional but recommended):
     - Small tile: 440x280px
     - Large tile: 920x680px
     - Marquee: 1400x560px

3. **Privacy Policy** (required)
   ```
   This extension processes GEDCOM files locally in your browser.
   
   Data Collection: We do not collect any personal information.
   Data Usage: GEDCOM files are processed solely for visualization.
   Data Storage: Files are stored locally using Chrome's storage API.
   Data Sharing: No data is transmitted to external servers.
   
   Contact: your-email@domain.com
   ```

### Step 5: Submit for Review

1. **Upload Package**
   - Upload your `gedcom-family-tree-viewer.zip` file
   - Chrome Web Store will automatically validate the package

2. **Complete Store Listing**
   - Add all required information and images
   - Set pricing (free)
   - Select target countries/regions
   - Choose visibility (public/unlisted/private)

3. **Review Process**
   - **Initial Review**: Usually takes 1-3 days
   - **Extended Review**: May take up to 7 days for new developers
   - **Common Rejection Reasons**:
     - Missing privacy policy
     - Low-quality screenshots
     - Incomplete store listing
     - Code that violates Chrome Web Store policies

### Step 6: Post-Publication

1. **Monitor Reviews**
   - Respond to user feedback
   - Address reported bugs quickly
   - Update store listing based on user feedback

2. **Publishing Updates**
   ```bash
   # Increment version in manifest.json
   "version": "1.0.4"
   
   # Create new package
   zip -r gedcom-family-tree-viewer-v1.0.4.zip .
   
   # Upload to Chrome Web Store Developer Console
   ```

3. **Marketing Your Extension**
   - Share on genealogy forums and communities
   - Create documentation and tutorials
   - Gather user testimonials
   - Consider creating demo videos

### Chrome Web Store Policies to Remember

- **User Data**: Extensions must have a clear, legitimate purpose
- **Permissions**: Only request permissions your extension actually uses
- **Privacy**: Must have a privacy policy if you handle user data
- **Quality**: Must provide a high-quality user experience
- **Spam**: Don't create multiple similar extensions

### Estimated Timeline

- **Preparation**: 1-2 days (screenshots, descriptions, testing)
- **Submission**: 30 minutes
- **Review**: 1-7 days
- **Total**: 3-10 days from start to published

### Costs

- **Developer Registration**: $5 (one-time)
- **Publishing**: Free
- **Maintenance**: Time for updates and support

## �📝 GEDCOM File Support

### Supported GEDCOM Tags

- **Individuals (INDI)**:

  - `NAME`: Full names with given/surname parsing
  - `SEX`: Gender identification
  - `BIRT`: Birth dates and places
  - `DEAT`: Death dates and places
  - `FAMC`: Family child relationships
  - `FAMS`: Family spouse relationships

- **Families (FAM)**:
  - `HUSB`: Husband reference
  - `WIFE`: Wife reference
  - `CHIL`: Children references
  - `MARR`: Marriage dates and places

### File Requirements

- GEDCOM version 5.5.1 or compatible
- UTF-8 or ANSEL character encoding
- Valid GEDCOM structure with proper level numbering
- Individual and family records with unique identifiers

## 🤝 Contributing

We welcome contributions to improve the GEDCOM Family Tree Viewer! Here's how you can help:

### Ways to Contribute

- 🐛 **Bug Reports**: Submit issues with detailed descriptions
- 💡 **Feature Requests**: Suggest new functionality
- 🔧 **Code Contributions**: Submit pull requests with improvements
- 📖 **Documentation**: Help improve documentation and examples
- 🧪 **Testing**: Test with different GEDCOM files and report results

### Development Guidelines

1. Follow existing code style and structure
2. Add comments for complex logic
3. Test changes with multiple GEDCOM files
4. Update documentation as needed

### Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues & Troubleshooting

### Common Issues

- **Large File Performance**: Very large GEDCOM files (>10MB) may take time to process
- **Complex Relationships**: Some non-standard family structures may not display optimally
- **Browser Memory**: Extremely large trees may require increased browser memory

### Troubleshooting

1. **Tree Not Displaying**: Check browser console for JavaScript errors
2. **File Upload Fails**: Ensure GEDCOM file is valid and properly formatted
3. **Performance Issues**: Try reducing the number of generations displayed
4. **Extension Not Loading**: Reload extension in `chrome://extensions/`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D3.js Community**: For the powerful visualization library
- **GEDCOM Standard**: For the genealogy data format specification
- **Genealogy Community**: For testing and feedback
- **Chrome Extension Documentation**: For development guidance

## 📞 Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/your-username/gedcom-family-tree-extension/issues)
- **Documentation**: Check this README and inline code comments
- **GEDCOM Specification**: [Official GEDCOM 5.5.1 Standard](https://www.gedcom.org/gedcom.html)

---

<div align="center">

**Made with ❤️ for the genealogy community**

[⭐ Star this repository](https://github.com/your-username/gedcom-family-tree-extension) | [🐛 Report an issue](https://github.com/your-username/gedcom-family-tree-extension/issues) | [🚀 Request a feature](https://github.com/your-username/gedcom-family-tree-extension/issues/new)

</div>

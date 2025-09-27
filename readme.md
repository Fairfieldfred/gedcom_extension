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

## 📝 GEDCOM File Support

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

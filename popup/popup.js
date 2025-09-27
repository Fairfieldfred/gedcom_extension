document.addEventListener('DOMContentLoaded', function() {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('gedcomFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const clearFile = document.getElementById('clearFile');
    const controls = document.getElementById('controls');
    const generationsSlider = document.getElementById('generations');
    const generationsValue = document.getElementById('generationsValue');
    const generateBtn = document.getElementById('generateTree');
    const status = document.getElementById('status');

    let selectedFile = null;
    let parser = null;
    let treeBuilder = null;
    let parsedData = null;

    // Initialize GEDCOM parser
    try {
        parser = new GedcomParser();
        treeBuilder = new TreeBuilder();
        console.log('GEDCOM parser initialized successfully');
    } catch (error) {
        console.error('Failed to initialize GEDCOM parser:', error);
        showStatus('Error initializing parser. Please reload the extension.', 'error');
    }

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileSelect);
    clearFile.addEventListener('click', clearSelectedFile);
    generationsSlider.addEventListener('input', updateGenerationsValue);
    generateBtn.addEventListener('click', generateFamilyTree);

    function handleFileSelect(event) {
        const file = event.target.files[0];

        if (!file) return;

        if (!isValidGedcomFile(file)) {
            showStatus('Please select a valid GEDCOM file (.ged or .gedcom)', 'error');
            return;
        }

        selectedFile = file;
        fileName.textContent = file.name;
        uploadBtn.style.display = 'none';
        fileInfo.style.display = 'flex';

        showStatus(`Parsing GEDCOM file "${file.name}"...`, 'info');

        // Parse the GEDCOM file
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const gedcomContent = e.target.result;
                parsedData = parser.parse(gedcomContent);

                if (parsedData.success) {
                    controls.style.display = 'block';
                    showStatus(`File parsed successfully: ${parsedData.individuals.length} individuals, ${parsedData.families.length} families`, 'success');
                } else {
                    showStatus(`Error parsing GEDCOM: ${parsedData.error}`, 'error');
                    controls.style.display = 'none';
                }
            } catch (error) {
                console.error('Error parsing GEDCOM:', error);
                showStatus('Error parsing GEDCOM file. Please check the file format.', 'error');
                controls.style.display = 'none';
            }
        };

        reader.onerror = function() {
            showStatus('Error reading file', 'error');
            controls.style.display = 'none';
        };

        reader.readAsText(file);
    }

    function clearSelectedFile() {
        selectedFile = null;
        parsedData = null;
        fileInput.value = '';
        uploadBtn.style.display = 'flex';
        fileInfo.style.display = 'none';
        controls.style.display = 'none';
        hideStatus();
    }

    function isValidGedcomFile(file) {
        const validExtensions = ['.ged', '.gedcom'];
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        return validExtensions.includes(extension);
    }

    function updateGenerationsValue() {
        generationsValue.textContent = generationsSlider.value;
    }

    function generateFamilyTree() {
        if (!parsedData || !parsedData.success) {
            showStatus('Please select and parse a GEDCOM file first', 'error');
            return;
        }

        const generations = parseInt(generationsSlider.value);
        const orientation = document.querySelector('input[name="orientation"]:checked').value;

        showStatus('Building family tree...', 'info');

        try {
            // Initialize tree builder with parsed data
            treeBuilder.initialize(parsedData.individuals, parsedData.families);

            // Find root person (proband - first individual)
            const rootPersonId = treeBuilder.findRootPerson(parsedData.individuals, {
                useFirst: true
            });

            if (!rootPersonId) {
                showStatus('Could not find a suitable root person for the tree', 'error');
                return;
            }

            // Build the tree
            const treeData = treeBuilder.buildTree(rootPersonId, {
                treeType: 'ancestors',
                maxGenerations: generations
            });

            const rootPerson = parsedData.individuals.find(p => p.id === rootPersonId);

            processTreeData({
                treeData: treeData,
                rootPerson: rootPerson,
                parsedData: parsedData,
                generations: generations,
                orientation: orientation
            });

        } catch (error) {
            console.error('Error building family tree:', error);
            showStatus('Error building family tree. Please try again.', 'error');
        }
    }

    function processTreeData(treeInfo) {
        showStatus('Preparing family tree visualization...', 'info');

        const data = {
            treeData: treeInfo.treeData,
            rootPerson: treeInfo.rootPerson,
            individuals: treeInfo.parsedData.individuals,
            families: treeInfo.parsedData.families,
            stats: treeInfo.parsedData.stats,
            generations: treeInfo.generations,
            orientation: treeInfo.orientation,
            timestamp: Date.now()
        };

        chrome.storage.local.set({ familyTreeData: data }, function() {
            if (chrome.runtime.lastError) {
                console.error('Storage error:', chrome.runtime.lastError);
                showStatus('Error saving tree data', 'error');
                return;
            }

            chrome.tabs.create({
                url: chrome.runtime.getURL('viewer/tree-viewer.html')
            }, function(tab) {
                if (chrome.runtime.lastError) {
                    console.error('Tab creation error:', chrome.runtime.lastError);
                    showStatus('Error opening tree viewer', 'error');
                } else {
                    showStatus(`Opening family tree for ${treeInfo.rootPerson.name.full}...`, 'success');
                    setTimeout(() => window.close(), 1500);
                }
            });
        });
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
    }

    function hideStatus() {
        status.style.display = 'none';
    }

    updateGenerationsValue();
});
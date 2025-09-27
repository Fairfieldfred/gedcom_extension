class FamilyTreeViewer {
    constructor() {
        this.svg = null;
        this.g = null;
        this.zoom = null;
        this.tooltip = null;
        this.treeData = null;
        this.individuals = null;
        this.families = null;
        this.rootPerson = null;
        this.originalProband = null;
        this.settings = {
            generations: 3,
            layout: 'vertical',
            treeType: 'ancestors',
            nodeWidth: 200,
            nodeHeight: 60,
            horizontalSpacing: 240,
            verticalSpacing: 100
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeVisualization();
        this.loadTreeData();
    }

    setupEventListeners() {
        // Control buttons - with safety checks
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        const resetZoomBtn = document.getElementById('resetZoom');
        const exportTreeBtn = document.getElementById('exportTree');
        const settingsBtn = document.getElementById('settingsBtn');

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());
        if (resetZoomBtn) resetZoomBtn.addEventListener('click', () => this.resetZoom());
        if (exportTreeBtn) exportTreeBtn.addEventListener('click', () => this.exportSVG());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.toggleSettings());

        // Settings panel
        const applySettingsBtn = document.getElementById('applySettings');
        const closeSettingsBtn = document.getElementById('closeSettings');

        if (applySettingsBtn) applySettingsBtn.addEventListener('click', () => this.applySettings());
        if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => this.closeSettings());

        // Settings controls
        const generationsSlider = document.getElementById('generationsSlider');
        const generationsValue = document.getElementById('generationsValue');

        if (generationsSlider && generationsValue) {
            generationsSlider.addEventListener('input', (e) => {
                generationsValue.textContent = e.target.value;
            });
        }

        // Error retry
        const retryLoadBtn = document.getElementById('retryLoad');
        if (retryLoadBtn) retryLoadBtn.addEventListener('click', () => this.loadTreeData());

        // Person details modal - check if elements exist first
        const closeBtn = document.getElementById('closeDetailsBtn');
        const modalOverlay = document.querySelector('.modal-overlay');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePersonDetails());
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.closePersonDetails());
        }

        // Person search - now in settings panel
        const openSearchBtn = document.getElementById('openSearchBtn');
        if (openSearchBtn) {
            openSearchBtn.addEventListener('click', () => this.openPersonSearch());
        }

        // Person search modal
        const closeSearchBtn = document.getElementById('closeSearchBtn');
        if (closeSearchBtn) {
            closeSearchBtn.addEventListener('click', () => this.closePersonSearch());
        }

        // Settings search input - just opens the search modal
        const settingsSearchInput = document.getElementById('settingsSearchInput');
        if (settingsSearchInput) {
            settingsSearchInput.addEventListener('focus', () => this.openPersonSearch());
            settingsSearchInput.addEventListener('click', () => this.openPersonSearch());
        }

        // Modal search input - handles the actual searching
        const modalSearchInput = document.getElementById('personSearchInput');
        if (modalSearchInput) {
            modalSearchInput.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
        }

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePersonDetails();
                this.closePersonSearch();
            }
        });
    }

    initializeVisualization() {
        const container = document.getElementById('treeContainer');
        const containerRect = container.getBoundingClientRect();

        this.svg = d3.select('#treeSvg')
            .attr('width', containerRect.width)
            .attr('height', containerRect.height);

        this.g = d3.select('#treeGroup');

        // Setup zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 3])
            .filter((event) => {
                // Allow zoom on wheel events, but not on click events
                return event.type !== 'click' && event.type !== 'dblclick';
            })
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);

        // Setup tooltip
        this.tooltip = d3.select('#personTooltip');

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    async loadTreeData() {
        this.showLoading();
        this.hideError();

        try {
            let data = null;

            // Try Chrome storage first (for extension use)
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await new Promise((resolve) => {
                    chrome.storage.local.get(['familyTreeData'], resolve);
                });
                data = result.familyTreeData;
            }

            // Fallback to localStorage (for web use)
            if (!data && typeof localStorage !== 'undefined') {
                const storedData = localStorage.getItem('familyTreeData');
                if (storedData) {
                    data = JSON.parse(storedData);
                }
            }

            if (data) {
                console.log('Loaded family tree data:', data);
                this.treeData = data.treeData;
                this.individuals = data.individuals;
                this.families = data.families;
                this.rootPerson = data.rootPerson;

                // Store the original proband for reset functionality
                if (!this.originalProband) {
                    this.originalProband = data.rootPerson;
                    console.log('Original proband stored:', this.originalProband.name.full);
                }

                console.log('Tree data:', this.treeData);
                console.log('Root person:', this.rootPerson);

                // Update settings from stored data
                if (data.generations) this.settings.generations = data.generations;
                if (data.orientation) this.settings.layout = data.orientation;

                // Update UI
                this.updateHeader();
                this.renderTree();
                this.hideLoading();
            } else {
                throw new Error('No family tree data found in Chrome storage or localStorage');
            }
        } catch (error) {
            console.error('Error loading tree data:', error);
            this.showError('Failed to load family tree data');
            this.hideLoading();
        }
    }

    updateHeader() {
        if (this.rootPerson) {
            const rootPersonNameElement = document.getElementById('rootPersonName');
            if (rootPersonNameElement) {
                rootPersonNameElement.textContent = this.rootPerson.name.full || 'Unknown';
            }

            // Also update the current root info in settings panel
            const currentRootNameElement = document.getElementById('currentRootName');
            if (currentRootNameElement) {
                currentRootNameElement.textContent = `Current: ${this.rootPerson.name.full || 'Unknown'}`;
            }
        }

        if (this.individuals) {
            const treeStatsElement = document.getElementById('treeStats');
            if (treeStatsElement) {
                treeStatsElement.textContent = `${this.individuals.length} individuals`;
            }
        }
    }

    renderTree() {
        if (!this.treeData) {
            console.error('No tree data to render');
            return;
        }

        console.log('Tree data structure:', this.treeData);

        // Clear existing content
        this.g.selectAll('*').remove();

        // Create tree layout
        const tree = this.settings.layout === 'horizontal'
            ? d3.tree().size([400, 600])
            : d3.tree().size([600, 400]);

        const root = d3.hierarchy(this.treeData.root, d => d.children);
        console.log('D3 hierarchy root:', root);
        tree(root);

        // Adjust positions based on layout
        const nodes = root.descendants();
        const links = root.links();

        if (this.settings.layout === 'horizontal') {
            // Handle horizontal layout based on tree type
            if (this.settings.treeType === 'both') {
                // For horizontal 'both' tree type, we need special positioning
                this.layoutBothTreeHorizontal(nodes);
            } else {
                // For ancestors or descendants only, swap x and y
                nodes.forEach(d => {
                    const temp = d.x;
                    d.x = d.y;
                    d.y = temp;
                });
            }
        } else {
            // Handle vertical layout based on tree type
            if (this.settings.treeType === 'both') {
                // For 'both' tree type, we need special positioning
                this.layoutBothTree(nodes);
            } else {
                // For ancestors or descendants only, flip y-axis so older generations are at top
                const maxY = Math.max(...nodes.map(d => d.y));
                nodes.forEach(d => {
                    d.y = maxY - d.y;
                });
            }
        }

        // Fix overlapping nodes within generations first
        this.adjustNodeSpacing(nodes);

        // Draw links after node positions are adjusted (so they appear behind nodes)
        this.drawLinks(links);

        // Draw nodes
        this.drawNodes(nodes);

        // Center the tree
        this.centerTree(nodes);
    }

    drawLinks(links) {
        const linkGenerator = this.settings.layout === 'horizontal'
            ? d3.linkHorizontal().x(d => d.x).y(d => d.y)
            : d3.linkVertical().x(d => d.x).y(d => d.y);

        // Use the full update pattern to handle existing and new links
        const linkSelection = this.g.selectAll('.tree-link')
            .data(links);

        // Remove old links
        linkSelection.exit().remove();

        // Add new links
        linkSelection.enter()
            .append('path')
            .attr('class', 'tree-link')
            .merge(linkSelection) // Merge with existing links
            .attr('d', linkGenerator); // Update path for both new and existing links
    }

    drawNodes(nodes) {
        const nodeGroup = this.g.selectAll('.person-node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', d => `person-node person-gender-${this.getPersonGender(d.data)}`)
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .style('cursor', 'pointer')
            .style('transform-origin', 'center center')  // Ensure transforms happen from center
            .on('mouseover', (event, d) => {
                console.log('Mouse over person:', d.data?.id);
                this.showTooltip(event, d);
            })
            .on('mouseout', () => this.hideTooltip())
            .on('click', (event, d) => {
                console.log('Click event fired for person:', d.data?.id);
                event.stopPropagation();  // Prevent event bubbling
                this.selectPerson(d);
            });

        // Add rectangles for person boxes
        nodeGroup.append('rect')
            .attr('class', 'person-rect')
            .attr('x', -this.settings.nodeWidth / 2)
            .attr('y', -this.settings.nodeHeight / 2)
            .attr('width', this.settings.nodeWidth)
            .attr('height', this.settings.nodeHeight)
            .attr('rx', 8);

        // Add person names
        nodeGroup.append('text')
            .attr('class', 'person-name')
            .attr('y', -8)
            .attr('clip-path', 'url(#nodeTextClip)')
            .text(d => this.getSmartPersonName(d.data, this.settings.nodeWidth - 20))
            .call(this.wrapText, this.settings.nodeWidth - 20, 2);

        // Add birth/death dates
        nodeGroup.append('text')
            .attr('class', 'person-dates')
            .attr('y', 12)
            .attr('clip-path', 'url(#nodeTextClip)')
            .text(d => this.getPersonDates(d.data))
            .call(this.wrapText, this.settings.nodeWidth - 20, 1);
    }

    wrapText(text, width, maxLines = 2) {
        text.each(function() {
            const text = d3.select(this);
            const originalText = text.text();
            const words = originalText.split(/\s+/).reverse();
            let word;
            let line = [];
            let lineNumber = 0;
            const lineHeight = 1.1;
            const y = text.attr('y');
            const dy = parseFloat(text.attr('dy') || 0);
            let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
            let isNameText = text.classed('person-name');

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(' '));

                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(' '));

                    // Check if we've reached max lines
                    if (lineNumber >= maxLines - 1) {
                        // Truncate with ellipsis
                        let truncatedText = line.join(' ');
                        if (words.length > 0 || word) {
                            // Try to fit as much as possible with ellipsis
                            while (truncatedText.length > 0) {
                                tspan.text(truncatedText + '...');
                                if (tspan.node().getComputedTextLength() <= width) {
                                    break;
                                }
                                // Remove last word and try again
                                const lastSpaceIndex = truncatedText.lastIndexOf(' ');
                                if (lastSpaceIndex === -1) {
                                    // Single word too long, truncate characters
                                    truncatedText = truncatedText.slice(0, -1);
                                } else {
                                    truncatedText = truncatedText.substring(0, lastSpaceIndex);
                                }
                            }
                        }
                        break;
                    }

                    line = [word];
                    tspan = text.append('tspan')
                        .attr('x', 0)
                        .attr('y', y)
                        .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                        .text(word);
                }
            }

            // Ensure single words that are too long are truncated
            text.selectAll('tspan').each(function() {
                const tspan = d3.select(this);
                let content = tspan.text();
                if (tspan.node().getComputedTextLength() > width && !content.includes('...')) {
                    while (content.length > 1 && tspan.node().getComputedTextLength() > width) {
                        content = content.slice(0, -1);
                        tspan.text(content + '...');
                    }
                }
            });
        });
    }

    layoutBothTree(nodes) {
        // Find the root node (generation 0)
        const rootNode = nodes.find(d => d.data.generation === 0);
        if (!rootNode) return;

        console.log('Laying out both tree with', nodes.length, 'nodes');

        // Separate nodes by relationship type
        const ancestorNodes = [];
        const descendantNodes = [];
        const rootNodes = [rootNode];

        nodes.forEach(node => {
            if (node === rootNode) {
                return; // Skip root
            }

            // Check if this node is an ancestor or descendant based on relationship
            const relationship = node.data.relationship;

            if (relationship === 'father' || relationship === 'mother' || this.isAncestor(node, rootNode)) {
                ancestorNodes.push(node);
            } else if (relationship === 'child' || this.isDescendant(node, rootNode)) {
                descendantNodes.push(node);
            } else {
                // Fallback: use generation number
                if (node.data.generation < rootNode.data.generation) {
                    ancestorNodes.push(node);
                } else {
                    descendantNodes.push(node);
                }
            }
        });

        console.log('Ancestors:', ancestorNodes.length, 'Descendants:', descendantNodes.length);

        // Position root at center (y = 0)
        rootNode.y = 0;

        // Position ancestors above (negative y values)
        const ancestorSpacing = this.settings.verticalSpacing;
        ancestorNodes.forEach(node => {
            const generationLevel = node.depth; // Use D3's depth property
            node.y = -generationLevel * ancestorSpacing;
        });

        // Position descendants below (positive y values)
        const descendantSpacing = this.settings.verticalSpacing;
        descendantNodes.forEach(node => {
            const generationLevel = node.depth; // Use D3's depth property
            node.y = generationLevel * descendantSpacing;
        });
    }

    isAncestor(node, rootNode) {
        // Check if node is an ancestor of root by traversing up the tree
        let current = rootNode.parent;
        while (current) {
            if (current === node) return true;
            current = current.parent;
        }
        return false;
    }

    isDescendant(node, rootNode) {
        // Check if node is a descendant of root by traversing down the tree
        function checkChildren(parent) {
            if (!parent.children) return false;
            for (let child of parent.children) {
                if (child === node) return true;
                if (checkChildren(child)) return true;
            }
            return false;
        }
        return checkChildren(rootNode);
    }

    adjustNodeSpacing(nodes) {
        // Group nodes by their depth level (generation)
        const nodesByDepth = new Map();

        nodes.forEach(node => {
            const depth = node.depth;
            if (!nodesByDepth.has(depth)) {
                nodesByDepth.set(depth, []);
            }
            nodesByDepth.get(depth).push(node);
        });

        console.log(`Adjusting spacing and centering for ${nodesByDepth.size} depth levels`);

        // For each layout, determine which axis nodes spread along within a generation
        const spreadAxis = this.settings.layout === 'horizontal' ? 'y' : 'x';

        // Calculate minimum spacing needed between node centers
        const nodeSize = this.settings.layout === 'horizontal'
            ? this.settings.nodeHeight   // In horizontal layout, nodes spread vertically
            : this.settings.nodeWidth;   // In vertical layout, nodes spread horizontally

        const minSpacing = nodeSize + 30; // Add 30px padding between boxes

        // Find the root person's position first
        const rootNodes = nodesByDepth.get(0) || [];
        const rootPosition = rootNodes.length > 0 ? rootNodes[0][spreadAxis] : 0;
        console.log(`Root person position: ${rootPosition.toFixed(0)}`);

        // Process each depth level
        const sortedDepths = Array.from(nodesByDepth.keys()).sort((a, b) => a - b);

        sortedDepths.forEach(depth => {
            const depthNodes = nodesByDepth.get(depth);

            // Skip if only one node or if this is the root generation
            if (depthNodes.length <= 1 || depth === 0) {
                console.log(`Skipping depth ${depth} (${depthNodes.length} nodes)`);
                return;
            }

            console.log(`Processing depth ${depth} with ${depthNodes.length} nodes`);

            // Simple approach: center the entire generation
            // First, sort nodes by their current position
            depthNodes.sort((a, b) => a[spreadAxis] - b[spreadAxis]);

            // Remove overlaps by ensuring minimum spacing
            for (let i = 1; i < depthNodes.length; i++) {
                const prevNode = depthNodes[i - 1];
                const currentNode = depthNodes[i];

                const minPosition = prevNode[spreadAxis] + minSpacing;
                if (currentNode[spreadAxis] < minPosition) {
                    console.log(`Fixed overlap: moving node from ${currentNode[spreadAxis].toFixed(0)} to ${minPosition.toFixed(0)}`);
                    currentNode[spreadAxis] = minPosition;
                }
            }

            // Now center the entire generation relative to the root person
            if (depthNodes.length > 1) {
                // Calculate the current span of the generation
                const leftMost = depthNodes[0][spreadAxis];
                const rightMost = depthNodes[depthNodes.length - 1][spreadAxis];
                const currentCenter = (leftMost + rightMost) / 2;

                // Center relative to the root person's position
                const targetCenter = rootPosition;

                // Calculate the shift needed
                const shift = targetCenter - currentCenter;

                if (Math.abs(shift) > 1) {
                    console.log(`Centering generation ${depth}: shifting by ${shift.toFixed(0)} (from center ${currentCenter.toFixed(0)} to ${targetCenter.toFixed(0)})`);

                    // Apply the shift to all nodes in this generation
                    depthNodes.forEach(node => {
                        node[spreadAxis] += shift;
                    });
                }
            }
        });
    }

    layoutBothTreeHorizontal(nodes) {
        // Find the root node (generation 0)
        const rootNode = nodes.find(d => d.data.generation === 0);
        if (!rootNode) return;

        console.log('Laying out horizontal both tree with', nodes.length, 'nodes');

        // Separate nodes by relationship type
        const ancestorNodes = [];
        const descendantNodes = [];

        nodes.forEach(node => {
            if (node === rootNode) {
                return; // Skip root
            }

            // Check if this node is an ancestor or descendant based on relationship
            const relationship = node.data.relationship;

            if (relationship === 'father' || relationship === 'mother' || this.isAncestor(node, rootNode)) {
                ancestorNodes.push(node);
            } else if (relationship === 'child' || this.isDescendant(node, rootNode)) {
                descendantNodes.push(node);
            } else {
                // Fallback: use generation number
                if (node.data.generation < rootNode.data.generation) {
                    ancestorNodes.push(node);
                } else {
                    descendantNodes.push(node);
                }
            }
        });

        console.log('Horizontal layout - Ancestors:', ancestorNodes.length, 'Descendants:', descendantNodes.length);

        // First swap x and y coordinates for all nodes
        nodes.forEach(d => {
            const temp = d.x;
            d.x = d.y;
            d.y = temp;
        });

        // Position root at center (x = 0)
        rootNode.x = 0;

        // Position ancestors to the right (positive x values)
        const ancestorSpacing = this.settings.horizontalSpacing;
        ancestorNodes.forEach(node => {
            const generationLevel = node.depth; // Use D3's depth property
            node.x = generationLevel * ancestorSpacing;
        });

        // Position descendants to the left (negative x values)
        const descendantSpacing = this.settings.horizontalSpacing;
        descendantNodes.forEach(node => {
            const generationLevel = node.depth; // Use D3's depth property
            node.x = -generationLevel * descendantSpacing;
        });
    }

    getPersonName(person) {
        if (!person) return 'Unknown';

        // Check if it's a tree node with _person property
        const actualPerson = person._person || person;

        return actualPerson.name?.full || actualPerson.name?.given || actualPerson.displayName || 'Unknown';
    }

    getSmartPersonName(person, maxWidth) {
        if (!person) return 'Unknown';

        // Check if it's a tree node with _person property
        const actualPerson = person._person || person;
        const name = actualPerson.name;

        if (!name) return 'Unknown';

        const fullName = name.full;
        if (!fullName) {
            return name.given || name.displayName || 'Unknown';
        }

        // Simple heuristic: if name is longer than ~15 characters, try to shorten it
        // This approximates fitting within typical node widths
        if (fullName.length > 15) {
            // Try to build first + last name from components
            const given = name.given || '';
            const surname = name.surname || '';

            if (given && surname) {
                const shortName = `${given} ${surname}`;

                // If the short name is significantly shorter, use it
                if (shortName.length < fullName.length - 3) {
                    console.log(`Shortened "${fullName}" to "${shortName}"`);
                    return shortName;
                }
            }

            // Alternative approach: parse the full name and extract first and last
            const nameParts = fullName.trim().split(/\s+/);
            if (nameParts.length > 2) {
                // Take first and last parts, skip middle names
                const shortName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
                console.log(`Parsed "${fullName}" to "${shortName}"`);
                return shortName;
            }
        }

        return fullName;
    }

    getPersonDates(person) {
        if (!person) return '';

        // Check if it's a tree node with _person property
        const actualPerson = person._person || person;

        // Extract years only from birth and death dates
        const birthDate = actualPerson.birth?.date;
        const deathDate = actualPerson.death?.date;

        // Extract year from different date formats
        const getYear = (dateObj) => {
            if (!dateObj) return null;

            // Try parsed date first
            if (dateObj.parsed && dateObj.parsed instanceof Date) {
                return dateObj.parsed.getFullYear();
            }

            // Try display string
            if (dateObj.display) {
                const yearMatch = dateObj.display.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
                if (yearMatch) return parseInt(yearMatch[1]);
            }

            // Try raw string
            if (dateObj.raw) {
                const yearMatch = dateObj.raw.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
                if (yearMatch) return parseInt(yearMatch[1]);
            }

            return null;
        };

        const birthYear = getYear(birthDate);
        const deathYear = getYear(deathDate);

        // Format as "YYYY - YYYY" or "YYYY" or "- YYYY"
        if (birthYear && deathYear) {
            return `${birthYear} - ${deathYear}`;
        } else if (birthYear) {
            return `${birthYear}`;
        } else if (deathYear) {
            return `- ${deathYear}`;
        }

        return '';
    }

    getPersonFullDates(person) {
        if (!person) return '';

        // Check if it's a tree node with _person property
        const actualPerson = person._person || person;

        // Extract birth and death information
        const birthDate = actualPerson.birth?.date;
        const birthPlace = actualPerson.birth?.place;
        const deathDate = actualPerson.death?.date;
        const deathPlace = actualPerson.death?.place;

        // Build date strings from the display property
        const birthStr = birthDate?.display || birthDate?.raw || '';
        const deathStr = deathDate?.display || deathDate?.raw || '';

        // Add places if available
        const birthInfo = birthStr ? (birthPlace ? `${birthStr}, ${birthPlace}` : birthStr) : (birthPlace ? `b. ${birthPlace}` : '');
        const deathInfo = deathStr ? (deathPlace ? `${deathStr}, ${deathPlace}` : deathStr) : (deathPlace ? `d. ${deathPlace}` : '');

        if (birthInfo && deathInfo) {
            return `${birthInfo} - ${deathInfo}`;
        } else if (birthInfo) {
            return birthInfo;
        } else if (deathInfo) {
            return deathInfo;
        }
        return '';
    }

    getPersonGender(person) {
        if (!person || !person.id) return 'unknown';
        const individual = this.individuals.find(ind => ind.id === person.id);
        return individual?.sex?.toLowerCase() || 'unknown';
    }

    showTooltip(event, d) {
        console.log('showTooltip called for:', d.data?.id);

        if (!d.data || !d.data.id) {
            console.log('No individual data found');
            return;
        }

        const individual = this.individuals.find(ind => ind.id === d.data.id);
        if (!individual) {
            console.log('Individual not found in data');
            return;
        }

        console.log('Found individual:', individual.name.full);

        // Check if tooltip element exists
        if (!this.tooltip || !this.tooltip.node()) {
            console.log('Tooltip element not found');
            return;
        }

        // Update tooltip content with safety checks
        const tooltipName = document.getElementById('tooltipName');
        const tooltipDates = document.getElementById('tooltipDates');

        if (tooltipName) tooltipName.textContent = individual.name.full || 'Unknown';
        if (tooltipDates) tooltipDates.textContent = this.getPersonFullDates(d.data);

        // Birth info
        const birthDetail = document.getElementById('tooltipBirth');
        const birthEvent = individual.events?.birth;
        if (birthDetail) {
            if (birthEvent && (birthEvent.date || birthEvent.place)) {
                const detailValue = birthDetail.querySelector('.detail-value');
                if (detailValue) {
                    detailValue.textContent = `${birthEvent.date || ''} ${birthEvent.place || ''}`.trim();
                }
                birthDetail.classList.remove('hidden');
            } else {
                birthDetail.classList.add('hidden');
            }
        }

        // Death info
        const deathDetail = document.getElementById('tooltipDeath');
        const deathEvent = individual.events?.death;
        if (deathDetail) {
            if (deathEvent && (deathEvent.date || deathEvent.place)) {
                const detailValue = deathDetail.querySelector('.detail-value');
                if (detailValue) {
                    detailValue.textContent = `${deathEvent.date || ''} ${deathEvent.place || ''}`.trim();
                }
                deathDetail.classList.remove('hidden');
            } else {
                deathDetail.classList.add('hidden');
            }
        }

        // Show tooltip
        console.log('Showing tooltip at:', event.pageX + 10, event.pageY - 10);
        this.tooltip.classed('hidden', false)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    hideTooltip() {
        this.tooltip.classed('hidden', true);
    }

    selectPerson(d) {
        console.log('selectPerson called with:', d);
        console.log('Person data:', d.data);
        console.log('Person ID:', d.data?.id);
        this.showPersonDetails(d);
    }

    centerTree(nodes) {
        if (nodes.length === 0) return;

        const bounds = this.getTreeBounds(nodes);
        const containerRect = document.getElementById('treeContainer').getBoundingClientRect();

        // Calculate tree dimensions
        const treeWidth = bounds.maxX - bounds.minX;
        const treeHeight = bounds.maxY - bounds.minY;

        // Add padding around the tree (20% of container size)
        const padding = Math.min(containerRect.width, containerRect.height) * 0.1;
        const availableWidth = containerRect.width - (padding * 2);
        const availableHeight = containerRect.height - (padding * 2);

        // Calculate scale to fit both width and height
        const scaleX = availableWidth / treeWidth;
        const scaleY = availableHeight / treeHeight;
        const scale = Math.min(scaleX, scaleY, 1.0); // Don't zoom in beyond 100%

        console.log(`Auto-fit: Tree ${treeWidth.toFixed(0)}x${treeHeight.toFixed(0)}, Container ${containerRect.width.toFixed(0)}x${containerRect.height.toFixed(0)}, Scale: ${scale.toFixed(2)}`);

        // Calculate center positions
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        const treeCenterX = (bounds.minX + bounds.maxX) / 2;
        const treeCenterY = (bounds.minY + bounds.maxY) / 2;

        const transform = d3.zoomIdentity
            .translate(centerX - treeCenterX * scale, centerY - treeCenterY * scale)
            .scale(scale);

        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, transform);
    }

    getTreeBounds(nodes) {
        const bounds = {
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity
        };

        nodes.forEach(node => {
            bounds.minX = Math.min(bounds.minX, node.x - this.settings.nodeWidth / 2);
            bounds.maxX = Math.max(bounds.maxX, node.x + this.settings.nodeWidth / 2);
            bounds.minY = Math.min(bounds.minY, node.y - this.settings.nodeHeight / 2);
            bounds.maxY = Math.max(bounds.maxY, node.y + this.settings.nodeHeight / 2);
        });

        return bounds;
    }

    // Control methods
    zoomIn() {
        this.svg.transition().call(this.zoom.scaleBy, 1.5);
    }

    zoomOut() {
        this.svg.transition().call(this.zoom.scaleBy, 1 / 1.5);
    }

    resetZoom() {
        // Reset view functionality: return to original proband with 3 generations of ancestors
        if (this.originalProband && this.individuals && this.families) {
            console.log('Resetting view to original proband:', this.originalProband.name.full);

            // Reset settings to original values
            this.settings.treeType = 'ancestors';
            this.settings.generations = 3;

            // Set root person back to original proband
            this.rootPerson = this.originalProband;

            // Update settings UI to reflect reset values
            this.updateSettingsUI();

            // Rebuild tree with original proband and reset settings
            this.rebuildTreeWithNewSettings();

            // Update header to show the reset person
            this.updateHeader();

            console.log('View reset to original proband with 3 generations of ancestors');
        } else {
            // Fallback to just centering the tree if no original proband is stored
            const nodes = this.g.selectAll('.person-node').data();
            if (nodes.length > 0) {
                this.centerTree(nodes);
            }
        }
    }

    exportSVG() {
        const svgElement = document.getElementById('treeSvg');
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `family-tree-${Date.now()}.svg`;
        a.click();

        URL.revokeObjectURL(url);
    }

    toggleSettings() {
        const panel = document.getElementById('settingsPanel');

        // Update UI to reflect current settings
        if (!panel.classList.contains('hidden')) {
            // Closing panel
            panel.classList.add('hidden');
        } else {
            // Opening panel - update UI with current settings
            this.updateSettingsUI();
            panel.classList.remove('hidden');
        }
    }

    updateSettingsUI() {
        // Update generations slider and display
        const generationsSlider = document.getElementById('generationsSlider');
        const generationsValue = document.getElementById('generationsValue');

        if (generationsSlider && generationsValue) {
            generationsSlider.value = this.settings.generations;
            generationsValue.textContent = this.settings.generations;
        }

        // Update layout radio buttons
        const layoutRadios = document.querySelectorAll('input[name="layout"]');
        layoutRadios.forEach(radio => {
            radio.checked = radio.value === this.settings.layout;
        });

        // Update tree type radio buttons
        const treeTypeRadios = document.querySelectorAll('input[name="treeType"]');
        treeTypeRadios.forEach(radio => {
            radio.checked = radio.value === this.settings.treeType;
        });
    }

    closeSettings() {
        document.getElementById('settingsPanel').classList.add('hidden');
    }

    applySettings() {
        // Get settings from UI
        const generations = parseInt(document.getElementById('generationsSlider').value);
        const layout = document.querySelector('input[name="layout"]:checked').value;
        const treeType = document.querySelector('input[name="treeType"]:checked').value;

        console.log('Applying new settings:', { generations, layout, treeType });

        // Update settings
        this.settings.generations = generations;
        this.settings.layout = layout;
        this.settings.treeType = treeType;

        // Rebuild tree data with new settings if we have the necessary data
        if (this.individuals && this.families && this.rootPerson) {
            this.rebuildTreeWithNewSettings();
        } else {
            // Fallback to just re-rendering existing tree
            this.renderTree();
        }

        // Close settings panel
        this.closeSettings();
    }

    rebuildTreeWithNewSettings() {
        console.log(`Rebuilding tree with ${this.settings.generations} generations`);

        try {
            // Create a new TreeBuilder instance
            const treeBuilder = new TreeBuilder();
            treeBuilder.initialize(this.individuals, this.families);

            // Build new tree with updated settings
            const newTreeData = treeBuilder.buildTree(this.rootPerson.id, {
                treeType: this.settings.treeType,
                maxGenerations: this.settings.generations
            });

            // Update the tree data
            this.treeData = newTreeData;

            console.log('Tree rebuilt with new data:', this.treeData);

            // Re-render with new data
            this.renderTree();

        } catch (error) {
            console.error('Error rebuilding tree:', error);
            // Fallback to re-rendering existing tree
            this.renderTree();
        }
    }

    handleResize() {
        const container = document.getElementById('treeContainer');
        const containerRect = container.getBoundingClientRect();

        this.svg
            .attr('width', containerRect.width)
            .attr('height', containerRect.height);
    }

    // Utility methods
    showLoading() {
        document.getElementById('loadingIndicator').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingIndicator').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorDisplay').classList.remove('hidden');
    }

    hideError() {
        document.getElementById('errorDisplay').classList.add('hidden');
    }

    // Person Details Modal Methods
    showPersonDetails(d) {
        console.log('showPersonDetails called for:', d.data?.id);

        if (!d.data || !d.data.id) {
            console.log('No individual data for modal');
            return;
        }

        const individual = this.individuals.find(ind => ind.id === d.data.id);
        if (!individual) {
            console.log('Individual not found for modal');
            return;
        }

        console.log('Found individual for modal:', individual.name.full);

        const modal = document.getElementById('personDetailsModal');
        if (!modal) {
            console.warn('Person details modal element not found in DOM');
            // Try to find it with a query selector
            const modalByQuery = document.querySelector('.person-details-modal');
            if (!modalByQuery) {
                console.error('Modal not found by class either');
                alert('Modal element missing from page - you may be on the test page instead of the viewer page');
                return;
            } else {
                console.log('Found modal by class selector');
            }
            return;
        }

        console.log('Modal element found, showing modal');

        // Hide tooltip when showing modal
        this.hideTooltip();

        // Populate modal content
        this.populatePersonDetails(individual);

        // Show modal
        modal.classList.remove('hidden');
        console.log('Modal should now be visible');
    }

    closePersonDetails() {
        const modal = document.getElementById('personDetailsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    populatePersonDetails(individual) {
        // Helper function to safely set text content
        const safeSetText = (id, text) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        };

        // Basic information
        safeSetText('detailsName', individual.name.full || 'Unknown');

        // Lifespan
        const birthYear = individual.birth?.date?.display || '?';
        const deathYear = individual.death?.date?.display || (individual.death?.date ? '?' : 'Living');
        safeSetText('detailsLifespan', `${birthYear} - ${deathYear}`);

        // Gender
        const genderText = individual.sex === 'M' ? 'Male' : individual.sex === 'F' ? 'Female' : 'Unknown';
        safeSetText('detailsGender', genderText);

        // Birth information
        safeSetText('birthDate', individual.birth?.date?.display || 'Unknown');
        safeSetText('birthPlace', individual.birth?.place || 'Unknown');

        // Death information
        const deathSection = document.getElementById('deathSection');
        if (deathSection) {
            if (individual.death?.date || individual.death?.place) {
                safeSetText('deathDate', individual.death?.date?.display || 'Unknown');
                safeSetText('deathPlace', individual.death?.place || 'Unknown');
                deathSection.classList.remove('hidden');
            } else {
                deathSection.classList.add('hidden');
            }
        }

        // Spouses
        this.populateSpouses(individual);

        // Children
        this.populateChildren(individual);

        // Parents
        this.populateParents(individual);
    }

    populateSpouses(individual) {
        const spousesContainer = document.getElementById('detailsSpouses');
        if (!spousesContainer) return;

        if (individual.families.spouse.length === 0) {
            spousesContainer.innerHTML = '<div class="empty-section">No marriage records found</div>';
            return;
        }

        let spousesHtml = '';
        individual.families.spouse.forEach(familyId => {
            const family = this.families.find(f => f.id === familyId);
            if (family) {
                const spouseId = individual.sex === 'M' ? family.wife : family.husband;
                const spouse = this.individuals.find(ind => ind.id === spouseId);

                if (spouse) {
                    const marriageDate = family.marriage?.date?.display || '';
                    const marriagePlace = family.marriage?.place || '';
                    const spouseLifespan = this.getPersonDates({ _person: spouse });

                    spousesHtml += `
                        <div class="family-member">
                            <div>
                                <div class="member-name">${spouse.name.full || 'Unknown'}</div>
                                <div class="member-dates">${spouseLifespan}</div>
                                ${marriageDate ? `<div class="member-dates">Married: ${marriageDate}</div>` : ''}
                                ${marriagePlace ? `<div class="member-dates">Place: ${marriagePlace}</div>` : ''}
                            </div>
                        </div>
                    `;
                }
            }
        });

        spousesContainer.innerHTML = spousesHtml || '<div class="empty-section">No spouse information available</div>';
    }

    populateChildren(individual) {
        const childrenContainer = document.getElementById('detailsChildren');
        if (!childrenContainer) return;

        const allChildren = [];
        individual.families.spouse.forEach(familyId => {
            const family = this.families.find(f => f.id === familyId);
            if (family && family.children) {
                family.children.forEach(childId => {
                    const child = this.individuals.find(ind => ind.id === childId);
                    if (child) {
                        allChildren.push(child);
                    }
                });
            }
        });

        if (allChildren.length === 0) {
            childrenContainer.innerHTML = '<div class="empty-section">No children found</div>';
            return;
        }

        let childrenHtml = '';
        allChildren.forEach(child => {
            const childLifespan = this.getPersonDates({ _person: child });
            childrenHtml += `
                <div class="family-member">
                    <div>
                        <div class="member-name">${child.name.full || 'Unknown'}</div>
                        <div class="member-dates">${childLifespan}</div>
                    </div>
                </div>
            `;
        });

        childrenContainer.innerHTML = childrenHtml;
    }

    populateParents(individual) {
        const parentsContainer = document.getElementById('detailsParents');
        if (!parentsContainer) return;

        if (individual.families.child.length === 0) {
            parentsContainer.innerHTML = '<div class="empty-section">No parent information found</div>';
            return;
        }

        let parentsHtml = '';
        individual.families.child.forEach(familyId => {
            const family = this.families.find(f => f.id === familyId);
            if (family) {
                // Father
                if (family.husband) {
                    const father = this.individuals.find(ind => ind.id === family.husband);
                    if (father) {
                        const fatherLifespan = this.getPersonDates({ _person: father });
                        parentsHtml += `
                            <div class="family-member">
                                <div>
                                    <div class="member-name">${father.name.full || 'Unknown'} (Father)</div>
                                    <div class="member-dates">${fatherLifespan}</div>
                                </div>
                            </div>
                        `;
                    }
                }

                // Mother
                if (family.wife) {
                    const mother = this.individuals.find(ind => ind.id === family.wife);
                    if (mother) {
                        const motherLifespan = this.getPersonDates({ _person: mother });
                        parentsHtml += `
                            <div class="family-member">
                                <div>
                                    <div class="member-name">${mother.name.full || 'Unknown'} (Mother)</div>
                                    <div class="member-dates">${motherLifespan}</div>
                                </div>
                            </div>
                        `;
                    }
                }
            }
        });

        parentsContainer.innerHTML = parentsHtml || '<div class="empty-section">No parent information available</div>';
    }

    // Person Search Methods
    openPersonSearch() {
        const modal = document.getElementById('personSearchModal');
        if (!modal) {
            console.warn('Search modal not found');
            return;
        }

        // Clear previous search
        const searchInput = document.getElementById('personSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }

        // Show initial results (all people)
        this.displaySearchResults('');

        // Show modal
        modal.classList.remove('hidden');

        // Focus on search input
        setTimeout(() => {
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    }

    closePersonSearch() {
        const modal = document.getElementById('personSearchModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    handleSearchInput(searchTerm) {
        this.displaySearchResults(searchTerm);
    }

    displaySearchResults(searchTerm) {
        const resultsContainer = document.getElementById('searchResults');
        const statsContainer = document.getElementById('searchStats');

        if (!resultsContainer || !this.individuals) return;

        // Filter individuals based on search term
        let filteredPeople = this.individuals;

        if (searchTerm && searchTerm.length > 0) {
            const searchLower = searchTerm.toLowerCase();
            filteredPeople = this.individuals.filter(person => {
                const fullName = (person.name.full || '').toLowerCase();
                const givenName = (person.name.given || '').toLowerCase();
                const surname = (person.name.surname || '').toLowerCase();

                return fullName.includes(searchLower) ||
                       givenName.includes(searchLower) ||
                       surname.includes(searchLower);
            });
        }

        // Sort by name
        filteredPeople.sort((a, b) => {
            const nameA = a.name.full || a.name.given || '';
            const nameB = b.name.full || b.name.given || '';
            return nameA.localeCompare(nameB);
        });

        // Limit results for performance
        const maxResults = 50;
        const displayedPeople = filteredPeople.slice(0, maxResults);

        // Update stats
        if (statsContainer) {
            if (searchTerm) {
                const totalText = filteredPeople.length === maxResults ? `${maxResults}+` : filteredPeople.length;
                statsContainer.textContent = `${totalText} results found`;
            } else {
                statsContainer.textContent = `Showing first ${Math.min(maxResults, this.individuals.length)} people`;
            }
        }

        // Generate HTML
        if (displayedPeople.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No people found matching your search</div>';
            return;
        }

        let html = '';
        displayedPeople.forEach(person => {
            const isCurrentRoot = person.id === this.rootPerson?.id;
            const dates = this.getPersonDates({ _person: person });

            html += `
                <div class="search-result-item ${isCurrentRoot ? 'current-root' : ''}"
                     data-person-id="${person.id}">
                    <div>
                        <div class="result-name">${person.name.full || 'Unknown'}</div>
                        <div class="result-details">
                            ID: ${person.id} • ${person.sex || '?'} • ${dates || 'No dates'}
                        </div>
                    </div>
                    <div>
                        ${isCurrentRoot ? '<span class="result-badge current">Current</span>' : '<span class="result-badge">Select</span>'}
                    </div>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;

        // Add event delegation for search result clicks
        resultsContainer.addEventListener('click', (e) => {
            const resultItem = e.target.closest('.search-result-item');
            if (resultItem && resultItem.dataset.personId) {
                this.selectNewRootPerson(resultItem.dataset.personId);
            }
        });
    }

    selectNewRootPerson(personId) {
        console.log('Selecting new root person:', personId);

        const newRootPerson = this.individuals.find(ind => ind.id === personId);
        if (!newRootPerson) {
            console.error('Person not found:', personId);
            return;
        }

        // Update root person
        this.rootPerson = newRootPerson;

        // Close search modal
        this.closePersonSearch();

        // Rebuild tree with new root person
        this.rebuildTreeWithNewRoot();

        // Update header
        this.updateHeader();
    }

    rebuildTreeWithNewRoot() {
        console.log('Rebuilding tree with new root person:', this.rootPerson.name.full);

        try {
            // Create a new TreeBuilder instance
            const treeBuilder = new TreeBuilder();
            treeBuilder.initialize(this.individuals, this.families);

            // Build new tree with the new root person
            const newTreeData = treeBuilder.buildTree(this.rootPerson.id, {
                treeType: this.settings.treeType,
                maxGenerations: this.settings.generations
            });

            // Update the tree data
            this.treeData = newTreeData;

            console.log('Tree rebuilt with new root:', this.treeData);

            // Re-render with new data
            this.renderTree();

        } catch (error) {
            console.error('Error rebuilding tree with new root:', error);
            alert('Error rebuilding tree. Please try again.');
        }
    }
}

// Initialize the viewer when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.familyTreeViewer = new FamilyTreeViewer();
});
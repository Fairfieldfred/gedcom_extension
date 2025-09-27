/**
 * Tree Builder for Family Tree Visualization
 * Constructs hierarchical family tree structures from parsed GEDCOM data
 *
 * Key Features:
 * - Build ancestor and descendant trees
 * - Handle multiple generations
 * - Support both vertical and horizontal layouts
 * - Generate D3.js compatible data structures
 */

class TreeBuilder {
    constructor() {
        this.individuals = new Map();
        this.families = new Map();
        this.rootPerson = null;
        this.maxGenerations = 5;
        this.treeType = 'ancestors'; // 'ancestors', 'descendants', or 'both'
    }

    /**
     * Initialize with parsed GEDCOM data
     * @param {Array} individuals - Array of individual records
     * @param {Array} families - Array of family records
     */
    initialize(individuals, families) {
        this.individuals.clear();
        this.families.clear();

        // Convert arrays to maps for efficient lookup
        individuals.forEach(person => {
            this.individuals.set(person.id, person);
        });

        families.forEach(family => {
            this.families.set(family.id, family);
        });
    }

    /**
     * Build family tree starting from a specific person
     * @param {string} rootPersonId - ID of the root person
     * @param {Object} options - Tree building options
     * @returns {Object} Tree structure for visualization
     */
    buildTree(rootPersonId, options = {}) {
        const {
            maxGenerations = 5,
            treeType = 'ancestors',
            includeSpouses = true,
            includeSiblings = false
        } = options;

        this.maxGenerations = maxGenerations;
        this.treeType = treeType;
        this.rootPerson = this.individuals.get(rootPersonId);

        if (!this.rootPerson) {
            throw new Error(`Person with ID ${rootPersonId} not found`);
        }

        let treeData;

        switch (treeType) {
            case 'ancestors':
                treeData = this.buildAncestorTree(rootPersonId, 0);
                break;
            case 'descendants':
                treeData = this.buildDescendantTree(rootPersonId, 0);
                break;
            case 'both':
                treeData = this.buildCombinedTree(rootPersonId);
                break;
            default:
                throw new Error(`Unknown tree type: ${treeType}`);
        }

        return {
            root: treeData,
            metadata: {
                rootPersonId,
                treeType,
                maxGenerations,
                totalNodes: this.countNodes(treeData),
                includeSpouses,
                includeSiblings
            }
        };
    }

    /**
     * Build ancestor tree (parents, grandparents, etc.)
     * @param {string} personId - Current person ID
     * @param {number} generation - Current generation level
     * @returns {Object} Tree node
     */
    buildAncestorTree(personId, generation) {
        const person = this.individuals.get(personId);
        if (!person || generation >= this.maxGenerations) {
            return null;
        }

        const node = this.createTreeNode(person, generation);

        // Find parents through family relationships
        const childFamilies = person.families.child;
        if (childFamilies.length > 0) {
            const parentFamily = this.families.get(childFamilies[0]); // Use first family

            if (parentFamily) {
                const parents = [];

                // Add father
                if (parentFamily.husband) {
                    const father = this.buildAncestorTree(parentFamily.husband, generation + 1);
                    if (father) {
                        father.relationship = 'father';
                        parents.push(father);
                    }
                }

                // Add mother
                if (parentFamily.wife) {
                    const mother = this.buildAncestorTree(parentFamily.wife, generation + 1);
                    if (mother) {
                        mother.relationship = 'mother';
                        parents.push(mother);
                    }
                }

                if (parents.length > 0) {
                    node.parents = parents;
                    node.children = parents; // For D3 compatibility
                }
            }
        }

        return node;
    }

    /**
     * Build descendant tree (children, grandchildren, etc.)
     * @param {string} personId - Current person ID
     * @param {number} generation - Current generation level
     * @returns {Object} Tree node
     */
    buildDescendantTree(personId, generation) {
        const person = this.individuals.get(personId);
        if (!person || generation >= this.maxGenerations) {
            return null;
        }

        const node = this.createTreeNode(person, generation);
        const children = [];

        // Find children through spouse families
        person.families.spouse.forEach(familyId => {
            const family = this.families.get(familyId);
            if (family && family.children) {
                family.children.forEach(childId => {
                    const child = this.buildDescendantTree(childId, generation + 1);
                    if (child) {
                        child.relationship = 'child';
                        children.push(child);
                    }
                });
            }
        });

        if (children.length > 0) {
            node.children = children;
        }

        return node;
    }

    /**
     * Build combined ancestor and descendant tree
     * @param {string} rootPersonId - Root person ID
     * @returns {Object} Combined tree structure
     */
    buildCombinedTree(rootPersonId) {
        const ancestorGenerations = Math.floor(this.maxGenerations / 2);
        const descendantGenerations = this.maxGenerations - ancestorGenerations;

        // Build ancestor part
        const ancestorTree = this.buildAncestorTree(rootPersonId, 0);

        // Build descendant part
        const descendantTree = this.buildDescendantTree(rootPersonId, 0);

        // Merge trees
        if (ancestorTree && descendantTree && descendantTree.children) {
            ancestorTree.children = (ancestorTree.children || []).concat(descendantTree.children);
        }

        return ancestorTree;
    }

    /**
     * Create tree node from person data
     * @param {Object} person - Individual record
     * @param {number} generation - Generation level
     * @returns {Object} Tree node
     */
    createTreeNode(person, generation) {
        return {
            id: person.id,
            generation: generation,
            name: {
                full: person.name.full,
                given: person.name.given,
                surname: person.name.surname
            },
            sex: person.sex,
            birth: person.birth,
            death: person.death,
            isAlive: !person.death.date,
            dates: this.getLifeDates(person),
            displayName: this.getDisplayName(person),

            // Visualization properties
            depth: generation,
            nodeType: 'person',

            // Family context
            spouses: this.getSpouses(person),

            // Original person data for detailed view
            _person: person,

            // Children will be added by tree building methods
            children: null
        };
    }

    /**
     * Get display name for person
     * @param {Object} person - Individual record
     * @returns {string} Display name
     */
    getDisplayName(person) {
        const { given, surname } = person.name;
        if (given && surname) {
            return `${given} ${surname}`;
        }
        return person.name.full || 'Unknown';
    }

    /**
     * Get formatted life dates
     * @param {Object} person - Individual record
     * @returns {string} Formatted date range
     */
    getLifeDates(person) {
        const birth = person.birth.date?.display || '?';
        const death = person.death.date?.display || (person.death.date ? '?' : '');

        if (death) {
            return `(${birth} - ${death})`;
        } else if (birth !== '?') {
            return `(b. ${birth})`;
        }
        return '';
    }

    /**
     * Get spouse information
     * @param {Object} person - Individual record
     * @returns {Array} Array of spouse objects
     */
    getSpouses(person) {
        const spouses = [];

        person.families.spouse.forEach(familyId => {
            const family = this.families.get(familyId);
            if (family) {
                const spouseId = person.sex === 'M' ? family.wife : family.husband;
                const spouse = this.individuals.get(spouseId);

                if (spouse) {
                    spouses.push({
                        id: spouse.id,
                        name: this.getDisplayName(spouse),
                        marriageDate: family.marriage.date?.display,
                        marriagePlace: family.marriage.place
                    });
                }
            }
        });

        return spouses;
    }

    /**
     * Find suitable root person for tree building
     * @param {Array} individuals - Array of all individuals
     * @param {Object} preferences - Preferences for root selection
     * @returns {string|null} ID of suggested root person
     */
    findRootPerson(individuals, preferences = {}) {
        const {
            useFirst = true,
            preferEarliest = false,
            preferMostConnections = false,
            preferMales = false
        } = preferences;

        if (individuals.length === 0) {
            return null;
        }

        // Default: Use the first individual (proband/primary person)
        // In GEDCOM files, the first individual is typically the person of interest
        if (useFirst) {
            const firstPerson = individuals.find(person => person.name.full || person.name.given);
            if (firstPerson) {
                return firstPerson.id;
            }
        }

        // Fallback: Use preference-based selection
        let candidates = individuals.filter(person => person.name.full || person.name.given);

        if (candidates.length === 0) {
            // Last resort: return first individual even without name
            return individuals[0]?.id || null;
        }

        // Only do complex scoring if specifically requested
        if (preferEarliest || preferMostConnections || preferMales) {
            candidates.forEach(person => {
                let score = 0;

                // Prefer people with birth dates
                if (person.birth.date) {
                    score += 10;

                    // Prefer earliest birth dates if specified
                    if (preferEarliest && person.birth.date.parsed) {
                        const year = person.birth.date.parsed.getFullYear();
                        score += Math.max(0, 2100 - year) / 10;
                    }
                }

                // Prefer people with more family connections
                if (preferMostConnections) {
                    score += (person.families.child.length + person.families.spouse.length) * 5;
                }

                // Sex preference
                if (preferMales && person.sex === 'M') {
                    score += 3;
                } else if (!preferMales && person.sex === 'F') {
                    score += 3;
                }

                // Prefer people with complete names
                if (person.name.given && person.name.surname) {
                    score += 5;
                }

                person._score = score;
            });

            // Sort by score and return highest
            candidates.sort((a, b) => b._score - a._score);
            return candidates[0]?.id || null;
        }

        // Simple fallback: return first valid candidate
        return candidates[0]?.id || null;
    }

    /**
     * Count total nodes in tree
     * @param {Object} node - Root node
     * @returns {number} Total node count
     */
    countNodes(node) {
        if (!node) return 0;

        let count = 1;
        if (node.children) {
            count += node.children.reduce((sum, child) => sum + this.countNodes(child), 0);
        }
        if (node.parents) {
            count += node.parents.reduce((sum, parent) => sum + this.countNodes(parent), 0);
        }

        return count;
    }

    /**
     * Convert tree to D3.js hierarchy format
     * @param {Object} treeData - Tree data from buildTree
     * @returns {Object} D3 compatible hierarchy
     */
    toD3Hierarchy(treeData) {
        return {
            ...treeData.root,
            _metadata: treeData.metadata
        };
    }

    /**
     * Get all individuals at a specific generation level
     * @param {Object} rootNode - Root node of tree
     * @param {number} targetGeneration - Target generation level
     * @returns {Array} Array of individuals at that generation
     */
    getGenerationMembers(rootNode, targetGeneration) {
        const members = [];

        function traverse(node) {
            if (node.generation === targetGeneration) {
                members.push(node);
            }

            if (node.children) {
                node.children.forEach(traverse);
            }
            if (node.parents) {
                node.parents.forEach(traverse);
            }
        }

        traverse(rootNode);
        return members;
    }
}

// Export for use in Chrome extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreeBuilder;
} else if (typeof window !== 'undefined') {
    window.TreeBuilder = TreeBuilder;
}
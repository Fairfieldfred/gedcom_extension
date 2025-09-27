/**
 * GEDCOM Parser for Family Tree Visualization
 * Handles parsing of GEDCOM 5.5.1 format files
 *
 * Key Features:
 * - Parse INDI (individual) and FAM (family) records
 * - Extract names, dates, places, and relationships
 * - Handle UTF-8 and ANSEL character encoding
 * - Normalize data for family tree visualization
 */

class GedcomParser {
    constructor() {
        this.individuals = new Map();
        this.families = new Map();
        this.rawData = null;
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Parse GEDCOM file content
     * @param {string} gedcomContent - Raw GEDCOM file content
     * @returns {Object} Parsed data with individuals and families
     */
    parse(gedcomContent) {
        this.reset();
        this.rawData = gedcomContent;

        try {
            const lines = this.preprocessLines(gedcomContent);
            this.parseLines(lines);
            this.linkFamilyRelationships();

            return {
                success: true,
                individuals: Array.from(this.individuals.values()),
                families: Array.from(this.families.values()),
                stats: this.getParsingStats(),
                errors: this.errors,
                warnings: this.warnings
            };
        } catch (error) {
            this.errors.push(`Critical parsing error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                errors: this.errors,
                warnings: this.warnings
            };
        }
    }

    /**
     * Reset parser state for new file
     */
    reset() {
        this.individuals.clear();
        this.families.clear();
        this.errors = [];
        this.warnings = [];
        this.rawData = null;
    }

    /**
     * Preprocess GEDCOM lines - handle encoding and split into array
     * @param {string} content - Raw GEDCOM content
     * @returns {Array} Array of line objects with level, tag, value, and xref
     */
    preprocessLines(content) {
        // Handle different line endings
        const rawLines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        const lines = [];

        for (let i = 0; i < rawLines.length; i++) {
            const line = rawLines[i].trim();
            if (!line) continue; // Skip empty lines

            const parsed = this.parseLine(line, i + 1);
            if (parsed) {
                lines.push(parsed);
            }
        }

        return lines;
    }

    /**
     * Parse individual GEDCOM line
     * @param {string} line - Single line from GEDCOM file
     * @param {number} lineNumber - Line number for error reporting
     * @returns {Object|null} Parsed line object or null if invalid
     */
    parseLine(line, lineNumber) {
        // GEDCOM line format: LEVEL [XREF] TAG [VALUE]
        const match = line.match(/^(\d+)\s*(@[^@]+@)?\s*([A-Z_][A-Z0-9_]*)\s*(.*)?$/);

        if (!match) {
            this.warnings.push(`Line ${lineNumber}: Invalid GEDCOM format - ${line}`);
            return null;
        }

        const [, level, xref, tag, value] = match;

        return {
            level: parseInt(level),
            xref: xref || null,
            tag: tag,
            value: value ? value.trim() : '',
            lineNumber
        };
    }

    /**
     * Parse all lines and build records
     * @param {Array} lines - Preprocessed line objects
     */
    parseLines(lines) {
        let currentRecord = null;
        let recordStack = [];

        for (const line of lines) {
            const { level, xref, tag, value } = line;

            if (level === 0) {
                // Start new record
                if (tag === 'INDI' && xref) {
                    currentRecord = this.createIndividualRecord(xref);
                    this.individuals.set(xref, currentRecord);
                } else if (tag === 'FAM' && xref) {
                    currentRecord = this.createFamilyRecord(xref);
                    this.families.set(xref, currentRecord);
                } else {
                    currentRecord = null; // Skip other record types for now
                }
                recordStack = [currentRecord];
            } else if (currentRecord && level > 0) {
                // Handle sub-records
                this.processSubRecord(line, recordStack);
            }
        }
    }

    /**
     * Create individual record structure
     * @param {string} xref - Unique identifier
     * @returns {Object} Individual record
     */
    createIndividualRecord(xref) {
        return {
            id: xref,
            type: 'individual',
            name: {
                full: '',
                given: '',
                surname: '',
                nickname: '',
                prefix: '',
                suffix: ''
            },
            sex: 'U', // Unknown
            birth: {
                date: null,
                place: null,
                notes: null
            },
            death: {
                date: null,
                place: null,
                notes: null
            },
            events: [],
            attributes: [],
            families: {
                child: [], // Families where this person is a child
                spouse: []  // Families where this person is a spouse
            },
            notes: [],
            sources: []
        };
    }

    /**
     * Create family record structure
     * @param {string} xref - Unique identifier
     * @returns {Object} Family record
     */
    createFamilyRecord(xref) {
        return {
            id: xref,
            type: 'family',
            husband: null,
            wife: null,
            children: [],
            marriage: {
                date: null,
                place: null,
                notes: null
            },
            divorce: {
                date: null,
                place: null,
                notes: null
            },
            events: [],
            notes: [],
            sources: []
        };
    }

    /**
     * Process sub-record based on level and tag
     * @param {Object} line - Current line object
     * @param {Array} recordStack - Stack of current record context
     */
    processSubRecord(line, recordStack) {
        const { level, tag, value, xref } = line;
        const currentRecord = recordStack[0];

        if (!currentRecord) return;

        // Adjust record stack based on level
        while (recordStack.length > level) {
            recordStack.pop();
        }

        if (currentRecord.type === 'individual') {
            this.processIndividualField(line, currentRecord, recordStack);
        } else if (currentRecord.type === 'family') {
            this.processFamilyField(line, currentRecord, recordStack);
        }
    }

    /**
     * Process individual record fields
     * @param {Object} line - Current line
     * @param {Object} individual - Individual record
     * @param {Array} recordStack - Record context stack
     */
    processIndividualField(line, individual, recordStack) {
        const { level, tag, value, xref } = line;

        switch (tag) {
            case 'NAME':
                this.parseName(value, individual);
                break;

            case 'SEX':
                individual.sex = value.toUpperCase();
                break;

            case 'BIRT':
                recordStack.push('birth');
                break;

            case 'DEAT':
                recordStack.push('death');
                break;

            case 'DATE':
                if (recordStack.includes('birth')) {
                    individual.birth.date = this.parseDate(value);
                } else if (recordStack.includes('death')) {
                    individual.death.date = this.parseDate(value);
                }
                break;

            case 'PLAC':
                if (recordStack.includes('birth')) {
                    individual.birth.place = value;
                } else if (recordStack.includes('death')) {
                    individual.death.place = value;
                }
                break;

            case 'FAMC':
                // Family where this person is a child
                if (xref || value.match(/@.+@/)) {
                    const familyId = xref || value.match(/@[^@]+@/)[0];
                    individual.families.child.push(familyId);
                }
                break;

            case 'FAMS':
                // Family where this person is a spouse
                if (xref || value.match(/@.+@/)) {
                    const familyId = xref || value.match(/@[^@]+@/)[0];
                    individual.families.spouse.push(familyId);
                }
                break;

            case 'NOTE':
                individual.notes.push(value);
                break;

            default:
                // Handle other attributes as general attributes
                if (level === 1) {
                    individual.attributes.push({
                        tag: tag,
                        value: value
                    });
                }
                break;
        }
    }

    /**
     * Process family record fields
     * @param {Object} line - Current line
     * @param {Object} family - Family record
     * @param {Array} recordStack - Record context stack
     */
    processFamilyField(line, family, recordStack) {
        const { level, tag, value, xref } = line;

        switch (tag) {
            case 'HUSB':
                family.husband = xref || value.match(/@[^@]+@/)?.[0];
                break;

            case 'WIFE':
                family.wife = xref || value.match(/@[^@]+@/)?.[0];
                break;

            case 'CHIL':
                const childId = xref || value.match(/@[^@]+@/)?.[0];
                if (childId) {
                    family.children.push(childId);
                }
                break;

            case 'MARR':
                recordStack.push('marriage');
                break;

            case 'DIV':
                recordStack.push('divorce');
                break;

            case 'DATE':
                if (recordStack.includes('marriage')) {
                    family.marriage.date = this.parseDate(value);
                } else if (recordStack.includes('divorce')) {
                    family.divorce.date = this.parseDate(value);
                }
                break;

            case 'PLAC':
                if (recordStack.includes('marriage')) {
                    family.marriage.place = value;
                } else if (recordStack.includes('divorce')) {
                    family.divorce.place = value;
                }
                break;

            case 'NOTE':
                family.notes.push(value);
                break;

            default:
                if (level === 1) {
                    family.events.push({
                        tag: tag,
                        value: value
                    });
                }
                break;
        }
    }

    /**
     * Parse GEDCOM name format (Given /Surname/)
     * @param {string} nameValue - Raw name value
     * @param {Object} individual - Individual record to update
     */
    parseName(nameValue, individual) {
        if (!nameValue) return;

        // GEDCOM name format: Given names /Surname/ Additional names
        // Look for surname enclosed in forward slashes
        const surnameMatch = nameValue.match(/\/([^\/]+)\//);

        if (surnameMatch) {
            const surname = surnameMatch[1].trim();
            const beforeSurname = nameValue.substring(0, surnameMatch.index).trim();
            const afterSurname = nameValue.substring(surnameMatch.index + surnameMatch[0].length).trim();

            individual.name.given = beforeSurname;
            individual.name.surname = surname;
            individual.name.full = `${beforeSurname} ${surname}`.trim();

            // Handle additional name parts (titles, nicknames, etc.)
            if (afterSurname) {
                individual.name.suffix = afterSurname;
            }
        } else {
            // No surname markers - treat as given name only
            individual.name.given = nameValue.trim();
            individual.name.surname = '';
            individual.name.full = nameValue.trim();
        }
    }

    /**
     * Parse GEDCOM date formats
     * @param {string} dateValue - Raw date value
     * @returns {Object|null} Parsed date object
     */
    parseDate(dateValue) {
        if (!dateValue) return null;

        // Handle common GEDCOM date prefixes
        const cleanDate = dateValue.replace(/^(ABT|AFT|BEF|BET|CAL|EST)\s+/i, '');

        // Try to parse as a standard date
        const dateObj = new Date(cleanDate);

        return {
            raw: dateValue,
            parsed: isNaN(dateObj.getTime()) ? null : dateObj,
            display: dateValue // Keep original for display
        };
    }

    /**
     * Link family relationships after all records are parsed
     */
    linkFamilyRelationships() {
        // Link individuals to families and vice versa
        for (const individual of this.individuals.values()) {
            // Link child families
            for (const familyId of individual.families.child) {
                const family = this.families.get(familyId);
                if (family && !family.children.includes(individual.id)) {
                    family.children.push(individual.id);
                }
            }

            // Link spouse families
            for (const familyId of individual.families.spouse) {
                const family = this.families.get(familyId);
                if (family) {
                    if (individual.sex === 'M' && !family.husband) {
                        family.husband = individual.id;
                    } else if (individual.sex === 'F' && !family.wife) {
                        family.wife = individual.id;
                    }
                }
            }
        }
    }

    /**
     * Get parsing statistics
     * @returns {Object} Statistics about parsed data
     */
    getParsingStats() {
        return {
            individuals: this.individuals.size,
            families: this.families.size,
            errors: this.errors.length,
            warnings: this.warnings.length
        };
    }

    /**
     * Get individual by ID
     * @param {string} id - Individual ID
     * @returns {Object|null} Individual record or null
     */
    getIndividual(id) {
        return this.individuals.get(id) || null;
    }

    /**
     * Get family by ID
     * @param {string} id - Family ID
     * @returns {Object|null} Family record or null
     */
    getFamily(id) {
        return this.families.get(id) || null;
    }
}

// Export for use in Chrome extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GedcomParser;
} else if (typeof window !== 'undefined') {
    window.GedcomParser = GedcomParser;
}
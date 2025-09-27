/**
 * Test Data and Parser Testing for GEDCOM Parser
 * Contains sample GEDCOM data and test functions
 */

class GedcomTester {
    constructor() {
        this.parser = new GedcomParser();
        this.treeBuilder = new TreeBuilder();
    }

    /**
     * Sample GEDCOM data for testing
     */
    getSampleGedcomData() {
        return `0 HEAD
1 SOUR Test Family Tree
2 VERS 1.0
1 DEST GEDCOM
1 DATE 25 SEP 2025
1 CHAR UTF-8
1 GEDC
2 VERS 5.5.1

0 @I1@ INDI
1 NAME John /Smith/
1 SEX M
1 BIRT
2 DATE 1 JAN 1950
2 PLAC New York, NY, USA
1 FAMS @F1@
1 FAMC @F2@

0 @I2@ INDI
1 NAME Mary /Johnson/
1 SEX F
1 BIRT
2 DATE 15 FEB 1952
2 PLAC Boston, MA, USA
1 FAMS @F1@

0 @I3@ INDI
1 NAME Robert /Smith/
1 SEX M
1 BIRT
2 DATE 10 JUN 1975
2 PLAC New York, NY, USA
1 FAMC @F1@

0 @I4@ INDI
1 NAME Sarah /Smith/
1 SEX F
1 BIRT
2 DATE 20 AUG 1978
2 PLAC New York, NY, USA
1 FAMC @F1@

0 @I5@ INDI
1 NAME William /Smith/
1 SEX M
1 BIRT
2 DATE 5 MAR 1920
2 PLAC Chicago, IL, USA
1 DEAT
2 DATE 12 DEC 1995
2 PLAC New York, NY, USA
1 FAMS @F2@

0 @I6@ INDI
1 NAME Elizabeth /Brown/
1 SEX F
1 BIRT
2 DATE 8 JUL 1922
2 PLAC Philadelphia, PA, USA
1 DEAT
2 DATE 30 NOV 2010
2 PLAC New York, NY, USA
1 FAMS @F2@

0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
1 CHIL @I4@
1 MARR
2 DATE 14 JUN 1974
2 PLAC New York, NY, USA

0 @F2@ FAM
1 HUSB @I5@
1 WIFE @I6@
1 CHIL @I1@
1 MARR
2 DATE 22 MAY 1949
2 PLAC New York, NY, USA

0 TRLR`;
    }

    /**
     * Run comprehensive tests on the parser
     * @returns {Object} Test results
     */
    runTests() {
        const results = {
            passed: 0,
            failed: 0,
            tests: []
        };

        try {
            // Test 1: Basic parsing
            this.testBasicParsing(results);

            // Test 2: Individual parsing
            this.testIndividualParsing(results);

            // Test 3: Family parsing
            this.testFamilyParsing(results);

            // Test 4: Relationship linking
            this.testRelationshipLinking(results);

            // Test 5: Tree building
            this.testTreeBuilding(results);

            // Test 6: Edge cases
            this.testEdgeCases(results);

        } catch (error) {
            this.addTestResult(results, 'Critical Error', false, `Unexpected error: ${error.message}`);
        }

        return results;
    }

    testBasicParsing(results) {
        const gedcom = this.getSampleGedcomData();
        const parseResult = this.parser.parse(gedcom);

        this.addTestResult(
            results,
            'Basic Parsing - Success',
            parseResult.success === true,
            `Expected success, got: ${parseResult.success}`
        );

        this.addTestResult(
            results,
            'Basic Parsing - Individuals Count',
            parseResult.individuals && parseResult.individuals.length === 6,
            `Expected 6 individuals, got: ${parseResult.individuals?.length || 0}`
        );

        this.addTestResult(
            results,
            'Basic Parsing - Families Count',
            parseResult.families && parseResult.families.length === 2,
            `Expected 2 families, got: ${parseResult.families?.length || 0}`
        );
    }

    testIndividualParsing(results) {
        const gedcom = this.getSampleGedcomData();
        const parseResult = this.parser.parse(gedcom);

        if (parseResult.success && parseResult.individuals.length > 0) {
            const john = parseResult.individuals.find(p => p.id === '@I1@');

            this.addTestResult(
                results,
                'Individual - Name Parsing',
                john && john.name.given === 'John' && john.name.surname === 'Smith',
                `Expected 'John Smith', got: '${john?.name.given || ''} ${john?.name.surname || ''}'`
            );

            this.addTestResult(
                results,
                'Individual - Sex Parsing',
                john && john.sex === 'M',
                `Expected 'M', got: '${john?.sex || ''}'`
            );

            this.addTestResult(
                results,
                'Individual - Birth Date',
                john && john.birth.date && john.birth.date.display === '1 JAN 1950',
                `Expected '1 JAN 1950', got: '${john?.birth.date?.display || 'none'}'`
            );

            this.addTestResult(
                results,
                'Individual - Birth Place',
                john && john.birth.place === 'New York, NY, USA',
                `Expected 'New York, NY, USA', got: '${john?.birth.place || 'none'}'`
            );
        }
    }

    testFamilyParsing(results) {
        const gedcom = this.getSampleGedcomData();
        const parseResult = this.parser.parse(gedcom);

        if (parseResult.success && parseResult.families.length > 0) {
            const family1 = parseResult.families.find(f => f.id === '@F1@');

            this.addTestResult(
                results,
                'Family - Husband Reference',
                family1 && family1.husband === '@I1@',
                `Expected '@I1@', got: '${family1?.husband || 'none'}'`
            );

            this.addTestResult(
                results,
                'Family - Wife Reference',
                family1 && family1.wife === '@I2@',
                `Expected '@I2@', got: '${family1?.wife || 'none'}'`
            );

            this.addTestResult(
                results,
                'Family - Children Count',
                family1 && family1.children.length === 2,
                `Expected 2 children, got: ${family1?.children.length || 0}`
            );

            this.addTestResult(
                results,
                'Family - Marriage Date',
                family1 && family1.marriage.date && family1.marriage.date.display === '14 JUN 1974',
                `Expected '14 JUN 1974', got: '${family1?.marriage.date?.display || 'none'}'`
            );
        }
    }

    testRelationshipLinking(results) {
        const gedcom = this.getSampleGedcomData();
        const parseResult = this.parser.parse(gedcom);

        if (parseResult.success) {
            const john = parseResult.individuals.find(p => p.id === '@I1@');

            this.addTestResult(
                results,
                'Relationship - Child Family Link',
                john && john.families.child.includes('@F2@'),
                `Expected '@F2@' in child families, got: ${john?.families.child.join(', ') || 'none'}`
            );

            this.addTestResult(
                results,
                'Relationship - Spouse Family Link',
                john && john.families.spouse.includes('@F1@'),
                `Expected '@F1@' in spouse families, got: ${john?.families.spouse.join(', ') || 'none'}`
            );
        }
    }

    testTreeBuilding(results) {
        const gedcom = this.getSampleGedcomData();
        const parseResult = this.parser.parse(gedcom);

        if (parseResult.success) {
            this.treeBuilder.initialize(parseResult.individuals, parseResult.families);

            try {
                // Test ancestor tree
                const ancestorTree = this.treeBuilder.buildTree('@I1@', {
                    treeType: 'ancestors',
                    maxGenerations: 3
                });

                this.addTestResult(
                    results,
                    'Tree Building - Ancestor Tree Created',
                    ancestorTree && ancestorTree.root,
                    `Expected tree object, got: ${typeof ancestorTree}`
                );

                this.addTestResult(
                    results,
                    'Tree Building - Root Person Correct',
                    ancestorTree.root && ancestorTree.root.id === '@I1@',
                    `Expected '@I1@', got: '${ancestorTree.root?.id || 'none'}'`
                );

                // Test descendant tree
                const descendantTree = this.treeBuilder.buildTree('@I1@', {
                    treeType: 'descendants',
                    maxGenerations: 3
                });

                this.addTestResult(
                    results,
                    'Tree Building - Descendant Tree Created',
                    descendantTree && descendantTree.root && descendantTree.root.children,
                    `Expected children array, got: ${typeof descendantTree.root?.children}`
                );

            } catch (error) {
                this.addTestResult(results, 'Tree Building - Error', false, error.message);
            }
        }
    }

    testEdgeCases(results) {
        // Test empty GEDCOM
        const emptyResult = this.parser.parse('');
        this.addTestResult(
            results,
            'Edge Case - Empty GEDCOM',
            !emptyResult.success,
            `Expected failure for empty input, got success: ${emptyResult.success}`
        );

        // Test malformed GEDCOM
        const malformedResult = this.parser.parse('invalid gedcom data\nno proper format');
        this.addTestResult(
            results,
            'Edge Case - Malformed GEDCOM',
            malformedResult.warnings && malformedResult.warnings.length > 0,
            `Expected warnings for malformed data, got: ${malformedResult.warnings?.length || 0} warnings`
        );

        // Test missing person reference
        try {
            this.treeBuilder.initialize([], []);
            const missingPersonTree = this.treeBuilder.buildTree('@INVALID@');
            this.addTestResult(results, 'Edge Case - Missing Person', false, 'Expected error for missing person');
        } catch (error) {
            this.addTestResult(
                results,
                'Edge Case - Missing Person Error Handling',
                error.message.includes('not found'),
                `Expected 'not found' error, got: ${error.message}`
            );
        }
    }

    addTestResult(results, testName, passed, message) {
        results.tests.push({
            name: testName,
            passed: passed,
            message: message
        });

        if (passed) {
            results.passed++;
        } else {
            results.failed++;
        }
    }

    /**
     * Generate test report HTML
     * @param {Object} results - Test results from runTests()
     * @returns {string} HTML test report
     */
    generateTestReport(results) {
        const passRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);

        let html = `
        <div class="test-report">
            <h2>GEDCOM Parser Test Results</h2>
            <div class="summary">
                <p><strong>Total Tests:</strong> ${results.passed + results.failed}</p>
                <p><strong>Passed:</strong> ${results.passed}</p>
                <p><strong>Failed:</strong> ${results.failed}</p>
                <p><strong>Pass Rate:</strong> ${passRate}%</p>
            </div>
            <div class="test-details">
        `;

        results.tests.forEach(test => {
            const status = test.passed ? '✅' : '❌';
            const className = test.passed ? 'passed' : 'failed';

            html += `
                <div class="test-result ${className}">
                    <span class="status">${status}</span>
                    <strong>${test.name}</strong>
                    <p>${test.message}</p>
                </div>
            `;
        });

        html += `
            </div>
        </div>
        <style>
            .test-report { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; }
            .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .test-result { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
            .test-result.passed { border-left-color: #28a745; background: #f8fff8; }
            .test-result.failed { border-left-color: #dc3545; background: #fff8f8; }
            .status { font-size: 18px; margin-right: 10px; }
        </style>
        `;

        return html;
    }
}

// Export for use in Chrome extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GedcomTester;
} else if (typeof window !== 'undefined') {
    window.GedcomTester = GedcomTester;
}
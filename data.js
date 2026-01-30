// Mock Lab Test Data
// This structure is designed to be easily replaced with API calls

// Common ICD-10 codes with descriptions (can be replaced with API)
const ICD10_LIST = [
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
    { code: 'I10', description: 'Essential (primary) hypertension' },
    { code: 'E78.00', description: 'Pure hypercholesterolemia, unspecified' },
    { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
    { code: 'M54.5', description: 'Low back pain' },
    { code: 'R51', description: 'Headache' },
    { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis' },
    { code: 'E66.9', description: 'Obesity, unspecified' },
    { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified' },
    { code: 'G47.33', description: 'Obstructive sleep apnea' },
    { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia' },
    { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings' }
];

const ICD10_SUGGESTIONS = ICD10_LIST.map(item => item.code);

function getIcd10Suggestions(query) {
    if (!query || typeof query !== 'string') {
        return ICD10_SUGGESTIONS.slice(0, 10);
    }
    const q = query.trim().toLowerCase();
    if (q === '') return ICD10_SUGGESTIONS.slice(0, 10);
    return ICD10_SUGGESTIONS.filter(code => code.toLowerCase().startsWith(q) || code.toLowerCase().includes(q)).slice(0, 10);
}

function getIcd10Description(code) {
    if (!code || typeof code !== 'string') return '';
    const trimmed = code.trim();
    const found = ICD10_LIST.find(item => item.code === trimmed);
    return found ? found.description : '';
}

const LAB_TESTS = [
    {
        id: 'cbc-001',
        name: 'CBC with Differential',
        cptCode: '85025',
        aliases: ['CBC', 'Complete Blood Count', 'Blood Count', 'CBC Diff'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Hematology',
        isFavorite: true,
        isPanel: false,
        panelTests: [],
        estimatedCost: 45.00
    },
    {
        id: 'bmp-001',
        name: 'Basic Metabolic Panel',
        cptCode: '80048',
        aliases: ['BMP', 'Basic Panel', 'Metabolic Panel'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Chemistry',
        isFavorite: true,
        isPanel: false,
        panelTests: [],
        estimatedCost: 35.00
    },
    {
        id: 'cmp-001',
        name: 'Comprehensive Metabolic Panel',
        cptCode: '80053',
        aliases: ['CMP', 'Comp', 'Comprehensive Panel', 'Metabolic Comprehensive'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Chemistry',
        isFavorite: true,
        isPanel: false,
        panelTests: [],
        estimatedCost: 55.00
    },
    {
        id: 'tsh-001',
        name: 'TSH (Thyroid Stimulating Hormone)',
        cptCode: '84443',
        aliases: ['TSH', 'Thyroid', 'Thyroid Stimulating'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Endocrinology',
        isFavorite: true,
        isPanel: false,
        panelTests: [],
        estimatedCost: 42.00
    },
    {
        id: 'lipid-001',
        name: 'Lipid Panel',
        cptCode: '80061',
        aliases: ['Lipid', 'Cholesterol', 'Lipid Profile', 'Cholesterol Panel'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Chemistry',
        isFavorite: true,
        isPanel: false,
        panelTests: [],
        estimatedCost: 38.00
    },
    {
        id: 'glucose-001',
        name: 'Glucose, Fasting',
        cptCode: '82947',
        aliases: ['Glucose', 'Sugar', 'Blood Sugar', 'Fasting Glucose', 'FBS'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Chemistry',
        isFavorite: true,
        isPanel: false,
        panelTests: [],
        estimatedCost: 25.00
    },
    {
        id: 'hba1c-001',
        name: 'Hemoglobin A1c',
        cptCode: '83036',
        aliases: ['A1c', 'HbA1c', 'Hemoglobin A1c', 'Glycohemoglobin'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Chemistry',
        isFavorite: true,
        isPanel: false,
        panelTests: [],
        estimatedCost: 48.00
    },
    {
        id: 'wound-culture-001',
        name: 'Wound Culture',
        cptCode: '87040',
        aliases: ['Wound Culture', 'Wound', 'Culture Wound'],
        requiresSpecimen: true,
        specimenOptions: ['Wound', 'Abscess', 'Ulcer', 'Surgical Site'],
        category: 'Microbiology',
        isFavorite: true,
        isPanel: false,
        panelTests: [],
        estimatedCost: 65.00
    },
    {
        id: 'urine-culture-001',
        name: 'Urine Culture',
        cptCode: '87040',
        aliases: ['Urine Culture', 'U/A Culture', 'Urine C&S'],
        requiresSpecimen: true,
        specimenOptions: ['Clean Catch', 'Catheter', 'Suprapubic'],
        category: 'Microbiology',
        isFavorite: false,
        isPanel: false,
        panelTests: [],
        estimatedCost: 55.00
    },
    {
        id: 'blood-culture-001',
        name: 'Blood Culture',
        cptCode: '87040',
        aliases: ['Blood Culture', 'BCx', 'Blood C&S'],
        requiresSpecimen: true,
        specimenOptions: ['Peripheral', 'Central Line', 'Arterial'],
        category: 'Microbiology',
        isFavorite: false,
        isPanel: false,
        panelTests: [],
        estimatedCost: 75.00
    },
    {
        id: 'liver-panel-001',
        name: 'Hepatic Function Panel',
        cptCode: '80076',
        aliases: ['Liver Panel', 'LFT', 'Liver Function', 'Hepatic Panel'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Chemistry',
        isFavorite: false,
        isPanel: false,
        panelTests: [],
        estimatedCost: 52.00
    },
    {
        id: 'coagulation-001',
        name: 'Coagulation Panel',
        cptCode: '85730',
        aliases: ['Coag Panel', 'Coagulation', 'PT/PTT', 'Clotting Panel'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Hematology',
        isFavorite: false,
        isPanel: false,
        panelTests: [],
        estimatedCost: 58.00
    },
    {
        id: 'cardiac-panel-001',
        name: 'Cardiac Panel',
        cptCode: '80069',
        aliases: ['Cardiac', 'Cardiac Panel', 'Troponin', 'Cardiac Enzymes'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Chemistry',
        isFavorite: false,
        isPanel: true,
        panelTests: ['Troponin I', 'CK-MB', 'BNP'],
        estimatedCost: 125.00
    },
    {
        id: 'diabetes-panel-001',
        name: 'Diabetes Panel',
        cptCode: '80047',
        aliases: ['Diabetes Panel', 'DM Panel', 'Diabetic Panel'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Endocrinology',
        isFavorite: false,
        isPanel: true,
        panelTests: ['Glucose', 'HbA1c', 'C-Peptide'],
        estimatedCost: 95.00
    },
    {
        id: 'thyroid-panel-001',
        name: 'Thyroid Function Panel',
        cptCode: '80074',
        aliases: ['Thyroid Panel', 'Thyroid Function', 'TFT'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Endocrinology',
        isFavorite: false,
        isPanel: true,
        panelTests: ['TSH', 'Free T4', 'Free T3'],
        estimatedCost: 88.00
    },
    {
        id: 'vitamin-d-001',
        name: 'Vitamin D, 25-Hydroxy',
        cptCode: '82306',
        aliases: ['Vitamin D', 'Vit D', '25-OH Vitamin D'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Chemistry',
        isFavorite: false,
        isPanel: false,
        panelTests: [],
        estimatedCost: 65.00
    },
    {
        id: 'b12-001',
        name: 'Vitamin B12',
        cptCode: '82607',
        aliases: ['B12', 'Vitamin B12', 'Cobalamin'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Chemistry',
        isFavorite: false,
        isPanel: false,
        panelTests: [],
        estimatedCost: 45.00
    },
    {
        id: 'ferritin-001',
        name: 'Ferritin',
        cptCode: '82728',
        aliases: ['Ferritin', 'Iron Storage'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Chemistry',
        isFavorite: false,
        isPanel: false,
        panelTests: [],
        estimatedCost: 38.00
    },
    {
        id: 'psa-001',
        name: 'PSA (Prostate Specific Antigen)',
        cptCode: '84153',
        aliases: ['PSA', 'Prostate', 'Prostate Antigen'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Oncology',
        isFavorite: false,
        isPanel: false,
        panelTests: [],
        estimatedCost: 55.00
    },
    {
        id: 'cbc-panel-001',
        name: 'Complete Blood Count Panel',
        cptCode: '85027',
        aliases: ['CBC Panel', 'Full CBC'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Hematology',
        isFavorite: false,
        isPanel: true,
        panelTests: ['CBC', 'Differential', 'Platelet Count'],
        estimatedCost: 65.00
    },
    {
        id: 'urinalysis-001',
        name: 'Urinalysis with Microscopy',
        cptCode: '81001',
        aliases: ['UA', 'Urinalysis', 'Urine Analysis', 'UA with Micro'],
        requiresSpecimen: true,
        specimenOptions: ['Clean Catch', 'Catheter', 'Random'],
        category: 'Chemistry',
        isFavorite: true,
        isPanel: false,
        panelTests: [],
        estimatedCost: 28.00
    },
    {
        id: 'thyroxine-free-001',
        name: 'Thyroxine Free',
        cptCode: '84439',
        aliases: ['Free T4', 'FT4', 'T4 Free', 'Free Thyroxine'],
        requiresSpecimen: false,
        specimenOptions: [],
        category: 'Endocrinology',
        isFavorite: true,
        isPanel: false,
        panelTests: [],
        estimatedCost: 45.00
    }
];

// Mock recent orders (last 5 tests ordered)
const RECENT_ORDERS = [
    'cbc-001',
    'cmp-001',
    'tsh-001',
    'lipid-001',
    'glucose-001'
];

// Pick Lists (saved bundles of tests)
let PICK_LISTS = [];

// Function to get pick lists (ready for API replacement)
function getPickLists() {
    // Load from localStorage
    try {
        const saved = localStorage.getItem('pickLists');
        if (saved) {
            PICK_LISTS = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Could not load pick lists from localStorage:', e);
    }
    return PICK_LISTS;
}

// Function to save pick list
function savePickList(name, testIds) {
    const pickList = {
        id: `picklist-${Date.now()}-${Math.random()}`,
        name: name,
        testIds: testIds,
        createdAt: new Date().toISOString()
    };

    PICK_LISTS.push(pickList);

    // Save to localStorage
    try {
        localStorage.setItem('pickLists', JSON.stringify(PICK_LISTS));
    } catch (e) {
        console.warn('Could not save pick list to localStorage:', e);
    }

    return pickList;
}

// Function to delete pick list
function deletePickList(pickListId) {
    PICK_LISTS = PICK_LISTS.filter(list => list.id !== pickListId);

    // Save to localStorage
    try {
        localStorage.setItem('pickLists', JSON.stringify(PICK_LISTS));
    } catch (e) {
        console.warn('Could not save pick lists to localStorage:', e);
    }
}

// Function to search tests (ready for API replacement)
function searchTests(query) {
    if (!query || query.trim() === '') {
        return [];
    }

    const lowerQuery = query.toLowerCase().trim();

    return LAB_TESTS.filter(test => {
        // Search in name
        if (test.name.toLowerCase().includes(lowerQuery)) {
            return true;
        }

        // Search in CPT code
        if (test.cptCode.includes(lowerQuery)) {
            return true;
        }

        // Search in aliases
        if (test.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))) {
            return true;
        }

        return false;
    }).slice(0, 10); // Limit to 10 results
}

// Function to get test by ID (ready for API replacement)
function getTestById(id) {
    return LAB_TESTS.find(test => test.id === id);
}

// Function to get favorites (ready for API replacement)
function getFavorites() {
    return LAB_TESTS.filter(test => test.isFavorite);
}

// Function to get specialty panels (ready for API replacement)
function getSpecialtyPanels() {
    return LAB_TESTS.filter(test => test.isPanel);
}

// Function to get recent orders (ready for API replacement)
function getRecentOrders() {
    return RECENT_ORDERS.map(id => getTestById(id)).filter(Boolean);
}

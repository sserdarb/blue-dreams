const fs = require('fs');
const path = require('path');

const CATEGORIES = [
    'Sales', 'Events', 'F&B', 'Rooms', 'Spa', 'City Guide', 'Reviews', 'Tips', 'Holidays', 'Announcements'
];

const PALETTES = [
    { name: 'Ocean', bg: '#f0f9ff', primary: '#0ea5e9', secondary: '#0369a1', text: '#0c4a6e' },
    { name: 'Sunset', bg: '#fff7ed', primary: '#f97316', secondary: '#c2410c', text: '#431407' },
    { name: 'Luxury', bg: '#1c1917', primary: '#d6d3d1', secondary: '#a8a29e', text: '#e7e5e4' },
    { name: 'Nature', bg: '#f0fdf4', primary: '#22c55e', secondary: '#15803d', text: '#14532d' },
    { name: 'Berry', bg: '#fdf2f8', primary: '#db2777', secondary: '#be185d', text: '#831843' },
    { name: 'Corporate', bg: '#f8fafc', primary: '#0f172a', secondary: '#334155', text: '#1e293b' },
    { name: 'Gold', bg: '#1a1a1a', primary: '#ffd700', secondary: '#b8860b', text: '#ffffff' },
    { name: 'Minimal', bg: '#ffffff', primary: '#000000', secondary: '#333333', text: '#000000' }
];

const FONTS = ['Inter', 'Playfair Display', 'Roboto', 'Montserrat', 'Lato', 'Open Sans'];

const TEMPLATES = [];

let idCounter = 1;

function genId() {
    return `tpl_${String(idCounter++).padStart(3, '0')}`;
}

// Helper to create a basic layer
function createLayer(type, props) {
    return {
        id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        visible: true,
        locked: false,
        opacity: 100,
        ...props
    };
}

// Generators for specific categories
function generateSalesTemplate(i) {
    const palette = PALETTES[i % PALETTES.length];
    return {
        id: genId(),
        name: `Satış Kampanyası #${i + 1}`,
        category: 'Sales',
        preview: '',
        layers: [
            createLayer('shape', { x: 0, y: 0, width: 1080, height: 1080, data: { fill: palette.bg } }),
            createLayer('text', { x: 100, y: 150, width: 800, height: 200, data: { text: 'FLASH SALE', fontSize: 120, fontFamily: 'Playfair Display', color: palette.primary, fontWeight: 'bold' } }),
            createLayer('text', { x: 100, y: 300, width: 800, height: 300, data: { text: '%50 OFF', fontSize: 250, fontFamily: 'Inter', color: palette.secondary, fontWeight: '900' } }),
            createLayer('shape', { x: 80, y: 800, width: 400, height: 80, data: { fill: palette.primary } }),
            createLayer('text', { x: 100, y: 815, width: 300, height: 50, data: { text: 'BOOK NOW', fontSize: 40, fontFamily: 'Inter', color: '#ffffff' } })
        ]
    };
}

function generateEventTemplate(i) {
    const palette = PALETTES[(i + 2) % PALETTES.length];
    return {
        id: genId(),
        name: `Etkinlik Duyurusu #${i + 1}`,
        category: 'Events',
        preview: '',
        layers: [
            createLayer('shape', { x: 0, y: 0, width: 1080, height: 1080, data: { fill: palette.bg } }),
            createLayer('shape', { x: 50, y: 50, width: 980, height: 980, data: { stroke: palette.primary, fill: 'transparent' } }),
            createLayer('text', { x: 200, y: 200, width: 600, height: 100, data: { text: 'LIVE MUSIC', fontSize: 100, fontFamily: 'Roboto', color: palette.text } }),
            createLayer('text', { x: 300, y: 400, width: 400, height: 60, data: { text: 'Every Friday', fontSize: 60, fontFamily: 'Inter', color: palette.secondary } }),
            createLayer('text', { x: 250, y: 900, width: 500, height: 50, data: { text: '@ Blue Dreams Bar', fontSize: 40, fontFamily: 'inter', color: palette.text } })
        ]
    };
}

function generateFnBTemplate(i) {
    const palette = PALETTES[(i + 4) % PALETTES.length];
    return {
        id: genId(),
        name: `Lezzet Durağı #${i + 1}`,
        category: 'F&B',
        preview: '',
        layers: [
            createLayer('shape', { x: 0, y: 0, width: 1080, height: 1080, data: { fill: '#1a1a1a' } }),
            createLayer('text', { x: 100, y: 100, width: 800, height: 150, data: { text: 'TASTE OF', fontSize: 100, fontFamily: 'Playfair Display', color: '#ffffff' } }),
            createLayer('text', { x: 100, y: 220, width: 800, height: 150, data: { text: 'PARADISE', fontSize: 100, fontFamily: 'Playfair Display', color: palette.primary, fontWeight: 'bold' } }),
            createLayer('shape', { x: 0, y: 600, width: 1080, height: 480, data: { fill: '#2a2a2a' }, name: 'Image Placeholder' }),
            createLayer('text', { x: 50, y: 950, width: 400, height: 40, data: { text: 'New Menu Available', fontSize: 40, fontFamily: 'Inter', color: '#cccccc' } })
        ]
    };
}

function generateRoomTemplate(i) {
    const palette = PALETTES[(i + 1) % PALETTES.length];
    return {
        id: genId(),
        name: `Oda Tanıtımı #${i + 1}`,
        category: 'Rooms',
        preview: '',
        layers: [
            createLayer('shape', { x: 0, y: 0, width: 1080, height: 1080, data: { fill: '#ffffff' } }),
            createLayer('shape', { x: 50, y: 50, width: 980, height: 600, data: { fill: '#eee' }, name: 'Room Image' }),
            createLayer('text', { x: 50, y: 700, width: 800, height: 80, data: { text: 'Deluxe Suite', fontSize: 80, fontFamily: 'Playfair Display', color: '#000000' } }),
            createLayer('text', { x: 50, y: 800, width: 900, height: 100, data: { text: 'Experience luxury like never before.', fontSize: 40, fontFamily: 'Inter', color: '#666666' } }),
            createLayer('shape', { x: 800, y: 900, width: 200, height: 80, data: { fill: '#000000' } }),
            createLayer('text', { x: 830, y: 920, width: 150, height: 40, data: { text: 'Book', fontSize: 40, fontFamily: 'Inter', color: '#ffffff' } })
        ]
    }
}

function generateQuoteTemplate(i) {
    const palette = PALETTES[(i + 3) % PALETTES.length];
    return {
        id: genId(),
        name: `Müşteri Yorumu #${i + 1}`,
        category: 'Reviews',
        preview: '',
        layers: [
            createLayer('shape', { x: 0, y: 0, width: 1080, height: 1080, data: { fill: palette.bg } }),
            createLayer('text', { x: 100, y: 200, width: 100, height: 100, data: { text: '"', fontSize: 200, fontFamily: 'Georgia', color: palette.primary } }),
            createLayer('text', { x: 100, y: 350, width: 880, height: 400, data: { text: 'Amazing stay! Viewing the sunset from the infinity pool was the highlight of our trip.', fontSize: 60, fontFamily: 'Inter', color: palette.text } }),
            createLayer('text', { x: 100, y: 800, width: 500, height: 50, data: { text: '- Sarah J.', fontSize: 40, fontFamily: 'Inter', color: palette.secondary, fontWeight: 'bold' } }),
            createLayer('shape', { x: 490, y: 900, width: 100, height: 20, data: { fill: palette.primary, shape: 'rect' } }) // decorative line
        ]
    }
}


// Generate 20 of each main type to reach 100
for (let i = 0; i < 20; i++) {
    TEMPLATES.push(generateSalesTemplate(i));
    TEMPLATES.push(generateEventTemplate(i));
    TEMPLATES.push(generateFnBTemplate(i));
    TEMPLATES.push(generateRoomTemplate(i));
    TEMPLATES.push(generateQuoteTemplate(i));
}

// Ensure directory exists
const targetDir = path.join(__dirname, 'app', '[locale]', 'admin', 'social', 'content');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Write to file
const targetFile = path.join(targetDir, 'templates.json');

fs.writeFileSync(targetFile, JSON.stringify(TEMPLATES, null, 4));

console.log(`Generated ${TEMPLATES.length} templates at ${targetFile}`);

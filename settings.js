const MAX_FILE_SIZE = 1024 * 1024;

function applyTierSettings(tiers, itemInput, addButton) {
    const tierSettings = [
        { tier: 'S', subtitle: document.getElementById('tier-s-subtitle').value, color: document.getElementById('tier-s-color').value },
        { tier: 'A', subtitle: document.getElementById('tier-a-subtitle').value, color: document.getElementById('tier-a-color').value },
        { tier: 'B', subtitle: document.getElementById('tier-b-subtitle').value, color: document.getElementById('tier-b-color').value },
        { tier: 'C', subtitle: document.getElementById('tier-c-subtitle').value, color: document.getElementById('tier-c-color').value },
        { tier: 'D', subtitle: document.getElementById('tier-d-subtitle').value, color: document.getElementById('tier-d-color').value },
        { tier: 'E', subtitle: document.getElementById('tier-e-subtitle').value, color: document.getElementById('tier-e-color').value }
    ];
    tierSettings.forEach(setting => {
        const tierRow = document.querySelector(`.tier-row[data-tier="${setting.tier}"]`);
        const tierSubtitle = document.querySelector(`.tier-subtitle[data-tier="${setting.tier}-subtitle"]`);
        tierSubtitle.textContent = setting.subtitle;
        tierRow.style.backgroundColor = setting.color;
    });
    saveTierSettings(tierSettings);
    tiers.forEach(t => t.classList.remove('selected'));
    selectedTier = null;
    itemInput.disabled = true;
    itemInput.placeholder = "Choose the tier firstly";
    addButton.disabled = true;
}

function saveTierSettings(tierSettings) {
    localStorage.setItem('tierSettings', JSON.stringify(tierSettings));
}

function loadTierSettings() {
    try {
        const savedSettings = JSON.parse(localStorage.getItem('tierSettings'));
        if (!savedSettings) {
            console.info('No saved settings found');
            return;
        }
        savedSettings.forEach(setting => {
            try {
                const tierRow = document.querySelector(`.tier-row[data-tier="${setting.tier}"]`);
                const tierSubtitle = document.querySelector(`.tier-subtitle[data-tier="${setting.tier}-subtitle"]`);
                const subtitleInput = document.getElementById(`tier-${setting.tier.toLowerCase()}-subtitle`);
                const colorInput = document.getElementById(`tier-${setting.tier.toLowerCase()}-color`);
                if (!tierRow || !tierSubtitle || !subtitleInput || !colorInput) {
                    console.error(`Missing elements for tier ${setting.tier}`);
                    return;
                }
                tierSubtitle.textContent = setting.subtitle;
                tierRow.style.backgroundColor = setting.color;
                subtitleInput.value = setting.subtitle;
                colorInput.value = setting.color;
            } catch (elementError) {
                console.error(`Error processing tier ${setting.tier}:`, elementError);
            }
        });
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function createTimestamp() {
    return new Date()
        .toLocaleString()
        .replace(/[\/\s\:]/g, '-')
        .replace(/,/g, '');
}

function exportData() {
    const data = {
        boardData: JSON.parse(localStorage.getItem('tierBoard')),
        tierSettings: JSON.parse(localStorage.getItem('tierSettings'))
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tier-list-${createTimestamp()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportAsPng() {
    const originalTable = document.querySelector('.tier-table');
    if (!originalTable) return;
    const clonedTable = originalTable.cloneNode(true);
    const rows = clonedTable.querySelectorAll('tr');
    if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        lastRow.parentNode.removeChild(lastRow);
    }
    const selectedRows = clonedTable.querySelectorAll('.selected');
    selectedRows.forEach(row => row.classList.remove('selected'));
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = originalTable.clientWidth + 'px';
    tempContainer.style.backgroundColor = getComputedStyle(originalTable).backgroundColor;
    tempContainer.appendChild(clonedTable);
    document.body.appendChild(tempContainer);
    html2canvas(tempContainer, { backgroundColor: null, scale: 2 })
        .then(canvas => {
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `tier-list-${createTimestamp()}.png`;
            a.click();
        })
        .catch(error => {
            console.error('Error in exporting PNG:', error);
        })
        .finally(() => {
            document.body.removeChild(tempContainer);
        });
}

function validateImportFile(file) {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File is too large');
    }
    if (!file.name.endsWith('.json')) {
        throw new Error('Please select a JSON file');
    }
    return true;
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
        validateImportFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('tierBoard', JSON.stringify(data.boardData));
            localStorage.setItem('tierSettings', JSON.stringify(data.tierSettings));
            loadBoard();
            loadTierSettings();
        };
        reader.readAsText(file);
    } catch (error) {
        alert(error.message);
    }
}

function getRandomSymbols() {
    const symbols = ALCHEMIC_SYMBOLS.split('');
    const result = [];
    
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * symbols.length);
        result.push(symbols[randomIndex]);
    }
    
    return result.join(' ');
}

const setupEventListeners = () => {
    document.getElementById('export-png-button').addEventListener('click', exportAsPng);
    document.getElementById('export-json-button').addEventListener('click', exportData);
    document.getElementById('import-button').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('clear-button').addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите очистить доску и все настройки? Это действие нельзя отменить.')) {
            clearMemory();
            loadBoard();
            loadTierSettings();
            window.location.reload();
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});
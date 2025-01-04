function applyTierSettings() {
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
    
    document.getElementById('settings-block').classList.add('hidden');
}

function saveTierSettings(tierSettings) {
    localStorage.setItem('tierSettings', JSON.stringify(tierSettings));
}

function loadTierSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('tierSettings'));
    if (savedSettings) {
        savedSettings.forEach(setting => {
            const tierRow = document.querySelector(`.tier-row[data-tier="${setting.tier}"]`);
            const tierSubtitle = document.querySelector(`.tier-subtitle[data-tier="${setting.tier}-subtitle"]`);
            if (tierRow && tierSubtitle) {
                tierSubtitle.textContent = setting.subtitle;
                tierRow.style.backgroundColor = setting.color;
                document.getElementById(`tier-${setting.tier.toLowerCase()}-subtitle`).value = setting.subtitle;
                document.getElementById(`tier-${setting.tier.toLowerCase()}-color`).value = setting.color;
            }
        });
    }
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
    a.download = 'tier-list.json';
    a.click();
    URL.revokeObjectURL(url);
}

function exportAsPng() {
    html2canvas(document.querySelector('.tier-table')).then(canvas => {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'tier-list.png';
        a.click();
    });
}

function importData() {
    const file = importFile.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('tierBoard', JSON.stringify(data.boardData));
            localStorage.setItem('tierSettings', JSON.stringify(data.tierSettings));
            loadBoard();
            loadTierSettings();
        };
        reader.readAsText(file);
    }
}

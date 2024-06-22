document.addEventListener('DOMContentLoaded', () => {
    const tiers = document.querySelectorAll('.tier-row');
    const itemInput = document.getElementById('item-input');
    const addButton = document.getElementById('add-button');
    const clearButton = document.getElementById('clear-button');
    const undoButton = document.getElementById('undo-button');
    const exportJsonButton = document.getElementById('export-json-button');
    const exportPngButton = document.getElementById('export-png-button');
    const importButton = document.getElementById('import-button');
    const importFile = document.getElementById('import-file');
    const settingsButton = document.getElementById('settings-button');
    const toggleSoundsButton = document.getElementById('toggle-sounds-button');
    const settingsBlock = document.getElementById('settings-block');
    const applySettingsButton = document.getElementById('apply-settings-button');

    
    window.soundsEnabled = JSON.parse(localStorage.getItem('soundsEnabled')) ?? true;

    
    toggleSoundsButton.innerHTML = `<span class="material-icons">${window.soundsEnabled ? 'volume_up' : 'volume_off'}</span>`;

    
    itemInput.disabled = true;
    addButton.disabled = true; 
    undoButton.disabled = true; 

    settingsButton.addEventListener('click', () => {
        settingsBlock.classList.toggle('hidden');
    });

    applySettingsButton.addEventListener('click', applyTierSettings);

    toggleSoundsButton.addEventListener('click', () => {
        window.soundsEnabled = !window.soundsEnabled;
        localStorage.setItem('soundsEnabled', JSON.stringify(window.soundsEnabled)); 
        toggleSoundsButton.innerHTML = `<span class="material-icons">${window.soundsEnabled ? 'volume_up' : 'volume_off'}</span>`;
    });

    tiers.forEach(tier => {
        tier.addEventListener('click', () => {
            if (tier.classList.contains('selected')) {
                tier.classList.remove('selected');
                selectedTier = null;
                itemInput.disabled = true;
                itemInput.placeholder = "Сначала выбери Tier";
                addButton.disabled = true; 
            } else {
                tiers.forEach(t => t.classList.remove('selected'));
                tier.classList.add('selected');
                selectedTier = tier.dataset.tier;
                itemInput.disabled = false;
                itemInput.placeholder = `Добавь элемент в ${selectedTier} Tier`;
                addButton.disabled = false; 
            }
        });
    });

    addButton.addEventListener('click', () => {
        const text = itemInput.value.trim();
        if (text && selectedTier) {
            savePreviousState(); 
            const tierItems = document.querySelector(`.tier-items[data-tier="${selectedTier}-items"]`);
            const item = createTierItem(text);
            tierItems.appendChild(item);
            itemInput.value = '';
            saveBoard();
            if (window.soundsEnabled) {
                if (selectedTier === 'S') {
                    playRandomAudio(sTierAudios); 
                } else if (selectedTier === 'D') {
                    playRandomAudio(dTierAudios); 
                }
            }
        }
    });

    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            clearMemory();
        }
    });

    undoButton.addEventListener('click', undoChanges);

    exportJsonButton.addEventListener('click', exportData);
    exportPngButton.addEventListener('click', exportAsPng);

    importButton.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', importData);

    document.querySelectorAll('.tier-items').forEach(tierItems => {
        tierItems.addEventListener('dragover', handleDragOver);
        tierItems.addEventListener('drop', handleDrop);
        tierItems.addEventListener('dragleave', handleDragLeave);
    });

    loadBoard();
    loadTierSettings(); 
});

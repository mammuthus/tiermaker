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
    const settingsBlock = document.getElementById('settings-block');
    const applySettingsButton = document.getElementById('apply-settings-button');
    const aboutButton = document.getElementById('about-button');
    const aboutBlock = document.getElementById('about-block');
    const buttonPanel = document.querySelector('.button-panel');
    const togglePanelButton = document.getElementById('toggle-panel-button');

    const PANEL_STATES = {
        HIDE: {
            icon: '&#11015;',
            text: ' Спрятать меню'
        },
        SHOW: {
            icon: '&#11014;',
            text: ''
        }
    };

    togglePanelButton.innerHTML = PANEL_STATES.HIDE.icon + PANEL_STATES.HIDE.text;
    togglePanelButton.title = 'Спрятать меню';
    
    const isPanelHidden = localStorage.getItem('isPanelHidden') === 'true';
    if (isPanelHidden) {
        buttonPanel.classList.add('hidden-panel');
        togglePanelButton.classList.add('show-unhide');
        togglePanelButton.innerHTML = '&#11014;';
        togglePanelButton.title = 'Показать меню';
    }

    itemInput.disabled = true;
    addButton.disabled = true; 
    undoButton.disabled = true; 

    settingsButton.addEventListener('click', () => {
        aboutBlock.classList.add('hidden');
        settingsBlock.classList.toggle('hidden');
        if (!settingsBlock.classList.contains('hidden')) {
            settingsBlock.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    aboutButton.addEventListener('click', () => {
        settingsBlock.classList.add('hidden');
        aboutBlock.classList.toggle('hidden');
        if (!aboutBlock.classList.contains('hidden')) {
            aboutBlock.scrollIntoView({ behavior: 'smooth' });
        }
    });

    applySettingsButton.addEventListener('click', () => {
        applyTierSettings(tiers, itemInput, addButton);
        settingsBlock.classList.add('hidden');
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
                itemInput.placeholder = "Добавь элемент в " + selectedTier + " Tier";
                addButton.disabled = false;
            }
        });
    });

    addButton.addEventListener('click', () => {
        const text = itemInput.value.trim();
        if (text && selectedTier) {
            savePreviousState();
            const tierItems = document.querySelector('.tier-items[data-tier="' + selectedTier + '-items"]');
            const item = createTierItem(text);
            tierItems.appendChild(item);
            Array.from(tierItems.children).forEach(child => {
                updateMoveButtons(child);
            });
            itemInput.value = '';
            saveBoard();
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

    importFile.addEventListener('change', (event) => {
        importData(event);
    });

    document.querySelectorAll('.tier-items').forEach(tierItems => {
        tierItems.addEventListener('dragover', handleDragOver);
        tierItems.addEventListener('drop', handleDrop);
        tierItems.addEventListener('dragleave', handleDragLeave);
    });

    togglePanelButton.addEventListener('click', () => {
        const isHidden = buttonPanel.classList.contains('hidden-panel');
        buttonPanel.classList.toggle('hidden-panel');
        
        if (!isHidden) {
            setTimeout(() => {
                togglePanelButton.classList.add('show-unhide');
                togglePanelButton.innerHTML = PANEL_STATES.SHOW.icon;
                togglePanelButton.title = 'Показать меню';
            }, 300);
            localStorage.setItem('isPanelHidden', 'true');
            settingsBlock.classList.add('hidden');
            aboutBlock.classList.add('hidden');
        } else {
            togglePanelButton.classList.remove('show-unhide');
            togglePanelButton.innerHTML = PANEL_STATES.HIDE.icon + PANEL_STATES.HIDE.text;
            togglePanelButton.title = 'Спрятать меню';
            localStorage.setItem('isPanelHidden', 'false');
        }
    });

    loadBoard();
    loadTierSettings();
});

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
            a.download = 'tier-list.png';
            a.click();
        })
        .catch(error => {
            console.error('Error in exporting PNG:', error);
        })
        .finally(() => {
            document.body.removeChild(tempContainer);
        });
}

function importData(event) {
    const file = event.target.files[0];
    const MAX_FILE_SIZE = 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
        alert('File is too large');
        return;
    }
    if (!file.name.endsWith('.json')) {
        alert('Please select a JSON file');
        return;
    }
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
document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Element References
    const tiers = document.querySelectorAll('.tier-row');
    const itemInput = document.getElementById('item-input');
    const addButton = document.getElementById('add-button');
    const undoButton = document.getElementById('undo-button');
    const settingsButton = document.getElementById('settings-button');
    const settingsBlock = document.getElementById('settings-block');
    const applySettingsButton = document.getElementById('apply-settings-button');
    const aboutButton = document.getElementById('about-button');
    const aboutBlock = document.getElementById('about-block');
    const buttonPanel = document.querySelector('.button-panel');
    const togglePanelButton = document.getElementById('toggle-panel-button');

    // 2. Constants and State
    const PANEL_STATES = {
        HIDE: {
            icon: '&#11015;',
            text: ' Спрятать меню',
            title: 'Спрятать меню'
        },
        SHOW: {
            icon: '&#11014;',
            text: '',
            title: 'Показать меню'
        }
    };

    // 3. Initial State Setup
    function initializeState() {
        itemInput.disabled = true;
        addButton.disabled = true; 
        undoButton.disabled = true;

        const isPanelHidden = localStorage.getItem('isPanelHidden') === 'true';
        const initialState = isPanelHidden ? PANEL_STATES.SHOW : PANEL_STATES.HIDE;
        togglePanelButton.innerHTML = initialState.icon + initialState.text;
        togglePanelButton.title = initialState.title;

        if (isPanelHidden) {
            buttonPanel.classList.add('hidden-panel');
            togglePanelButton.classList.add('show-unhide');
        }
    }

    // 4. Panel Management
    function setupPanelHandlers() {
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

        togglePanelButton.addEventListener('click', () => {
            const isHidden = buttonPanel.classList.contains('hidden-panel');
            buttonPanel.classList.toggle('hidden-panel');
            
            if (!isHidden) {
                setTimeout(() => {
                    togglePanelButton.classList.add('show-unhide');
                    togglePanelButton.innerHTML = PANEL_STATES.SHOW.icon;
                    togglePanelButton.title = PANEL_STATES.SHOW.title;
                }, 300);
                localStorage.setItem('isPanelHidden', 'true');
                settingsBlock.classList.add('hidden');
                aboutBlock.classList.add('hidden');
            } else {
                togglePanelButton.classList.remove('show-unhide');
                togglePanelButton.innerHTML = PANEL_STATES.HIDE.icon + PANEL_STATES.HIDE.text;
                togglePanelButton.title = PANEL_STATES.HIDE.title;
                localStorage.setItem('isPanelHidden', 'false');
            }
        });
    }

    // 5. Tier Management
    function setupTierHandlers() {
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
    }

    // 6. Item Management
    function setupItemHandlers() {
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

        undoButton.addEventListener('click', undoChanges);
    }

    // 7. Drag and Drop
    function setupDragAndDrop() {
        document.querySelectorAll('.tier-items').forEach(tierItems => {
            tierItems.addEventListener('dragover', handleDragOver);
            tierItems.addEventListener('drop', handleDrop);
            tierItems.addEventListener('dragleave', handleDragLeave);
        });
    }

    // 8. Settings
    function setupSettingsHandlers() {
        applySettingsButton.addEventListener('click', () => {
            applyTierSettings(tiers, itemInput, addButton);
            settingsBlock.classList.add('hidden');
        });
    }

    // 9. Initialize Everything
    initializeState();
    setupPanelHandlers();
    setupTierHandlers();
    setupItemHandlers();
    setupDragAndDrop();
    setupSettingsHandlers();
    loadBoard();
    loadTierSettings();
});
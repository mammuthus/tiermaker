let selectedTier = null;
let draggedItem = null;
let previousState = null; // For undo functionality

// Audio files for 'S' tier
const sTierAudios = [
    new Audio('sounds/Super.mp3'),
    new Audio('sounds/Exceptionale.mp3')
];

// Audio files for 'D' tier
const dTierAudios = [
    new Audio('sounds/Cheap.mp3'),
    new Audio('sounds/Poor.mp3')
];

function createTierItem(text) {
    const item = document.createElement('div');
    item.className = 'tier-item-container';
    item.draggable = true; // Make the item draggable
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    
    const itemText = document.createElement('span');
    itemText.textContent = text;
    
    const trashButton = document.createElement('button');
    trashButton.className = 'trash-button';
    trashButton.innerHTML = '&times;'; // Unicode multiplication sign (×)
    trashButton.addEventListener('click', () => {
        savePreviousState(); // Save state before making changes
        item.remove();
        saveBoard();
    });

    item.appendChild(itemText);
    item.appendChild(trashButton);

    return item;
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.querySelector('span').textContent);
    e.dataTransfer.effectAllowed = 'move';
    draggedItem = e.target;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (e.target.classList.contains('tier-items')) {
        e.target.classList.add('drag-over');
    } else if (e.target.classList.contains('tier-item-container')) {
        e.target.classList.add('drag-over-item');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('tier-items')) {
        e.target.classList.remove('drag-over');
    } else if (e.target.classList.contains('tier-item-container')) {
        e.target.classList.remove('drag-over-item');
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (e.target.classList.contains('tier-items') || e.target.classList.contains('tier-item-container')) {
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        document.querySelectorAll('.drag-over-item').forEach(el => el.classList.remove('drag-over-item'));

        const data = e.dataTransfer.getData('text/plain');
        const targetTier = e.target.closest('.tier-items').dataset.tier;
        const draggedItemTier = draggedItem ? draggedItem.closest('.tier-items').dataset.tier : null;

        savePreviousState(); // Save state before making changes
        const newItem = createTierItem(data);

        if (e.target.classList.contains('tier-item-container')) {
            e.target.parentNode.insertBefore(newItem, e.target.nextSibling);
        } else {
            e.target.appendChild(newItem);
        }

        draggedItem.remove();
        saveBoard();

        if (targetTier === 'S-items' && window.soundsEnabled) {
            playRandomAudio(sTierAudios); // Play random audio if item is moved to 'S' tier
        } else if (targetTier === 'D-items' && window.soundsEnabled) {
            playRandomAudio(dTierAudios); // Play random audio if item is moved to 'D' tier
        }
    }
}

function playRandomAudio(audioArray) {
    if (window.soundsEnabled) {
        const randomIndex = Math.floor(Math.random() * audioArray.length);
        audioArray[randomIndex].play();
    }
}

function savePreviousState() {
    previousState = {
        boardData: JSON.parse(localStorage.getItem('tierBoard')),
        tierSettings: JSON.parse(localStorage.getItem('tierSettings'))
    };
    checkUndoState();
}

function saveBoard() {
    const boardData = {};
    document.querySelectorAll('.tier-items').forEach(row => {
        const tier = row.dataset.tier.replace('-items', '');
        boardData[tier] = [];
        row.querySelectorAll('.tier-item-container span').forEach(item => {
            boardData[tier].push(item.textContent);
        });
    });
    localStorage.setItem('tierBoard', JSON.stringify(boardData));
    checkUndoState();
}

function loadBoard() {
    const boardData = JSON.parse(localStorage.getItem('tierBoard'));
    if (boardData) {
        document.querySelectorAll('.tier-items').forEach(row => {
            row.innerHTML = '';
            const tier = row.dataset.tier.replace('-items', '');
            if (boardData[tier]) {
                boardData[tier].forEach(itemText => {
                    const item = createTierItem(itemText);
                    row.appendChild(item);
                });
            }
        });
    }
    loadTierSettings(); // Ensure tier settings are loaded after the board
}

function clearMemory() {
    localStorage.removeItem('tierBoard');
    localStorage.removeItem('tierSettings');
    document.querySelectorAll('.tier-items').forEach(row => {
        row.innerHTML = '';
    });
    checkUndoState();
}

function undoChanges() {
    if (previousState) {
        localStorage.setItem('tierBoard', JSON.stringify(previousState.boardData));
        localStorage.setItem('tierSettings', JSON.stringify(previousState.tierSettings));
        loadBoard();
        loadTierSettings();
        previousState = null; // Clear previous state after undo
    }
    checkUndoState();
}

function checkUndoState() {
    const undoButton = document.getElementById('undo-button');
    undoButton.disabled = !previousState;
}

let selectedTier = null;
let draggedItem = null;
let previousState = null; 

// Audio management
let audioCache = {
    S: null,
    D: null
};

function initializeAudioType(type) {
    if (!window.soundsEnabled) return null;
    
    try {
        if (type === 'S' && !audioCache.S) {
            audioCache.S = [
                new Audio('sounds/Super.mp3'),
                new Audio('sounds/Exceptionale.mp3')
            ];
        } else if (type === 'D' && !audioCache.D) {
            audioCache.D = [
                new Audio('sounds/Cheap.mp3'),
                new Audio('sounds/Poor.mp3')
            ];
        }
        return audioCache[type];
    } catch (error) {
        console.error('Error initializing audio:', error);
        return null;
    }
}

function playRandomAudio(type) {
    if (!window.soundsEnabled) return;
    
    const audioArray = initializeAudioType(type);
    if (!audioArray) return;
    
    try {
        const randomIndex = Math.floor(Math.random() * audioArray.length);
        audioArray[randomIndex].play();
    } catch (error) {
        console.error('Error playing audio:', error);
    }
}



function createTierItem(text) {
    const item = document.createElement('div');
    item.className = 'tier-item-container';
    item.draggable = true; 
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    
    const itemText = document.createElement('span');
    itemText.textContent = text;

    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    // Up button
    const upButton = document.createElement('button');
    upButton.className = 'move-button';
    upButton.title = 'Выше';
    upButton.innerHTML = '&#8593;';
    upButton.addEventListener('click', () => moveItem(item, 'up'));

    // Down button
    const downButton = document.createElement('button');
    downButton.className = 'move-button';
    downButton.title = 'Ниже';
    downButton.innerHTML = '&#8595;';
    downButton.addEventListener('click', () => moveItem(item, 'down'));



    const trashButton = document.createElement('button');
    trashButton.className = 'trash-button';
    trashButton.title = 'Удалить';
    trashButton.innerHTML = '&times;'; 
    trashButton.addEventListener('click', () => {
        savePreviousState(); 
        item.remove();
        saveBoard();
    });


    buttonContainer.appendChild(upButton);
    buttonContainer.appendChild(downButton);
    buttonContainer.appendChild(trashButton);


    item.appendChild(itemText);
    item.appendChild(buttonContainer);
    
    // Only update buttons after item is added to DOM
    requestAnimationFrame(() => updateMoveButtons(item));
    
    return item;
}


function moveItem(item, direction) {
    if (!item || !item.parentElement) return;

    if ((direction === 'up' && !item.previousElementSibling) || 
        (direction === 'down' && !item.nextElementSibling)) {
        return;
    }
    
    savePreviousState();
    
    if (direction === 'up') {
        item.parentNode.insertBefore(item, item.previousElementSibling);
    } else if (direction === 'down') {
        item.parentNode.insertBefore(item.nextElementSibling, item);
    }
    
    saveBoard();
    
    // Update all items in container after move
    const containerItems = item.parentElement.children;
    if (item.parentElement) {
        Array.from(item.parentElement.children).forEach(updateMoveButtons);
    }
}

function updateMoveButtons(item) {
    if (!item || !item.parentElement) return;
    
    const upButton = item.querySelector('.move-button:first-child');
    const downButton = item.querySelector('.move-button:nth-child(2)');
    
    const containerItems = Array.from(item.parentElement.children);
    const itemIndex = containerItems.indexOf(item);
    
    const isFirstItem = itemIndex === 0;
    const isLastItem = itemIndex === containerItems.length - 1;
    
    if (upButton) upButton.style.visibility = isFirstItem ? 'hidden' : 'visible';
    if (downButton) downButton.style.visibility = isLastItem ? 'hidden' : 'visible';
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


    document.querySelectorAll('.drag-over, .drag-over-item').forEach(el => {
        el.classList.remove('drag-over', 'drag-over-item');
    });


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

        savePreviousState(); 
        const newItem = createTierItem(data);

        if (e.target.classList.contains('tier-item-container')) {
            e.target.parentNode.insertBefore(newItem, e.target.nextSibling);
        } else {
            e.target.appendChild(newItem);
        }

        draggedItem.remove();
        saveBoard();

        if (window.soundsEnabled) {
            if (targetTier === 'S-items') {
                playRandomAudio('S');
            } else if (targetTier === 'D-items') {
                playRandomAudio('D');
            }
        }
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
        row.querySelectorAll('.tier-item-container > span:first-child').forEach(item => {
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
    loadTierSettings(); 
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
        previousState = null; 
    }
    checkUndoState();
}

function checkUndoState() {
    const undoButton = document.getElementById('undo-button');
    undoButton.disabled = !previousState;
}
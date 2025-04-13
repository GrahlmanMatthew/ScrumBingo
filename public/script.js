
document.addEventListener("DOMContentLoaded", () => {
    
    const fetchWords = async () => {
        try {
            const response = await fetch('/api/words');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching the words:', error);
            return [];
        }
    };

    const createBingoCell = (wordObj) => {
        const cell = document.createElement('div');
        cell.classList.add('bingo-cell');
        cell.textContent = wordObj.word;

        switch (wordObj.type) {
            case 'Field':
                createFieldCell(cell, wordObj);
                break;
            case 'Timer':
                createFieldCell(cell, wordObj); // Not implemented yet
                break;
            case 'Free':
                createFreeCell(cell, wordObj);
                break;
            default:
                console.error(`Unknown word type: ${wordObj.type}`);
        }

        return cell;
    };

    var confettiColors = ['#42f569', '#23522d', '#05756a', '#6dd16d', '#0caae8']

    const createFieldCell = (cell, wordObj) => {
        cell.addEventListener('click', (event) => {
            cell.classList.toggle('marked');
            if (cell.classList.contains('marked')) {
                showConfetti(event);
            }
        });

    };

    const showConfetti = (event) => {
        const x = event.clientX;
        const y = event.clientY;

        
        confetti({
            particleCount: 10,
            spread: 60,
            colors: confettiColors,
            startVelocity: 20,
            origin: {
                x: x / window.innerWidth,
                y: y / window.innerHeight 
            }
        });
    };

    const createFreeCell = (cell, wordObj) => {
        cell.classList.add('free-cell');
        cell.addEventListener('click', () => {
            cell.classList.toggle('marked');
        });
    };

    const populateBingoGrid = (words) => {
        const grid = document.getElementById('bingoGrid');
        grid.innerHTML = ''; // Clear existing content if any

        let freeWord = null;
        const freeWords = words.filter(word => word.type === 'Free');
        if (freeWords.length > 0) {
            freeWord = freeWords[Math.floor(Math.random() * freeWords.length)];
        } else {
            freeWord = { word: "FREE", type: "Free" }; // Fallback
        }

        const nonFreeWords = words.filter(word => word.type !== 'Free' || word.word !== freeWord.word);
        const selectedWords = nonFreeWords.slice(0, 24); // 24 non-free cells

        for (let i = 0; i < 25; i++) {
            if (i === 12) {
                // Middle cell: always insert free space
                const cell = createBingoCell(freeWord);
                grid.appendChild(cell);
            } else {
                const wordObj = selectedWords.shift();
                const cell = createBingoCell(wordObj);
                grid.appendChild(cell);
            }
        }
    };

    const initializeBingoGrid = async () => {
        const words = await fetchWords();
        populateBingoGrid(words);
    };

    initializeBingoGrid();
});

function fireworkConfetti() {
    var confettiColors = ['#42f569', '#23522d', '#05756a', '#6dd16d', '#0caae8']
    var duration = 15 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, colors: confettiColors };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
        return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);

    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
}
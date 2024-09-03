document.addEventListener('DOMContentLoaded', () => {
    const wordsContainer = document.getElementById('words-container');
    const saveButton = document.getElementById('save-button');
    const addWordButton = document.getElementById('add-word-button');
    const exportButton = document.getElementById('export-button');
    const importButton = document.getElementById('import-button');
    const fileInput = document.getElementById('file-input');

    // Initialize the application
    initialize();

    async function initialize() {
        try {
            const words = await fetchWords();
            if (words.length === 0) {
                displayNoWordsMessage();
            } else {
                words.forEach(addWordField);
            }
        } catch (error) {
            handleFetchError(error);
        }
    }

    // Fetch words from the server
    async function fetchWords() {
        const response = await fetch('/admin/words');
        if (!response.ok) {
            throw new Error('Failed to fetch words');
        }
        return await response.json();
    }

    // Display a message if no words are found
    function displayNoWordsMessage() {
        wordsContainer.innerHTML = '<p>No words found.</p>';
    }

    // Handle fetch errors
    function handleFetchError(error) {
        console.error('Error fetching words:', error);
        wordsContainer.innerHTML = '<p>Error loading words. Please try again later.</p>';
    }

    // Add a new word input field with a remove button
    function addWordField(value = '') {
        const container = document.createElement('div');
        container.className = 'word-field-container';

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = value;
        inputField.className = 'word-field';

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.className = 'remove-button';
        removeButton.addEventListener('click', () => {
            container.remove();
        });

        container.appendChild(inputField);
        container.appendChild(removeButton);
        wordsContainer.appendChild(container);
    }

    // Add a new word field when the "Add Word" button is clicked
    addWordButton.addEventListener('click', () => addWordField());

    // Save words to the server
    saveButton.addEventListener('click', async () => {
        const updatedWords = Array.from(document.querySelectorAll('.word-field')).map(input => input.value);

        try {
            await saveWords(updatedWords);
            displaySaveSuccess();
        } catch (error) {
            handleSaveError(error);
        }
    });

    async function saveWords(words) {
        const response = await fetch('/admin/words', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ words }),
        });

        if (!response.ok) {
            throw new Error('Failed to save words');
        }
        return await response.json();
    }

    function displaySaveSuccess() {
        saveButton.textContent = 'Saved...';
        setTimeout(() => {
            saveButton.textContent = 'Save';
        }, 3000);
    }

    function handleSaveError(error) {
        console.error('Error saving words:', error);
        alert('Failed to save words. Please try again.');
    }

    // Export words as a JSON file
    exportButton.addEventListener('click', () => {
        const words = Array.from(document.querySelectorAll('.word-field')).map(input => input.value);
        const blob = new Blob([JSON.stringify({ words }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'words.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Trigger file input click to import words
    importButton.addEventListener('click', () => fileInput.click());

    // Handle file input change to import words
    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (file) {
            try {
                const content = await file.text();
                const json = JSON.parse(content);

                if (isValidWordData(json)) {
                    wordsContainer.innerHTML = ''; // Clear current words
                    json.words.forEach(addWordField); // Add imported words
                } else {
                    alert('Invalid JSON format. Please provide a valid words file.');
                }
            } catch (error) {
                console.error('Error importing JSON:', error);
                alert('Failed to import JSON. Please check the file and try again.');
            }
        }
    });

    // Validate imported JSON structure
    function isValidWordData(data) {
        return Array.isArray(data.words) && data.words.every(word => typeof word === 'string');
    }
});

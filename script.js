document.addEventListener('DOMContentLoaded', function() {
    // This is an event listener, something that waits for an event to happen before any code is executed and in this case it would be to make sure that the html document has loaded
    // This is extremely importance, since if the html document has not loaded the js file would try to get elements that haven't been created, causing very bad errors
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    
    // Update welcome title with username if available
    const welcomeTitle = document.getElementById('welcome-title');
    if (username) {
      welcomeTitle.textContent = `Welcome ${username}`;
      
      // Store username in localStorage for persistence
      localStorage.setItem('logbookUsername', username);
    } else {
      // Try to get username from localStorage if not in URL
      const storedUsername = localStorage.getItem('logbookUsername');
      if (storedUsername) {
        welcomeTitle.textContent = `Welcome ${storedUsername}`;
      }
    }
    // Lines 7-20 will make a more personalized experience for anyone using this, by making it so that there is no real login process required
    
    // Document Object Model elements
    const entryForm = document.getElementById('entry-form');
    const entryTitle = document.getElementById('entry-title');
    const entryContent = document.getElementById('entry-content');
    const entriesContainer = document.getElementById('entries-container');
    const searchInput = document.getElementById('search-input');
    
    // Use username in localStorage key to have separate entries for different users
    //This utilizer Ternary (Shorthand Operators) for the if-else statements
    //The syntax for Ternary Operators is condition ? value_if_true:value_if_false
    const storageKey = username ? //this would be the condition
      `logbookEntries_${username}` : //this would be for if the condition or value is true
      localStorage.getItem('logbookUsername') ? 
        `logbookEntries_${localStorage.getItem('logbookUsername')}` : //this would then be for if it was false
        'logbookEntries';
    
    // Load entries from localStorage
    let entries = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    // Render all entries
    function renderEntries(entriesToRender = entries) {
      // Clear entries container
      entriesContainer.innerHTML = '';
      
      // Show empty state if no entries
      if (entriesToRender.length === 0) {
        entriesContainer.innerHTML = `
          <div class="empty-state">
            <p>No entries yet. Create your first logbook entry!</p>
          </div>
        `;
        return;
      }
      
      // Sort entries by date (newest first)
      entriesToRender.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Render each entry
      entriesToRender.forEach((entry, index) => {
        const entryElement = document.createElement('div'); //creating a new div element for note entry
        entryElement.className = 'entry';
        
        // Format date into a readable format
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        //this will be building the html structure for the entry using template literals
        //this is used to embed expressions within strings, for example
          //const name = John;
          //const age = 30;
          //console.log(`My name is ${name} and I am ${age} years old.`);
        entryElement.innerHTML = `
          <div class="entry-header">
            <h3 class="entry-title">${entry.title}</h3>
            <span class="entry-date">${formattedDate}</span>
          </div>
          <div class="entry-content">${entry.content}</div>
          <div class="entry-actions">
            <button class="edit-btn" data-index="${index}">
              <i class='bx bx-edit-alt'></i> Edit
            </button>
            <button class="button-danger delete-btn" data-index="${index}">
              <i class='bx bx-trash'></i> Delete
            </button>
          </div>
        `;
        
        entriesContainer.appendChild(entryElement);
      });
      
      // Adds click event listeners to edit and delete buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
      }); //makes it so that clicking this button just points them to the appropriate handler functions
      
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
      });
    }
    
    // Save entry to localStorage
    // This is going to allow for all entries to remain even with page refreshes and such
    //converts entries array to JSON string
    //JSON is a text based format for data exchanges, and the data that is being exchanged here is saved to Local Storage
    function saveEntries() {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }
    
    // Handle form submission
    entryForm.addEventListener('submit', function(e) {
      e.preventDefault(); //this prevents the page from reloading as it is the default response to the submission button
      
      const title = entryTitle.value.trim();
      const content = entryContent.value.trim();
    //gets and trims the title and content values of the notes
        
      if (!title || !content) return; //allows for an early return if both of the fields are empty, so that it wont error if the user inputs nothing
      
      const editingIndex = entryForm.dataset.editing; //checks if the user is editing
      
      if (editingIndex !== undefined) { //if the user is editing this will
        // Update existing entry
        entries[editingIndex] = {
          ...entries[editingIndex],
          title,
          content,
          lastEdited: new Date()
        };
        // Reset form state
        delete entryForm.dataset.editing;
        document.getElementById('save-button').textContent = 'Save Entry';
      } else { //if the user is just creating a new entry
        // Create new entry
        const newEntry = {
          id: Date.now().toString(),
          title,
          content,
          date: new Date(),
          lastEdited: null
        };
        
        entries.push(newEntry);
      }
      
      // Save to localStorage and render
      saveEntries();
      renderEntries();
      
      // Reset form fields
      entryForm.reset();
    });
    
    // Handle edit button click
    function handleEdit(e) {
      const index = e.target.closest('.edit-btn').dataset.index;
      const entry = entries[index];
      
      // Populate form
      entryTitle.value = entry.title;
      entryContent.value = entry.content;
      
      // Set editing state
      entryForm.dataset.editing = index;
      document.getElementById('save-button').textContent = 'Update Entry';
      
      // Scroll to form
      document.querySelector('.logbook-form').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Handle delete button click
    function handleDelete(e) {
      if (confirm('Are you sure you want to delete this entry?')) {
        const index = e.target.closest('.delete-btn').dataset.index;
        entries.splice(index, 1);
        saveEntries();
        renderEntries();
      }
    }
    
    // Handle search
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      
      if (!searchTerm) {
        renderEntries();
        return;
      }
      
      const filteredEntries = entries.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm) || 
        entry.content.toLowerCase().includes(searchTerm)
      );
      
      renderEntries(filteredEntries);
    });
    
    // Initial render
    renderEntries();
  });

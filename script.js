document.addEventListener('DOMContentLoaded', function() {
    // Get username from URL parameter
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
    
    // DOM elements
    const entryForm = document.getElementById('entry-form');
    const entryTitle = document.getElementById('entry-title');
    const entryContent = document.getElementById('entry-content');
    const entriesContainer = document.getElementById('entries-container');
    const searchInput = document.getElementById('search-input');
    
    // Use username in localStorage key to have separate entries for different users
    const storageKey = username ? 
      `logbookEntries_${username}` : 
      localStorage.getItem('logbookUsername') ? 
        `logbookEntries_${localStorage.getItem('logbookUsername')}` : 
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
        const entryElement = document.createElement('div');
        entryElement.className = 'entry';
        
        // Format date
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
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
      
      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
      });
      
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
      });
    }
    
    // Save entry to localStorage
    function saveEntries() {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }
    
    // Handle form submission
    entryForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const title = entryTitle.value.trim();
      const content = entryContent.value.trim();
      
      if (!title || !content) return;
      
      const editingIndex = entryForm.dataset.editing;
      
      if (editingIndex !== undefined) {
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
      } else {
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
      
      // Reset form
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
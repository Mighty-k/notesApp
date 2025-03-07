// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const response = await fetch('https://notes-app-wheat-nu.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      // console.log('yo mama')
      if (response.ok) {
        console.log(data)
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('username', data.user.name);
        
        window.location.href = 'notes.html';
      } else {
        alert(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  });
}

// Handle Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const response = await fetch('https://notes-app-wheat-nu.vercel.app/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup successful! Please log in.');
        window.location.href = 'index.html';
      } else {
        alert(data.message || 'Signup failed.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup.');
    }
  });
}

// Check Authentication on Notes Page
const token = localStorage.getItem('jwt');
if (!token && window.location.pathname.includes('notes.html')) {
  alert('You must log in first.');
  window.location.href = 'index.html';
}

// Display Username in Navbar
const usernameElement = document.querySelector('.username');
if (usernameElement) {
  const username = localStorage.getItem('username');
  if (username) {
    usernameElement.textContent = username;
  }
}

// Logout Functionality
const logoutButton = document.querySelector('.logout-btn');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
  });
}

// Notes Functionality
const addNoteButton = document.querySelector('.add-note');
const modal = document.querySelector('.modal');
const closeModalButton = document.querySelector('.close-modal');
const noteForm = document.querySelector('#noteForm');
const notesContainer = document.querySelector('.notes-container');
const noNotesText = document.querySelector('.no-notes');

const date = new Date().toLocaleString()


function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

let isEditing = false;
let editingNote = null;

// Fetch Notes
async function fetchNotes() {
  try {
    const response = await fetch('https://notes-app-wheat-nu.vercel.app/api/notes', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const notes = await response.json();
      renderNotes(notes);
    } else {
      alert('Failed to fetch notes. Please log in again.');
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
}

// Render Notes
function renderNotes(notes) {
  notesContainer.innerHTML = '';
  if (notes.length === 0) {
    noNotesText.style.display = 'block';
  } else {
    noNotesText.style.display = 'none';
    notes.forEach((note) => {
      const noteCard = document.createElement('div');
      noteCard.classList.add('note-card');
      noteCard.innerHTML = `
        <h3>${note.title}</h3>
        <p>${truncateText(note.content, 100)}</p>
        <div class="note-actions">
          <button><i class="edit-icon">✏️</i></button>
          <button><i class="delete-icon">🗑️</i></button>
        </div>
         <footer>${note.date.toLocaleString()}</footer>
      `;
      noteCard.querySelector('.edit-icon').addEventListener('click', () => editNoteHandler(note));
      noteCard.querySelector('.delete-icon').addEventListener('click', () => deleteNoteHandler(note._id));
      notesContainer.appendChild(noteCard);
    });
  }
}

// Open Modal for Adding Notes
addNoteButton?.addEventListener('click', () => {
  modal.classList.remove('hidden');
  noteForm.reset();
  isEditing = false;
});

// Close Modal
closeModalButton?.addEventListener('click', () => {
  modal.classList.add('hidden');
  noteForm.reset();
  isEditing = false;
});

// Handle Add or Edit Note
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.querySelector('#title').value.trim();
  const content = document.querySelector('#content').value.trim();

  if (!title || !content) {
    alert('Both title and content are required!');
    return;
  }


  try {
    if (isEditing) {
      const response = await fetch(`https://notes-app-wheat-nu.vercel.app/api/notes/${editingNote._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, date }),
      });

      if (response.ok) {
        alert('Note updated successfully!');
      } else {
        alert('Failed to update note.');
      }
    } else {
      const response = await fetch('https://notes-app-wheat-nu.vercel.app/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, date }),
      });

      if (response.ok) {
        alert('Note added successfully!');
      } else {
        alert('Failed to add note.');
      }
    }
    fetchNotes();
  } catch (error) {
    console.error('Error saving note:', error);
  }

  modal.classList.add('hidden');
  noteForm.reset();
});

// Edit Note Handler
function editNoteHandler(note) {
  isEditing = true;
  editingNote = note;
  document.querySelector('#title').value = note.title;
  document.querySelector('#content').value = note.content;
  modal.classList.remove('hidden');
}

// Delete Note Handler
async function deleteNoteHandler(noteId) {
  try {
    const response = await fetch(`https://notes-app-wheat-nu.vercel.app/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert('Note deleted successfully!');
      fetchNotes();
    } else {
      alert('Failed to delete note.');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

// Fetch Notes on Load
if (window.location.pathname.includes('notes.html')) {
  fetchNotes();
}

console.log('hi');

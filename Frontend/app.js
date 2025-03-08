document.addEventListener('DOMContentLoaded', () => {
// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginButton = document.querySelector("button[type='submit']");

    loginButton.disabled = true;
    loginButton.innerHTML = "Logging in... <span class='loader'></span>";

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
    finally {
      // Re-enable the button after response
      loginButton.disabled = false;
      loginButton.innerHTML = "Login";
  }
  });
  function showErrorMessage(message) {
    const errorMsg = document.getElementById("error-message");
    errorMsg.textContent = message;
    errorMsg.style.display = "block";
    setTimeout(() => errorMsg.style.display = "none", 3000);
}
}

// Handle Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const signupButton = document.querySelector("button[type='submit']");

    signupButton.disabled = true;
    signupButton.innerHTML = "Please wait... <span class='loader'></span>";

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
    finally {
      // Re-enable the button after response
      signupButton.disabled = false;
      signupButton.innerHTML = "Signup";
  }
  });
  function showErrorMessage(message) {
    const errorMsg = document.getElementById("error-message");
    errorMsg.textContent = message;
    errorMsg.style.display = "block";
    setTimeout(() => errorMsg.style.display = "none", 3000);
}
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
const addNoteButton = document.querySelector('#add-note');
const modal = document.querySelector('#modal');
const closeModalButton = document.querySelector('#close-modal');
const noteForm = document.querySelector('#noteForm');
const notesContainer = document.querySelector('#notes-container');
const noNotesText = document.querySelector('#no-notes');
const loadingIndicator = document.getElementById("loading");

const date = new Date().toLocaleString()


function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

let isEditing = false;
let editingNote = null;

// Fetch Notes
loadingIndicator.classList.remove("hidden"); 
async function fetchNotes() {
  
  try {
    const response = await fetch('https://notes-app-wheat-nu.vercel.app/api/notes', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const notes = await response.json();
      renderNotes(notes); // Render notes (or show "no notes" message if empty)
    } else {
      alert('Failed to fetch notes. Please log in again.');
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    noNotesText.style.display = 'block'; // Show "no notes" message on error
  }
}

// Render Notes
function renderNotes(notes) {
  // Clear only the note cards, not the entire container
  const noteCards = notesContainer.querySelectorAll('.note-card');
  noteCards.forEach(card => card.remove());
  loadingIndicator.classList.add("hidden");
  if (!notes || notes.length === 0) {
   
    noNotesText.style.display = 'block'; // Show "no notes" message
  } else {
    noNotesText.style.display = 'none'; // Hide "no notes" message
    notes.forEach((note) => {
      const noteCard = document.createElement('div');
      noteCard.classList.add('note-card','text-lg','lg:text-2xl', "relative", 'lg:h-72', 'h-52', 'shadow-xl');
      noteCard.innerHTML = `
        <h3>${note.title}</h3>
        <p>${truncateText(note.content, 100)}</p>
        <div class="note-actions">
          <button id="edit-icon" class="rounded-full p-2 bg-yellow-200  absolute top-2 right-2 bg-green-100 hover:bg-green-200 transition-all">
          <i class="edit-icon ">
           <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
          
          </i>
          </button>
          <button id="delete-icon" class="p-2 rounded-full absolute bottom-2 left-2 bg-yellow-100 hover:bg-yellow-200 transition-all">
          <i class="delete-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </i>
          </button>
        </div>
        <footer class="absolute w-1/2 bottom-1 right-5">${new Date(note.date).toLocaleString()}</footer>
      `;
      noteCard.querySelector('#edit-icon').addEventListener('click', () => editNoteHandler(note));
      noteCard.querySelector('#delete-icon').addEventListener('click', () => deleteNoteHandler(note._id));
      noteCard.querySelector('#delete-icon').addEventListener('touchend', () => deleteNoteHandler(note._id));
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
        showSuccessMessage("Note added successfully!");
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
function showSuccessMessage(message) {
  const successMsg = document.createElement("div");
  successMsg.textContent = message;
  successMsg.className = "fixed top-6 sm:left[20%] lg:left-[50%] bg-green-500 text-white px-4 py-2 rounded shadow";
  
  document.body.appendChild(successMsg);
  setTimeout(() => successMsg.remove(), 2000);
}
// Edit Note Handler
function editNoteHandler(note) {
  isEditing = true;
  editingNote = note;
  document.querySelector('#title').value = note.title;
  document.querySelector('#content').value = note.content;
  modal.classList.remove('hidden');
}

// Delete Note Handler
let noteToDelete = null;

function deleteNoteHandler(noteId) {
    noteToDelete = noteId; // Store the note ID
    document.getElementById("confirm-delete-modal").classList.remove("hidden");
}

// When the user clicks "Cancel", close the modal
document.getElementById("cancel-delete").addEventListener("click", function () {
  document.getElementById("confirm-delete-modal").classList.add("hidden");
  noteToDelete = null; // Reset stored ID
});

// When the user clicks "Delete", proceed with deletion
document.getElementById("confirm-delete").addEventListener("click", async function () {
  if (!noteToDelete) return; // Ensure a note is selected

  try {
      const response = await fetch(`https://notes-app-wheat-nu.vercel.app/api/notes/${noteToDelete}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
          alert("Note deleted successfully!");
          fetchNotes(); // Refresh notes
      } else {
          alert("Failed to delete note.");
      }
  } catch (error) {
      console.error("Error deleting note:", error);
  }

  // Close the modal
  document.getElementById("confirm-delete-modal").classList.add("hidden");
  noteToDelete = null; // Reset stored ID
});





// Fetch Notes on Load
if (window.location.pathname.includes('notes.html')) {
  fetchNotes();
}

console.log('hi');
});
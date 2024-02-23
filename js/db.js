// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAncG4ni3dB0bX3vxeP4iIjWz4Phwi15Q4",
  authDomain: "pwa-plants-catalog.firebaseapp.com",
  databaseURL: "https://pwa-plants-catalog-default-rtdb.firebaseio.com",
  projectId: "pwa-plants-catalog",
  storageBucket: "pwa-plants-catalog.appspot.com",
  messagingSenderId: "764352913774",
  appId: "1:764352913774:web:f8681827ea44c1dc4ae17f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage();

// read collection from DB and get data
const cards_wrap = document.querySelector(".cards");
const cards = document.querySelector(".cards > .row");
const cards_message = document.querySelector(".cards-message");
const cards_actions = document.querySelector(".cards-action");
const preloader = document.querySelector(".preloader");

preloader.style.display = "block";
cards_actions.style.display = "none";

// if (cards.children && cards.children.length === 0) {
//   cards_message.classList.add("d-block");
// }

const renderCard = (data, id) => {
  const card = `
    <div class="">
        <!-- card -->
        <section class="card sticky-action" id="${id}">
          <div class="card-image waves-effect waves-block waves-light">
            <img class="activator" src="${data.img}" width="200" height="200" alt="" />
          </div>
          <div class="card-content">
            <span class="card-title activator grey-text text-darken-4"
              >${data.name}<i class="material-icons right">more_vert</i></span
            >
          </div>
          <div class="card-action">
            <button class="waves-effect waves-light btn btn-del deep-orange accent-3" data-id="${id}">Delete</button>
            <button class="waves-effect waves-light btn btn-edit orange darken-2 modal-trigger" data-id="${id}" data-target="modal1">Edit</button>
          </div>
          <div class="card-reveal">
            <span class="card-title grey-text text-darken-4"
              >${data.name}<i class="material-icons right">close</i></span
            >
            <p>${data.description}</p>
          </div>
        </section>
        <!-- /card -->
      </div>
`;
  cards.innerHTML += card;
  cards_message.classList.remove("d-block");

  preloader.style.display = "none";
  cards_actions.style.display = "block";
};

// Read cards
let list = [];
let originalData = {};

const cards_db = ref(db, "plants/");
onValue(cards_db, (snapshot) => {
  const data = snapshot.val();
  originalData = data || {};
  list = Object.values(originalData);
  preloader.style.display = "none";
  cards_actions.style.display = "block";

  console.log("Original Data:", originalData);
  console.log("List:", list);

  if (data) {
    list = Object.keys(data).map((id) => ({ id, ...data[id] }));
    cards.innerHTML = ""; // Clear existing cards
    Object.keys(data).forEach((id) => {
      renderCard(data[id], id);
    });
  } else {
    cards_message.classList.add("d-block");
  }

  // Order By
  const searchData = Object.values(originalData || {});
  console.log("searchData", searchData);
  const orderBy = document.querySelector("select");

  orderBy.addEventListener("change", function() {
    const orderByValue = orderBy.value;

    if (Array.isArray(list)) {
      const sortedData = list.slice();

      if (orderByValue === "asc") {
        sortedData.sort((a, b) => (a.name > b.name ? 1 : -1));
      } else if (orderByValue === "desc") {
        sortedData.sort((a, b) => (a.name < b.name ? 1 : -1));
      }

      console.log("After sorting - searchData:", sortedData);

      updateUI(sortedData);
    } else {
      console.error("searchData is not an array:", list);
    }
  });
});

// Del card
cards.addEventListener("click", function(event) {
  const deleteButton = event.target.closest(".card-action .btn-del");
  if (deleteButton) {
    let id = deleteButton.getAttribute("data-id");
    const cardRef = ref(db, "plants/" + id);

    // Remove the card from the database
    remove(cardRef)
      .then(() => {
        console.log(`Card with ID ${id} removed successfully.`);

        // Optional: Update the HTML by re-fetching and rendering cards
        onValue(cards_db, (snapshot) => {
          const newData = snapshot.val();
          cards.innerHTML = "";
          if (!newData || Object.keys(newData).length === 0) {
            preloader.style.display = "none";
            cards_actions.style.display = "block";

            cards_message.classList.add("d-block");
          } else {
            Object.keys(newData).forEach((newId) => {
              renderCard(newData[newId], newId);
            });
          }
        });
      })
      .catch((error) => {
        console.error(`Error removing card with ID ${id}:`, error);
      });
  }
});

// Get random Id
function generateRandomId(prefix) {
  const randomPart = Math.random()
    .toString(36)
    .substr(2, 8);
  const timestamp = new Date().getTime();
  return `${randomPart}-${timestamp}`;
}

// Add card
const form = document.querySelector(".add-card");

form.addEventListener("submit", async function(e) {
  e.preventDefault();
  e.stopPropagation();

  const id = generateRandomId();
  const name = form.card_name.value;
  const description = form.card_description.value;
  const img = form.card_img.files[0];

  // Get imageUrl from the img field (replace with your actual logic)
  const imageUrl = await getImageUrl(img);

  if (name.length > 0 && description.length > 0) {
    writeUserData(id, name, description, imageUrl);
    form.reset();
  }
});

async function getImageUrl(img) {
  const storage_img = storageRef(storage, `images/${img?.name}`);

  const snapshot = await uploadBytes(storage_img, img);
  const url = await getDownloadURL(snapshot.ref);

  return url;
}

function writeUserData(id, name, description, imageUrl) {
  const db = getDatabase();
  set(ref(db, "plants/" + id), {
    name: name,
    description: description,
    img: imageUrl,
  });
}

// Update card
document.addEventListener("click", function(event) {
  const editButton = event.target.closest(".btn-edit");
  if (editButton) {
    event.stopPropagation();
    let id = editButton.getAttribute("data-id");
    updateCard(id);
  }
});

function updateUserData(id, name, description, imageUrl) {
  update(ref(db, "plants/" + id), {
    name: name,
    description: description,
    img: imageUrl,
  });
}

async function formSubmitHandler(e, id) {
  e.preventDefault();
  e.stopPropagation();

  const form_edit = document.querySelector(".edit-card");
  const name = form_edit.edit_name.value;
  const description = form_edit.edit_description.value;

  // Access the file input directly from the form
  const img = form_edit.edit_img.files[0];
  const imageUrl = await getImageUrl(img);

  if ((name.length > 0 || description.length > 0) && img != undefined) {
    updateUserData(id, name, description, imageUrl);
    form_edit.reset();
  }
}

let previousFormSubmitHandler;

function updateCard(id) {
  const form_edit = document.querySelector(".edit-card");

  // Remove previous event listener, if any
  form_edit.removeEventListener("submit", previousFormSubmitHandler);

  // Create a new closure with the current id
  const currentFormSubmitHandler = function(e) {
    formSubmitHandler(e, id);
  };

  // Add a new event listener
  form_edit.addEventListener("submit", currentFormSubmitHandler);

  // Store the current event listener for removal later
  previousFormSubmitHandler = currentFormSubmitHandler;
}

function updateUI(data) {
  cards.innerHTML = "";
  data.forEach((item) => {
    renderCard(item, item.id);
  });
}

// Search
const searchForm = document.querySelector(".search_form");
searchForm.addEventListener("submit", function(e) {
  e.preventDefault();
  e.stopPropagation();

  const searchInput = searchForm.querySelector("input").value.trim();

  if (searchInput === "") {
    renderAllCards();
  } else {
    const options = {
      includeScore: true,
      keys: ["name"],
    };
    const fuse = new Fuse(list, options);
    const results = fuse.search(searchInput);

    renderSearchResults(results);
  }
});

// Add a separate event listener for the reset button
searchForm.addEventListener("reset", function() {
  renderAllCards();
});

function renderAllCards() {
  cards.innerHTML = "";

  if (Object.keys(originalData).length > 0) {
    Object.keys(originalData).forEach((id) => {
      renderCard(originalData[id], id);
    });
    cards_message.classList.remove("d-block");
  } else {
    cards_message.classList.add("d-block");
  }
}

function renderSearchResults(results) {
  cards.innerHTML = "";

  if (!results || results.length === 0) {
    cards_message.classList.add("d-block");
  } else {
    results.forEach(({ item }) => {
      renderCard(item, item.id);
    });
    cards_message.classList.remove("d-block");
  }
}

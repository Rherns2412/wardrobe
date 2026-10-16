
const starterClothes = [
  {
    id: 1,
    name: "White Shirt",
    category: "Tops",
    color: "White",
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    name: "Classic Denim",
    category: "Bottoms",
    color: "Blue",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    name: "Summer Dress",
    category: "Dresses",
    color: "Neutral",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    name: "Everyday Sneakers",
    category: "Shoes",
    color: "White",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 5,
    name: "Everyday Tote",
    category: "Accessories",
    color: "Brown",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 6,
    name: "Neutral Knit",
    category: "Tops",
    color: "Beige",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 7,
    name: "Tailored Trousers",
    category: "Bottoms",
    color: "Black",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 8,
    name: "Minimal Handbag",
    category: "Accessories",
    color: "Black",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80"
  }
];

const STORAGE_KEY = "closetMuseClothes";
const FAVORITES_KEY = "closetMuseFavorites";

function loadClothes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterClothes;
  } catch {
    return starterClothes;
  }
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

let clothes = loadClothes();
let favorites = loadFavorites();
let currentCategory = "All";

const grid = document.getElementById("clothesGrid");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clothes));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    alert("Storage is full. Try uploading smaller images.");
  }
}

function renderClothes() {
  const searchText = searchInput.value.toLowerCase().trim();

  const filtered = clothes.filter(item => {
    const matchesCategory =
      currentCategory === "All" ||
      item.category === currentCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText) ||
      item.color.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = "";

  emptyMessage.hidden = filtered.length > 0;

  filtered.forEach(item => {
    const isFavorite = favorites.includes(item.id);

    const card = document.createElement("article");
    card.className = "clothing-card";

    const imageBox = document.createElement("div");
    imageBox.className = "clothing-image";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;
    img.loading = "lazy";
    img.onerror = () => {
      img.onerror = null;
      img.src = "https://placehold.co/400x500/f0ede5/6e6256?text=Clothing";
    };

    const category = document.createElement("span");
    category.className = "clothing-category";
    category.textContent = item.category;

    const favoriteButton = document.createElement("button");
    favoriteButton.className =
      "favorite" + (isFavorite ? " saved" : "");
    favoriteButton.textContent = isFavorite ? "♥" : "♡";
    favoriteButton.setAttribute(
      "aria-label",
      isFavorite ? "Remove from favorites" : "Add to favorites"
    );

    favoriteButton.addEventListener("click", () => {
      if (favorites.includes(item.id)) {
        favorites = favorites.filter(id => id !== item.id);
      } else {
        favorites.push(item.id);
      }

      saveData();
      renderClothes();
    });

    imageBox.append(img, category, favoriteButton);

    const info = document.createElement("div");
    info.className = "clothing-info";

    const details = document.createElement("div");

    const name = document.createElement("h3");
    name.textContent = item.name;

    const color = document.createElement("p");
    color.textContent = item.color;

    details.append(name, color);
    info.appendChild(details);

    if (item.custom) {
      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-item";
      deleteButton.textContent = "Remove";

      deleteButton.addEventListener("click", () => {
        clothes = clothes.filter(cloth => cloth.id !== item.id);
        favorites = favorites.filter(id => id !== item.id);
        saveData();
        renderClothes();
      });

      info.appendChild(deleteButton);
    }

    card.append(imageBox, info);
    grid.appendChild(card);
  });
}

// Category filters
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(filter => {
      filter.classList.remove("active");
    });

    button.classList.add("active");
    currentCategory = button.dataset.category;
    renderClothes();
  });
});

// Search
searchInput.addEventListener("input", renderClothes);

// Upload clothing images
document.getElementById("imageUpload").addEventListener(
  "change",
  async event => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a JPG, PNG, or WebP image.");
        continue;
      }

      if (file.size > 1.5 * 1024 * 1024) {
        alert(file.name + " is too large. Maximum size is 1.5 MB.");
        continue;
      }

      const image = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      if (!image) continue;

      const name = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");

      clothes.unshift({
        id: Date.now() + Math.random(),
        name: name,
        category: "Tops",
        color: "My wardrobe",
        image: image,
        custom: true
      });
    }

    saveData();
    renderClothes();
    event.target.value = "";
  }
);

// Generate an outfit using wardrobe items
document.getElementById("generateBtn").addEventListener(
  "click",
  () => {
    const occasion = document.getElementById("occasion").value;
    const mood = document.getElementById("mood").value;

    const tops = clothes.filter(item => item.category === "Tops");
    const bottoms = clothes.filter(item => item.category === "Bottoms");
    const dresses = clothes.filter(item => item.category === "Dresses");
    const shoes = clothes.filter(item => item.category === "Shoes");
    const accessories = clothes.filter(
      item => item.category === "Accessories"
    );

    const seed = Date.now();

    function pick(items, offset = 0) {
      if (!items.length) return null;
      return items[Math.floor((seed / 1000 + offset) % items.length)];
    }

    let outfit = [];

    // Dresses can be styled as a complete main outfit piece.
    if (dresses.length && (occasion === "Date" || occasion === "Party")) {
      outfit.push(pick(dresses, 1));
    } else {
      if (tops.length) outfit.push(pick(tops, 2));
      if (bottoms.length) outfit.push(pick(bottoms, 3));
    }

    if (shoes.length) outfit.push(pick(shoes, 4));
    if (accessories.length) outfit.push(pick(accessories, 5));

    outfit = outfit.filter(Boolean);

    const result = document.getElementById("outfitResult");

    if (!outfit.length) {
      result.innerHTML = `
        <div class="result-placeholder">
          <span class="sparkle">✳</span>
          <h3>Your closet is waiting.</h3>
          <p>Add some clothing items to receive outfit suggestions.</p>
        </div>
      `;
      return;
    }

    const descriptions = {
      Everyday: "An easy look for everyday plans.",
      College: "A comfortable, campus-ready combination.",
      Work: "A polished combination for work or interviews.",
      Date: "A look for a special evening.",
      Party: "A look for your next celebration."
    };

    const moodDescriptions = {
      Minimal: "Keep the look clean and let each piece breathe.",
      Chic: "Style your pieces with a polished finish.",
      Comfort: "Prioritize easy, comfortable combinations.",
      Bold: "Make your look stand out with confident styling."
    };

    const title = document.createElement("h3");
    title.textContent = "Your " + occasion.toLowerCase() + " look.";

    const description = document.createElement("p");
    description.textContent =
      descriptions[occasion] + " " + moodDescriptions[mood];

    const itemsBox = document.createElement("div");
    itemsBox.className = "outfit-items";

    outfit.forEach(item => {
      const piece = document.createElement("div");
      piece.className = "outfit-piece";

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;

      const name = document.createElement("p");
      name.textContent = item.name;

      const category = document.createElement("small");
      category.textContent = item.category;

      piece.append(img, name, category);
      itemsBox.appendChild(piece);
    });

    const content = document.createElement("div");
    content.className = "generated-outfit";
    content.append(title, description, itemsBox);

    result.replaceChildren(content);
  }
);

// Display the initial wardrobe
renderClothes();

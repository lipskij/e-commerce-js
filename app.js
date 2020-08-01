const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "l2ke6s697lzd",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "kA4CGHy_yedOXuOiHoQIKP1qS6A16b-pVbc9cBreuDk",
});

// TODO: favorites with login/sign-up to save favorite products
// TODO: add login
// TODO: enable favorites after signup/login
// TODO: refactor code
// TODO: add favorites to database

// sign up btn
const signUp = document.querySelector('.banner-btn');

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
// favorites
const favoritescontent = document.querySelector(".favorites-content");
const favoritesDOM = document.querySelector(".favorites");
const favoritestOverlay = document.querySelector(".favorites-overlay");
const favoritesBtn = document.querySelector(".favorites-btn");
const closeFavBtn = document.querySelector(".close-favorites");
const favTotal = document.querySelector(".favorites-total");
const favItems = document.querySelector(".favorites-items");
const clearFavBtn = document.querySelector(".clear-favorites");

// sign up
signUp.addEventListener('click', (event) => {
  if (event.target === signUp) {
    window.location = "/signup.html";
  }
});

// favorites
let favorites = [];
// cart
let cart = [];
// buttons
let buttonsDOM = [];

// getting the products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: "bikeShopProducts",
      });

      // let result = await fetch('products.json');
      // let data = await result.json();

      let products = contentful.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
      <!-- single product -->
          <article class="product">
            <div class="img-container">
              <img 
                src=${product.image} 
                alt="product" 
                class="product-img"
              />
              <button class="fav-btn" data-id=${product.id}>
                <i class="fa fa-gratipay"></i>
                add
              </button>
              <button class="bag-btn" data-id=${product.id}>
                <i class="fa fa-shopping-cart"></i>
                add
              </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
          </article>
      `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add to the cart
        cart = [...cart, cartItem];
        // save the cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
      });
    });
  }
  // favorites
  getFavButtons() {
    const buttons = [...document.querySelectorAll(".fav-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inFavorites = favorites.find((item) => item.id === id);
      if (inFavorites) {
        button.innerText = `'Added'`;
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "Added";
        event.target.disabled = true;
        // get product from products
        let favoritesItem = { ...Storage.getProduct(id), amount: 1 };
        // add to the favorites
        favorites = [...favorites, favoritesItem];
        Storage.saveFav(favorites);
        this.setFavValues(favorites);
        // display favorite item
        this.addFavoritesItem(favoritesItem);
        // show the favorites
        this.showFavorites();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  // favorites
  setFavValues(favorites) {
    let tempTotal = 0;
    let itemsTotal = 0;
    favorites.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    favTotal.innerText = parseFloat(tempTotal.toFixed(2));
    favItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src="${item.image}" alt="product">
    <div>
      <h4>${item.title}</h4>
      <h5>${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div class="">
      <i class="fa fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fa fa-chevron-down" data-id=${item.id}></i>
    </div>`;
    cartContent.appendChild(div);
  }
  // favorites
  addFavoritesItem(item) {
    const div = document.createElement("div");
    div.classList.add("favorites-item");
    div.innerHTML = `<img src="${item.image}" alt="product">
    <div>
      <h4>${item.title}</h4>
      <h5>${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>`;
    favoritescontent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  // show favorites
  showFavorites() {
    favoritestOverlay.classList.add("transparentBcg");
    favoritesDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    favorites = Storage.getFav();
    this.setCartValues(cart);
    this.setFavValues(favorites);
    this.populateCart(cart);
    this.populateFav(favorites);
    cartBtn.addEventListener("click", this.showCart);
    favoritesBtn.addEventListener('click', this.showFavorites);
    closeCartBtn.addEventListener("click", this.hideCart);
    closeFavBtn.addEventListener("click", this.hideFavorites);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  // favorites
  populateFav(favorites) {
    favorites.forEach((item) => this.addFavoritesItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  // favorites
  hideFavorites() {
    favoritestOverlay.classList.remove("transparentBcg");
    favoritesDOM.classList.remove("showCart");
  }
  cartLogic() {
    // clear cart btn
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  // favorites
  favoritesLogic() {
    // clear favorites btn
    clearFavBtn.addEventListener("click", () => {
      this.clearFavorites();
    });
    // favorites functionality
    favoritescontent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        favoritescontent.removeChild(removeItem.parentElement.parentElement);
        this.removeFavItem(id);
      } else {
        favoritescontent.removeChild(lowerAmount.parentElement.parentElement);
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  // favorites
  clearFavorites() {
    let favoritesItems = favorites.map((item) => item.id);
    favoritesItems.forEach((id) => this.removeFavItem(id));
    while (favoritescontent.children.length > 0) {
      favoritescontent.removeChild(favoritescontent.children[0]);
    }
    this.hideFavorites();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fa fa-shopping-cart"></i>add`;
  }
  // favorties
  removeFavItem(id) {
    favorites = favorites.filter((item) => item.id !== id);
    this.setFavValues(favorites);
    Storage.saveFav(favorites);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fa fa-gratipay"></i>add`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
  //favorites
  static saveFav(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
  static getFav() {
    return localStorage.getItem("favorites")
      ? JSON.parse(localStorage.getItem("favorites"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setip app
  ui.setupAPP();
  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.cartLogic();
      ui.favoritesLogic();
      ui.getFavButtons();
      ui.getBagButtons();
    });
});

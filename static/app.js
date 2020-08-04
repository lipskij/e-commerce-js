const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "l2ke6s697lzd",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "kA4CGHy_yedOXuOiHoQIKP1qS6A16b-pVbc9cBreuDk",
});

// TODO: favorites with login/sign-up to save favorite products
// TODO: add login
// TODO: enable favorites after signup/login
// TODO: add favorites to database

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
const favoritesContent = document.querySelector(".favorites-content");
const favoritesDOM = document.querySelector(".favorites");
const favoritestOverlay = document.querySelector(".favorites-overlay");
const favoritesBtn = document.querySelector(".favorites-btn");
const closeFavBtn = document.querySelector(".close-favorites");
const favTotal = document.querySelector(".favorites-total");
const favItems = document.querySelector(".favorites-items");
const clearFavBtn = document.querySelector(".clear-favorites");

// favorites
let favorites = [];
// cart
let cart = [];
// buttons
let buttonsDOM = [];

class Cart extends EventTarget {
  constructor(cart = []) {
    super();
    this._cart = cart;
  }
  update() {
    this.dispatchEvent(new CustomEvent("update"))
  }
  set cart(newCart) {
    this._cart = newCart;
    this.update();
  }
  get cart() {
    return this._cart;
  }
}

class Favorites extends EventTarget {
  constructor(favorites = []) {
    super();
    this.favorites = favorites;
  }
  update() {
    this.dispatchEvent(new CustomEvent('update'))
  }
  set favorites(newFavorites) {
    this._favorites = newFavorites;
    this.update();
  }
  get favorites() {
    return this._favorites;
  }
}

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
  constructor() {
    this.cart = new Cart(Storage.getCart());
    this.favorites = new Favorites(Storage.getFav());

    this.setCartValues = this.setCartValues.bind(this);
    this.populateCart = this.populateCart.bind(this);

    this.cart.addEventListener('update', this.setCartValues);
    this.cart.addEventListener('update', this.populateCart);
    this.cart.addEventListener('update', (event) => Storage.saveCart(event.target.cart));
    this.cart.addEventListener('update', (event) => this.displayProducts(Storage.getProducts() || []))
    this.cart.addEventListener('update', () => {
      this.getBagButtons();
      this.getFavButtons();
    })

    this.cart.update();

    this.setFavValues = this.setFavValues.bind(this);
    this.populateFav = this.populateFav.bind(this);

    this.favorites.addEventListener('update', this.setFavValues);
    this.favorites.addEventListener('update', this.populateFav);
    this.favorites.addEventListener('update', (event) => Storage.saveFav(event.target.favorites));
    this.favorites.addEventListener('update', (event) => this.displayProducts(Storage.getProducts() || []))
    this.favorites.addEventListener('update', () => {
      this.getBagButtons();
      this.getFavButtons();
    })

    this.favorites.update();

    this.cartLogic();
    this.favoritesLogic();

    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
    favoritesBtn.addEventListener('click', this.showFavorites);
    closeFavBtn.addEventListener('click', this.hideFavorites);
  }
  displayProducts(products) {
    let result = products.reduce((acc, product) => {
      let inCart = this.cart.cart.find((item) => item.id === product.id);
      let inFavorites = this.favorites.favorites.find((item) => item.id === product.id);
      acc += `
      <!-- single product -->
          <article class="product">
            <div class="img-container">
              <img 
                src=${product.image} 
                alt="product" 
                class="product-img"
              />
              <button ${inFavorites ? 'disabled' : ''} class="fav-btn" data-id=${product.id}>
                <i class="fa fa-gratipay"></i>
                ${
                  inFavorites
                  ? "Added"
                  : "Add"
                }
              </button>
              <button ${inCart ? 'disabled' : ''} class="bag-btn" data-id=${product.id}>
                <i class="fa fa-shopping-cart"></i>
                ${
                  inCart
                  ? "In Cart"
                  : "Add"
                }
              </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
          </article>
      `;
      return acc;
    }, '');

    productsDOM.innerHTML = result;
  };
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      button.addEventListener("click", (event) => {
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add to the cart
        this.cart.cart = [...this.cart.cart, cartItem];
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
      button.addEventListener("click", (event) => {
        // get product from products
        let favoritesItem = { ...Storage.getProduct(id), amount: 1 };
        // add to the favorites
        this.favorites.favorites = [...this.favorites.favorites, favoritesItem];
        // show the favorites
        this.showFavorites();
      });
    });
  }
  setCartValues(event) {
    const cart = event.target.cart;
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.forEach((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  // favorites
  setFavValues(event) {
    const favorites = event.target.favorites;
    let tempTotal = 0;
    let itemsTotal = 0;
    favorites.forEach((item) => {
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
    favoritesContent.appendChild(div);
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

  populateCart(event) {
    const cart = event.target.cart;
    cartContent.innerHTML = '';
    cart.forEach((item) => this.addCartItem(item));
  }
  // favorites
  populateFav(event) {
    const favorites = event.target.favorites;
    favoritesContent.innerHTML = '';
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
      let id = event.target.dataset.id;

      if (event.target.classList.contains("remove-item")) {
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let tempItem = this.cart.cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        this.cart.update();
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let tempItem = this.cart.cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          this.cart.update();
        } else {
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
    favoritesContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        this.removeFavItem(id);
      }
    });
  }
  clearCart() {
    this.cart.cart = [];
    this.hideCart();
  }
  // favorites
  clearFavorites() {
    this.favorites.favorites = [];
    this.hideFavorites();
  }
  removeItem(id) {
    this.cart.cart = this.cart.cart.filter((item) => item.id !== id);
  }
  // favorties
  removeFavItem(id) {
    this.favorites.favorites = this.favorites.favorites.filter((item) => item.id !== id);
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
  static getProducts() {
    let products = JSON.parse(localStorage.getItem("products"));
    return products;
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
  const products = new Products();
  // get all products
  products
    .getProducts()
    .then((products) => {
      Storage.saveProducts(products);
      const ui = new UI();
    });
});

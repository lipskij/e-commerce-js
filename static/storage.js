// local storage

 export default class Storage {
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
  static loggedIn(logged) {
    return localStorage.setItem("logged", JSON.stringify(logged));
  }
  static isLoggedIn() {
    return localStorage.getItem("logged")
     ? JSON.parse(localStorage.getItem("logged"))
     : false;
  }
}
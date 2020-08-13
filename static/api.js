export function addToFavorite(id) {
  fetch("/favorites", {
    method: "POST",
    body: JSON.stringify({ productId: id }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function profile() {
  return fetch("/profile", {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r)=> r.json());
}

import { cookies } from "next/headers";
import { createCart } from "../lib/data";

async function setCartCookie(token: string) {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set("cart", token);
}

export default async function CartPage() {
  const cookieStore = await cookies();
  let cartToken = cookieStore.get("cart")?.value;
  const isNewToken = !cartToken;
  if (!cartToken) {
    const cartResponse = await createCart();
    if (cartResponse.success && cartResponse.data) {
      cartToken = cartResponse.data.token;
    }
  }

  const setCartCookieWithToken = setCartCookie.bind(null, cartToken ?? "");
  return (
    <div className="my-6">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      <p>Your cart ID is: {cartToken ?? "No cart token found"}</p>
      <p>{isNewToken ? "This is a new token." : "This is an existing token."}</p>
      {isNewToken && (
      <form action={setCartCookieWithToken} className="mt-4">
         {/*
       Learning: A cookie can only be set by a route hanbdler or a server action, so we need to have a form to persist this.
       This will get replaced later on by a legit form action, e.g. when adding a produc to a cart.
       */}
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-500"
        >
          Persist Token
        </button>
      </form>) }
    </div>
  );
}

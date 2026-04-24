# Dan Solovay's Vercel Certification Exercise

## Running Locally

Set these environment values based on information available in the assignment.

API_BASE_URL
VERCEL_PROTECTION_BYPASS

Then `pnpm dev` to view at localhost:3000.

Use `pnpm build` to confirm build process is clean.

## Publically accessing

Site: https://vercel-swag-store-ten.vercel.app/  
Repo: https://github.com/dsolovay/vercel-swag-store

## Things that work well

- Cart is snappy. Quantity updates and deletes are instant, and the user gets a clear indication that backend processing is still happening.
- Mobile design is clean and functional.
- Cart errors are handled well.
- Cart state is shown on a badge with a professional look.
- Code with access to API keys is marked server-only.
- Caching is in place with sensible limits.
- Inventory is looked up when the cart is rendered in a performant way, with Promise.All. It is used to clamp the inventory spinners per line item.
- Although inventory is random, it is treated as if real, with caching for seconds, and 
tag invalidation when a product is added or removed from a cart, or its quantity adjuted.

## Testing suggestions

- I've created environment variables to force error states, such as SIMULATE_DELETE_ERROR and SIMULATE_UPDATE_ERROR. These can be used to force the cart error state.
- You can manually change a cart cookie in dev tools.to force the 404 logic.

## Things to improve

- The pagination doesn't inform the user that a search is in flight. This could get fixed by using a transition, and passing the is pending state to the search page.
- Router.refresh() is called to force header shopping cart updates, but that causes the product detail page
and the shopping cart to do a slightly awkward refresh.
- Image is still a placeholder, and does't make use of "Art Direction" (separate image for mobile).
- I had the ambition of making this whole thing work without JS enabled on the browser. It's doable with a bit more rigor on the use of actions.


## Where I used AI

- Most of the tailwind, and almost all of the loading skin designs.
- Helping choose the correct hooks. For example, the standard pattern for useRef vs. useCallback, and that 
useOptimistic snaps back as soon as a transaction is done. 
- Adding the Pagination controller. This is someting I could hack out on my own, but using a MuiMaterials
one looked like a very nice presentation detail, and I got help with the exact syntax.
- I ran a propmt to see if I missed any test requirements, and it called out that I forgot to put metadata
on all pages.
- I ran a prompt to find repeated points and spelling errors in this document.  

## Where I did not use AI

- I'm pretty sure all the work of getting my API layer clean, and consolidating all the 404 logic into a clean abstraction, was entirely mine. 
- I devised a pattern to keep error messages from client code. Compare the ApiResponse type to the
`ServiceReponse` type.
- The general approach to cart state--trusting local as the source of truth.
- The approach to error handling. setError(true) worked really cleanly, as best as I can recall.

## Thanks
This was a great exercise, and greatly solidified my knowledge of Vercel, Next.js, TS and JS. Thanks for the chance to take part!

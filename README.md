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
- Cart state is shown on badge, that has a clean professional look.

## Testing suggestions

- I've created environment variables to force error states, such as SIMULATE_DELETE_ERROR and SIMULATE_UPDATE_ERROR. These can be used to force
the cart error state.
- You can manually change a cart cookie in dev tools.to force the 404 logic.

## Things to improve

- The pagination doesn't inform the user that a search is in flight. This could get fixed by using a transition, and passing the
is pending state to the search page.
- There's a reload of both the cart page when you empty it, and of the product detail page when you add an item, that is not as 
polished as I'd like. Neither is that jarring however.
- I never got to adding the Art Direction image behavior on the home page.
- I had the ambition of making this whole thing work without JS enabled on the browser. It's doable with a bit more rigor on the use of actions.


## Where I used AI

- Most of the tailwind, and designing loading skins.
- Helping me get out of a deep scary hole with cart state. My initial implementation showed a series of changing values. 
Then I tried using AbortController (based on React.dev docs), only to find out it's not supported by Server Actions. 
I finally landed on the pattern of having cart state be local, and showing in progress state by checking when returned
cart's total matched local. But I needed the AI to figure out some of the React details, like when to use `useRef` and 
when to `useCallback`. 
- Adding the Pagination controller. This seemed like something I could completely wrap my head around and could build an ugly one on 
my own. I decided to use AI to speed the integration of using MuiMaterials. The bot also had to explain to me that I couldn't put
a pager on a server component, for obvious reasons--it needs to deal with user clicks. 
- I ran this prompt, which caught the fact I was missing metadata on towo pages:
  ```
  You are a coach, whose job it is to make sure I've compleled an assignment correctly.

  I will give you the text of the assignment. Please make a short list of requirements I missed based on reading the code base. Mark each High, Medium, Low severity, and put them in a table.
  ```  
  Noteably, this was for review and planning. Fixing the gaps is on me.  

- Also, because I can't resist a moment of meta:

    ```
    Q: Don't edit. But are there any repetitive points in this README?

    A: Yes, one clear overlap: the AbortController/Server Actions discovery is mentioned in both sections.

    "Where I used AI": "Then I tried using AbortController (based on React.dev docs), only to find out it's not supported by Server Actions."
    "Where I did not use AI": "...and then I found out I couldn't send abort signals to ServerActions."
    The same realization is recounted twice. The first is part of the cart state narrative; the second is framed around the late-night reading session — but they're describing the same dead end.
    ```
    I don't care Claude. It was an emotional moment for me. 

## Where I did not use AI

- I'm pretty sure all the work of getting my API layer clean, and consolidating all the 404 logic into a clean abstraction, was
entirely Dan. I love nuts and bolts coding, and I miss the fact I don't get to do it anymore. "Find the missing abstraction!" as Mark Seemann
said in a SOLID course I took way back when. I got super fussy about keeping all the data.js components away from the client to avoid
leaking error messages, but didn't push that through everywhere, so for example Search calls the API layer directly. But you can see where I
was going with `APiResponse` vs `ServiceResponse` (the latter contains no error details).
- The general approach to cart state--trusting local as the source of truth.
- The approach to error handling. setError(true) worked really cleanly. I _think_ I came up with that, based on reading a lot
of React docs.  (I might have seen it in your course material though. I looked at a *lot* of examples.)
- Reading the `useActionState` React docs on a Tuesday night until well past midnight, trying to wrap my brain around how `startTransition`,
`useOptimistic`, and `AbortController` worked.  There was an 'aha!' moment when I thought I really had this, and then I found out I couldn't
send abort signals to ServerActions. 

## Thanks
This was a great exercise, and greatly solidified my knowledge of Vercel, Next.js, TS and JS. Thanks for the chance to take part!

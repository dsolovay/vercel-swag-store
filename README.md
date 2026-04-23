This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Vercel Exercise

### Implemented Features

* Handle stale cart cookies. You can verify by manually modifying a cookie. Terminal messages indicate that a new cart is generated.

### To do items

- [x] Consolidate 404 logic into a single abstraction.
- [x] Simplify handling of cart updates, with useTransition as
documented [here](https://react.dev/reference/react/useTransition#perform-non-blocking-updates-with-actions).
    - Per documentation, transitions can be used with useOptimistic.
    - Need clarity on sequencing issues as described [here](https://react.dev/reference/react/useTransition#my-state-updates-in-transitions-are-out-of-order).
- [ ] ~Progressive enhancment: make all pages work without JavaScript enabled.~ (Outside of assignment scope.)
- [ ] Error boundary
- [x] Bug: Going from home to cart errors (invalid create cart) if nothing in cart.
- [x] Feature: Add pagination to search.
    - [x] Add standard paging control.
    - [x] Ensure page set to 1 on facet change.
- [ ] Fix jank
    - [ ] Empty cart should settle on one state.
- [x] Use loading circle in Add to Cart button.
- [ ] Add product search images.
- [x] Add Cart loading skeleton.
- [X] Add search loading skeleton.
- [x] PDP Stock info loading skeleton.




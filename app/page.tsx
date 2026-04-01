import Hero from "@/app/components/hero";
import PromoBanner from "./components/promo-banner";

export default function Home() {
  return (
    <>
      <PromoBanner />
      <Hero title="Welcome to the Vercel Swag Store"
        description="Discover our exclusive collection of Vercel swag items, from stylish apparel to must-have accessories. Shop now and show off your Vercel pride!"
        callToAction={{ text: "Shop Now", href: "/search" }}
        image={{
          src :  "https://picsum.photos/800/400",
        alt : "Demo image from Lorem Picsum",
        width : 800,
        height : 400 
      }} />
    </>
  );
}

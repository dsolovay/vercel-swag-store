import PromoBanner from "./components/promo-banner";
import FeaturedProducts from "./components/FeaturedProduct";
import Hero from "@/app/components/Hero";

export default function Home() {
  
  if (process.env.SIMULATE_HOME_EXCEPTION?.toLowerCase() === "true") {
    throw new Error("Test error thrown from Home page.");
  }
  
  return (
    <div className="my-6">
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
      <FeaturedProducts />
    </div>
  );
}

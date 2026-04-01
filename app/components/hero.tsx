import Link from "next/link";
import Image from "next/image";

export type HeroProps ={
    title: string;
    description: string;
    callToAction: {
        text: string;
        href: string;
    };
    image?: {
        src: string;
        height: number;
        width: number;
        blurDataURL?: string;
        alt: string;
    };
}

export default function Hero({ title, description, callToAction, image }: HeroProps) {
    return (
        <div className="p-6 flex flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-bold max-w-2xl">{title}</h1>
            <p className="text-lg text-gray-600 max-w-2xl">{description}</p>
            <Link className="bg-gray-700 rounded-full px-5 py-2 text-white hover:bg-gray-600" href={callToAction.href}>{callToAction.text}</Link>
            {image && (<Image src={image.src} alt={image.alt} width={image.width} height={image.height} placeholder={image.blurDataURL ? 'blur' : undefined} blurDataURL={image.blurDataURL} />)}
        </div>
    );
}
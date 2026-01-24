"use client";

import Image from "next/image";

const galleryImages = [
  { src: "/assets/cuts-01.jpg", alt: "Haircut 1" },
  { src: "/assets/cuts-02.jpg", alt: "Haircut 2" },
  { src: "/assets/cuts-03.jpg", alt: "Haircut 3" },
  { src: "/assets/cuts-04.jpg", alt: "Haircut 4" },
  { src: "/assets/cuts-05.jpg", alt: "Haircut 5" },
  { src: "/assets/cuts-06.png", alt: "Haircut 6" },
  { src: "/assets/cuts-07.png", alt: "Haircut 7" },
  { src: "/assets/cuts-08.png", alt: "Haircut 8" },
  { src: "/assets/cuts-09.png", alt: "Haircut 9" },
  { src: "/assets/cuts-10.png", alt: "Haircut 10" },
  { src: "/assets/cuts-11.png", alt: "Haircut 11" },
  { src: "/assets/cuts-12.png", alt: "Haircut 12" },
];

export function GalleryGrid({ className }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto ${className ?? ""}`}
    >
      {galleryImages.map((image, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={400}
            height={400}
            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}

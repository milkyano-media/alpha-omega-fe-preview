"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Scissors } from "lucide-react";

// Barber data
const galleryBarbers = [
  {
    name: "CHRISTOS",
    badge: "Barber",
    image: "/assets/barbers/christos.jpg",
    thumbnail: "/assets/barbers-gallery/christos.jpg",
    description:
      "Barber since 2018, bringing creativity and precision from Greece to Australia. Founder of Alpha Omega — where authenticity meets luxury.",
  },
  // Add more barbers here when available
];

interface GalleryShowcaseProps {
  onBookNow?: () => void;
}

export function GalleryShowcase({ onBookNow }: GalleryShowcaseProps) {
  const [selectedBarber, setSelectedBarber] = useState(0);

  const handlePrevious = useCallback(() => {
    setSelectedBarber((prev) =>
      prev === 0 ? galleryBarbers.length - 1 : prev - 1
    );
  }, []);

  const handleNext = useCallback(() => {
    setSelectedBarber((prev) =>
      prev === galleryBarbers.length - 1 ? 0 : prev + 1
    );
  }, []);

  const handleCarouselItemClick = useCallback((index: number) => {
    setSelectedBarber(index);
  }, []);

  const currentBarber = galleryBarbers[selectedBarber];
  const displayName =
    currentBarber.name.charAt(0) + currentBarber.name.slice(1).toLowerCase();

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Image with White Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/gallery-showcase/gallery-showcase-bg.png"
          alt="Barbershop Background"
          fill
          className="object-cover"
          priority
        />
        {/* White overlay 90% opacity */}
        <div className="absolute inset-0 bg-white/90" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-screen-lg">
        <div className="flex flex-col items-center">
          {/* Title Image - "BARBERS" */}
          <div className="w-[280px] md:w-[400px] lg:w-[500px] mb-4 md:mb-6">
            <Image
              src="/assets/gallery-showcase/gallery-showcase-title.png"
              alt="Barbers"
              width={500}
              height={120}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Subtitle - "Meet Our Barber" */}
          <h2
            className="text-black text-xl md:text-xl lg:text-2xl mb-8 md:mb-12"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}
          >
            MEET OUR BARBERS
          </h2>

          {/* Preview Card */}
          <div className="relative w-[280px] md:w-[320px] lg:w-[360px] mb-6 md:mb-8">
            {/* Card Container with shadow */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/4]">
              {/* Barber Image */}
              <Image
                key={selectedBarber}
                src={currentBarber.image}
                alt={currentBarber.name}
                fill
                className="object-cover"
              />

              {/* Card Overlay - Gradient at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Logo - Top Left Corner */}
              <div className="absolute top-4 left-4">
                <Image
                  src="/assets/gallery-showcase/card/card-logo.svg"
                  alt="Alpha Omega"
                  width={50}
                  height={50}
                  className="opacity-70"
                />
              </div>

              {/* Barber Info - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                {/* Badge with Scissors Icon */}
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4">
                  <span className="text-white text-xs md:text-sm font-medium">
                    {currentBarber.badge}
                  </span>
                  <Scissors className="w-3.5 h-3.5 text-white -rotate-90" />
                </div>

                {/* Name */}
                <h3 className="text-white text-3xl md:text-3xl font-bold mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {currentBarber.name}
                </h3>

                {/* Description */}
                {currentBarber.description && (
                  <p
                    className="text-white/80 text-[10px] md:text-xs leading-relaxed pr-8"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {currentBarber.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onBookNow}
            className="mb-8 md:mb-12 px-8 py-3 md:px-10 md:py-4 rounded-full text-white font-semibold text-base md:text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            style={{
              background: "linear-gradient(to left, #1D1D1D, #737373)",
            }}
          >
            Book With {displayName}
          </button>

          {/* Carousel with Navigation */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Left Arrow Button */}
            <button
              onClick={handlePrevious}
              className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 transition-transform duration-200 hover:scale-110 cursor-pointer"
              aria-label="Previous barber"
            >
              <Image
                src="/assets/gallery-showcase/button/button-left-carousel.svg"
                alt="Previous"
                width={48}
                height={48}
                className="w-full h-full"
              />
            </button>

            {/* Carousel Items */}
            <div className="flex items-center gap-3 md:gap-4">
              {galleryBarbers.map((barber, index) => (
                <button
                  key={index}
                  onClick={() => handleCarouselItemClick(index)}
                  className={`relative transition-all duration-300 cursor-pointer ${
                    selectedBarber === index
                      ? "w-16 h-16 md:w-20 md:h-20 ring-2 ring-neutral-800 ring-offset-2"
                      : "w-14 h-14 md:w-16 md:h-16 opacity-60 hover:opacity-100"
                  } rounded-lg overflow-hidden`}
                >
                  <Image
                    src={barber.thumbnail}
                    alt={barber.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Right Arrow Button */}
            <button
              onClick={handleNext}
              className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 transition-transform duration-200 hover:scale-110 cursor-pointer"
              aria-label="Next barber"
            >
              <Image
                src="/assets/gallery-showcase/button/button-right-carousel.svg"
                alt="Next"
                width={48}
                height={48}
                className="w-full h-full"
              />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {galleryBarbers.map((_, index) => (
              <button
                key={index}
                onClick={() => handleCarouselItemClick(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 cursor-pointer ${
                  selectedBarber === index
                    ? "bg-neutral-800"
                    : "bg-neutral-400 hover:bg-neutral-600"
                }`}
                aria-label={`Go to barber ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

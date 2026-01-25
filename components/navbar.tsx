"use client";

import { useEffect, useState, useRef } from "react";
import { Menu } from "./menu";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [navHeight, setNavHeight] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.clientHeight);
    }
  }, []);

  return (
    <nav
      style={{ marginBottom: -navHeight }}
      ref={navRef}
      className="flex flex-col sticky top-0 bg-black/15 md:bg-black/15 backdrop-blur-xs z-navbar -mt-8"
    >
      {/* <div className="hidden md:flex justify-between items-center p-4 border-b border-[#DCDCDC] text-white">
        <div className="flex gap-8">
          <a href="#">Location</a>
          <a href="">+61 03 9012 5480</a>
        </div>

        <a href="#" className="w-7">
          <svg
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.776 0H8.22404C3.6893 0 0 3.6893 0 8.2241V21.776C0 26.3108 3.6893 30 8.22404 30H21.776C26.3108 30 30 26.3108 30 21.776V8.2241C30 3.6893 26.3108 0 21.776 0ZM28.2284 21.776C28.2284 25.3338 25.3339 28.2284 21.776 28.2284H8.22404C4.66617 28.2284 1.77164 25.3339 1.77164 21.776V8.2241C1.77164 4.66617 4.66617 1.77164 8.22404 1.77164H21.776C25.3339 1.77164 28.2284 4.66617 28.2284 8.2241V21.776Z"
              className="fill-white"
            />
            <path
              d="M15.0018 6.77173C10.4647 6.77173 6.77344 10.463 6.77344 15.0001C6.77344 19.5373 10.4646 23.2285 15.0018 23.2285C19.539 23.2285 23.2303 19.5372 23.2303 15C23.2303 10.4629 19.539 6.77173 15.0018 6.77173ZM15.0018 21.4569C11.4415 21.4569 8.54502 18.5603 8.54502 15C8.54502 11.4398 11.4415 8.54325 15.0018 8.54325C18.5621 8.54325 21.4587 11.4398 21.4587 15.0001C21.4587 18.5604 18.5621 21.4569 15.0018 21.4569Z"
              className="fill-white"
            />
            <path
              d="M23.7187 3.77954C22.3402 3.77954 21.2188 4.90108 21.2188 6.27956C21.2188 7.65804 22.3402 8.77952 23.7187 8.77952C25.0972 8.77952 26.2187 7.65798 26.2187 6.2795C26.2187 4.90103 25.0972 3.77954 23.7187 3.77954Z"
              className="fill-white"
            />
          </svg>
        </a>
      </div> */}

      <div className="flex justify-between items-center p-4">
        <Link href="/" className="w-28 md:w-40 ml-4 md:ml-8">
          <Image
            src="/assets/svg/navbar-logo.svg"
            alt="Alpha Omega"
            width={240}
            height={24}
            className="w-full h-auto"
            priority
          />
        </Link>

        <Menu />
      </div>

      {pathname === "/book/appointment" && (
        <div className="overflow-hidden whitespace-nowrap">
          <div className="flex animate-marquee">
            {/* First set of images */}
            <MarqueeItems />
            {/* Duplicate set for seamless loop */}
            <MarqueeItems />
          </div>
        </div>
      )}
    </nav>
  );
}

export function MarqueeItems() {
  return (
    <div className="flex md:gap-64 gap-16 shrink-0 md:mr-64 mr-16">
      {Array.from({ length: 4 }).map((_, i) => (
        <Image
          key={i}
          src="/assets/ao-pixelate-black.png"
          height={50}
          width={50}
          alt="alpha omega pixelate"
        />
      ))}
    </div>
  );
}

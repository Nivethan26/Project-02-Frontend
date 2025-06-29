"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import React from "react"

export default function CategoryCards() {
  const categories = [
    {
      title: "Pain Relievers",
      desc: "From headaches to muscle aches, we've got effective relief options for every need.",
      image: "/images/pain relievers.jpeg"
    },
    {
      title: "Allergy Medications",
      desc: "Don't let allergies hold you back.\nFind trusted solutions for indoor, outdoor, and year-round relief.",
      image: "/images/allergy.jpeg"
    },
    {
      title: "First Aid Supplies",
      desc: "Be ready for any emergency—shop our comprehensive first aid collection.",
      image: "/images/first aid.jpg"
    },
    {
      title: "Dental Care",
      desc: "Maintain a healthy smile with our dentist-recommended oral care essentials.",
      image: "/images/dental.jpg"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0)
  const [pause, setPause] = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1,
      spacing: 16,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 2, spacing: 20 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 24 },
      },
    },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel)
    },
    created(s) {
      setCurrentSlide(s.track.details.rel)
    },
  })

  // Autoplay effect
  React.useEffect(() => {
    if (!instanceRef.current) return
    if (pause) return
    timer.current = setInterval(() => {
      instanceRef.current?.next()
    }, 3500)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [pause, instanceRef])

  return (
    <section className="py-8 sm:py-12 bg-[#f9f9f9] px-1 sm:px-2">
      <div className="max-w-6xl mx-auto px-1 sm:px-4">
        <div
          className="keen-slider relative"
          ref={sliderRef}
          onMouseEnter={() => setPause(true)}
          onMouseLeave={() => setPause(false)}
        >
          {/* Overlay Arrows */}
          <button
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 bg-blue-600 text-white rounded-full p-2 sm:p-3 shadow hover:bg-blue-700 transition opacity-80 hover:opacity-100"
            style={{ minWidth: 36, minHeight: 36 }}
            onClick={() => instanceRef.current?.prev()}
            aria-label="Previous"
            tabIndex={0}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 bg-blue-600 text-white rounded-full p-2 sm:p-3 shadow hover:bg-blue-700 transition opacity-80 hover:opacity-100"
            style={{ minWidth: 36, minHeight: 36 }}
            onClick={() => instanceRef.current?.next()}
            aria-label="Next"
            tabIndex={0}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          {categories.map((c, i) => (
            <div
              key={i}
              className="keen-slider__slide flex flex-col"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-md min-h-[180px] sm:min-h-[260px] flex flex-col group transition-all duration-300 bg-white border border-gray-200 hover:-translate-y-2 hover:shadow-xl">
                {/* Image */}
                <div className="relative w-full h-28 sm:h-48">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {/* Card Content */}
                <div className="p-3 sm:p-6 flex flex-col justify-end">
                  <h3 className="font-bold text-base sm:text-xl mb-2 text-gray-900">{c.title}</h3>
                  <p className="text-xs sm:text-sm mb-4 sm:mb-6 text-gray-600 whitespace-pre-line">{c.desc}</p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition-colors duration-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm border border-transparent"
                  >
                    Explore Category
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {categories.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-300 focus:outline-none ${currentSlide === idx ? 'bg-blue-600 border-blue-600 scale-110' : 'bg-white border-blue-300'}`}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              tabIndex={0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

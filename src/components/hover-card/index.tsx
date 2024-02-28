"use client";
import React from "react";
import { EvervaultCard } from "../ui/evervault-card";
import { BackgroundGradient } from "../ui/background-gradient";

const cards = [
    {
        title: "Live Stock",
        description: "Dashboard for live stock data",
        tag: "Live Data Fetching",
        href: "/livestock",
    },
    {
        title: "Menu 2",
        description: "This is the second card",
        tag: "Second",
        href: "/",
    },
    {
        title: "Menu 3",
        description: "This is the third card",
        tag: "Third",
        href: "/",
    },
    {
        title: "Menu 4",
        description: "This is the fourth card",
        tag: "Fourth",
        href: "/",
    },
];

const PlaceholderCard = ({ card: { title, description, tag, href="/" } }: {card: {title: string, description: string, tag: string, href: string}}) => {
    return (
    <div>
    <BackgroundGradient className="rounded-[22px] p-4 sm:p-2 bg-black bg-opacity-70">
        <EvervaultCard text={title} href={href} />

      <h2 className="dark:text-white text-black pt-4 px-2">
        {description}
      </h2>
      <p className="inline-block text-sm border font-light dark:border-white/[0.2] border-black/[0.2] rounded-full mt-4 text-black dark:text-white px-2 py-0.5">
        {tag}
      </p>
    </BackgroundGradient>
    </div>
  )
}

const HoverCard = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 w-full h-full">
        {cards.map((card, index) => (
            <PlaceholderCard key={index} card={card} />
        ))}
        </div>
    )
}

export default HoverCard;
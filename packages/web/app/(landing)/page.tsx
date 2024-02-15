"use client";

import ScrollDown from "../animations/scrollDown";
import { IconContext } from "react-icons";
import { BsDiscord, BsTwitterX } from "react-icons/bs";
import localFont from "next/font/local";
import Pinwheel from "./pinwheel";
import Header from "../layout/header";

const microChat = localFont({ src: "../fonts/Micro_Chat.ttf" });

export default function Home() {
  return (
    <main className="w-full flex-1 flex flex-col justify-center shrink-0 px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-30">
        <Header />
      </div>

      <div className="hidden sm:absolute sm:flex bottom-8 left-8 flex flex-col gap-2 z-30 select-none">
        <div>
          <h3>An experiment by</h3>
        </div>
        <div className="flex">
          <div className="cursor-pointer rounded-full shadow w-11 h-11 z-30">
            <a href="https://twitter.com/0xWiz_" target="_blank">
              <img alt="wiz" className="object-cover rounded-full w-full h-full" src="/static/pfps/wiz.png" />
            </a>
          </div>
          <div className="cursor-pointer rounded-full w-11 h-11 -left-4 relative hover:z-30 hover:shadow">
            <a href="https://twitter.com/TM0B1L" target="_blank">
              <img alt="tm0b1l" className="object-cover rounded-full w-full h-full" src="/static/pfps/tmobil.jpeg" />
            </a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-4 right-4 sm:left-auto sm:right-8 flex gap-3 p-3 rounded-lg bg-gray-100 items-center z-30 border-b-1 border-l-1 select-none">
        <div className="rounded-lg">
          <img width={"50px"} className="aspect-square rounded-lg" src="/ex.svg" />
        </div>
        <div className="flex flex-col sm:mr-12 relative top-1">
          <div className="uppercase text-xs">an introduction</div>
          <h2>All about Plutocats</h2>
        </div>
        <div className="flex-1">
          <a
            target="_blank"
            className="px-3 py-3 bg-black text-white cursor-pointer rounded-lg transition-all hover:bg-opacity-80 text-sm sm:text-base float-right bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            href="https://mirror.xyz/tm0b1l.eth/URgZgA36Hhceg34yXbBOuwwcBRzV_416QATHX1pFu3k"
          >
            Learn more
          </a>
        </div>
      </div>
      <div className="absolute w-full h-full -top-16 left-1" style={{ opacity: "0.09" }}>
        <Pinwheel />
      </div>
      <div className="-translate-y-5 sm:-translate-y-10 flex flex-col gap-6 prose">
        <div className="flex flex-col mx-auto max-w-xl">
          <div className="flex items-center gap-1 mx-auto my-1 z-30 select-none text-sm">
            Coming to
            <a
              href="https://blast.io/en"
              target="_blank"
              className="border-b border-dashed border-transparent hover:border-black relative"
              style={{ top: "1px" }}
            >
              <img src="/static/bob.svg" width={70} />
            </a>
          </div>
          <div className="relative w-full text-center left-2 select-none">
            <h1
              className={`text-4xl sm:text-5xl z-20 font-semibold text-indigo-400 w-full relative ${microChat.className}`}
            >
              Plutocats
            </h1>
            <h1
              className={`text-4xl sm:text-5xl font-semibold text-indigo-700 w-full absolute top-1 ${microChat.className}`}
            >
              Plutocats
            </h1>
          </div>
          <p className={`mt-5 sm:mt-6 text-xl sm:text-2xl text-center leading-relaxed`}>A crypto cat collective</p>
        </div>
        <div className="flex gap-4 mx-auto">
          <a
            target="_blank"
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 font-semibold text-lg  flex gap-2 items-center transition"
            href="https://discord.gg/zdr66ETpSa"
          >
            <IconContext.Provider value={{ size: "1.1em" }}>
              <BsDiscord />
            </IconContext.Provider>
            Discord
          </a>
          <a
            target="_blank"
            className="rounded-lg bg-black hover:bg-opacity-80 text-white px-6 py-3 font-semibold text-lg flex gap-2 items-center transition"
            href="https://twitter.com/plutocatswtf"
          >
            <IconContext.Provider value={{ size: "0.9em" }}>
              <BsTwitterX />
            </IconContext.Provider>
            Twitter
          </a>
        </div>
        <div className="text-center select-none">
          <span className="relative font-semibold">WTF?</span>
          <ScrollDown />
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function Header() {
  return (
    <header className="justify-start flex items-center p-6 px-4 sm:px-6 w-full bg-transparent">
      <div className="w-full flex gap-6 items-center">
        <Link href="/" className="logo">
          <img
            alt="Plutocats Logo"
            src="/static/logo/green_pc.svg"
            width="48"
            height="auto"
            style={{ transform: "scale(1.16)" }}
          />
        </Link>
      </div>
      <div className="flex-1 flex items-center float-right justify-end min-w-[50%]">
        <nav className="w-full">
          <ul className="flex space-x-8 float-right"></ul>
        </nav>
      </div>
    </header>
  );
}

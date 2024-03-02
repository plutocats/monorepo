"use client";

import Link from "next/link";
import { Connect as ConnectButton } from "../components/connectButton";
import { useBalance } from "wagmi";
import * as dn from "dnum";
import { formatEther } from "viem";
import { explorerBaseURL } from "@/config";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data } = useBalance({ address: process.env.NEXT_PUBLIC_RESERVE! as `0x${string}` });
  const path = usePathname();

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
        <a
          className="hover:underline hidden sm:block"
          href={`${explorerBaseURL}address/${process.env.NEXT_PUBLIC_RESERVE!}`}
          target="_blank"
        >
          Reserve: <text className="text-sm">Ξ</text>
          {dn.format(dn.from(formatEther(data?.value || BigInt(0))), { digits: 3 })}
        </a>
      </div>
      <div className="flex-1 flex items-center float-right justify-end min-w-[50%]">
        <nav className="w-full">
          <ul className="flex space-x-8 float-right items-center">
            {path === "/mint" ? (
              <li>
                <ConnectButton />
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </header>
  );
}

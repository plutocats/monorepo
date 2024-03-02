"use client";

import { useEffect, useState } from "react";
import { getPendingCat, getFromSeed } from "@/lib/art";
import { NounSeed } from "@/lib/art/types";
import cx from "classnames";

export default function PlutocatArt({
  seed,
  block,
  hasError,
}: {
  seed: NounSeed | undefined;
  block: any;
  hasError: boolean;
}) {
  const [bn, setBN] = useState(Number(block?.number) || 0);
  const mockBNs = [1, 500, 4200, 75_000, 150_420];

  useEffect(() => {
    if (block === undefined) return;
    const anim = [...mockBNs, Number(block.number)];

    const interval = setInterval(() => {
      const rbn = anim[Math.floor(Math.random() * anim.length)];
      setBN(rbn);
    }, 75);

    return () => {
      clearInterval(interval);
    };
  }, [block]);

  const src = seed
    ? getFromSeed(seed).src
    : // default block hash onload
      getPendingCat(
        bn,
        block?.hash || "0x5014101691e81d79a2eba711e698118e1a90c9be7acb2f40d7f200134ee53e01",
        hasError ? "303030" : ""
      ).src;

  return <img className={cx(hasError && "bounce", "rounded-lg")} src={src} alt="who's that cat?!" width={480} />;
}

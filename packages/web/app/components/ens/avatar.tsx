"use client";

// @ts-ignore
import { normalize } from "viem/ens";
import { zorbImageDataURI } from "@/lib/zorb";
import { useEffect, useMemo, useState } from "react";
import { PublicClient } from "viem";

type Props = {
  address: string;
  name: string;
  client: PublicClient;
};

function Avatar(props: Props) {
  const [ensAvatar, setEnsAvatar] = useState<string>("");
  useEffect(() => {
    const fn = async () => {
      if (!props.name) return;

      try {
        // const name = await props.client.getEnsAvatar({ name: normalize(props.name) });
        // setEnsAvatar(name || "");
      } catch (e) {}
    };

    fn();
  }, [props.name]);

  const zorbImage = useMemo(() => zorbImageDataURI(props.address), [props.address]);

  // const zorbImage = "";
  const [image, setImage] = useState(zorbImage);
  useEffect(() => {
    if (ensAvatar) {
      setImage(ensAvatar);
    } else {
      setImage(zorbImage);
    }
  }, [ensAvatar, zorbImage]);

  return <img src={image} className="mr-1 h-4 w-4 rounded-full my-0" alt={props.address} />;
}

export default Avatar;

"use client";

import Lottie from "react-lottie";
import * as animationData from "./lottie/scroll-down.json";

export default function ScrollDown() {
  return (
    <div style={{ transform: "scale(2)" }}>
      <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData,
        }}
        height={25}
        width={25}
      />
    </div>
  );
}

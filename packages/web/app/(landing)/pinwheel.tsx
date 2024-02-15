"use client";

import { useEffect } from "react";
// @ts-ignore
import ShadertoyReact from "shadertoy-react";

const fs = `
// pinwheel inspired by https://www.shadertoy.com/view/MlSXWm
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (2.0*fragCoord.xy-iResolution.xy) / iResolution.y;
  vec2 center = vec2(0.0);
  float period = 4.0;
  float rotation = iTime * 6.0;
  float rotation1 = rotation + 3.;
      
  vec3 bg = vec3(1., 1., 1.);
  vec3 fg1 = vec3(0.506,0.553,0.973);
  vec3 fg2 = vec3(0.259,0.22,0.792);
  
  vec2 shift = uv - center;
  float shiftLen = length(shift);
  float shiftAtan = atan(shift.x, shift.y);
  
  float pct1 = smoothstep(0.1, 1.0, shiftLen);
  float pct2 = smoothstep(0.1 + .65*(sin(iTime*2.)), 1.0, shiftLen);
  
  vec3 fade1 = mix(fg1, bg, pct1);
  vec3 fade2 = mix(fg2, bg, pct2);
  
  float offset = rotation + shiftLen / 10.0;
  float x = sin(offset + shiftAtan * period);
  float val = smoothstep(0.1, 0.6, x);

  vec3 color = mix(bg, fade1, val);
  offset = rotation1 + shiftLen / 10.0;
  x = sin(offset + shiftAtan * period);
  val = smoothstep(0.4, 0.6, x);
  
  color = mix(color, fade2, val);
  fragColor = vec4(color, 1.0);
}
`;

export default function Pinwheel() {
  return <ShadertoyReact fs={fs} />;
}

"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_pulse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_res.x / u_res.y;

  vec2 m = u_mouse / u_res * 2.0 - 1.0;
  m.x *= u_res.x / u_res.y;

  float dist = length(p - m);
  float ripple = sin(dist * 6.0 - u_time * 1.8) * 0.25 * exp(-dist * 1.4) * (1.0 + u_pulse * 0.4);

  vec2 q = p + vec2(ripple);
  q += vec2(u_time * 0.025, sin(u_time * 0.15) * 0.05);

  float n = fbm(q * 1.4 + vec2(u_time * 0.04, 0.0));
  float n2 = fbm(q * 3.0 - vec2(0.0, u_time * 0.08));

  vec3 base = vec3(0.070, 0.075, 0.092);
  vec3 blue = vec3(0.678, 0.776, 1.000);
  vec3 green = vec3(0.259, 0.890, 0.333);

  vec3 col = base;
  col += blue * n * 0.06;
  col += green * n2 * 0.020;
  col += green * (1.0 - smoothstep(0.0, 0.5, dist)) * (0.030 + u_pulse * 0.02);
  col += blue * (1.0 - smoothstep(0.0, 0.9, dist)) * 0.012;

  float vignette = smoothstep(1.6, 0.3, length(p));
  col *= mix(0.7, 1.0, vignette);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function LiquidFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("[LiquidFlow] shader error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[LiquidFlow] link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uPulse = gl.getUniformLocation(prog, "u_pulse");

    const state = {
      mouse: [window.innerWidth / 2, window.innerHeight / 2],
      target: [window.innerWidth / 2, window.innerHeight / 2],
      pulse: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    };

    const onMove = (e: PointerEvent) => {
      state.target[0] = e.clientX;
      state.target[1] = window.innerHeight - e.clientY;
    };

    const onDown = () => {
      state.pulse = Math.min(state.pulse + 0.8, 1.5);
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * state.dpr);
      canvas.height = Math.floor(h * state.dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", resize);
    resize();

    const start = performance.now();
    let raf = 0;
    const loop = () => {
      state.mouse[0] += (state.target[0] - state.mouse[0]) * 0.06;
      state.mouse[1] += (state.target[1] - state.mouse[1]) * 0.06;
      state.pulse *= 0.94;
      const t = (performance.now() - start) * 0.001;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(
        uMouse,
        state.mouse[0] * state.dpr,
        state.mouse[1] * state.dpr,
      );
      gl.uniform1f(uPulse, state.pulse);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}

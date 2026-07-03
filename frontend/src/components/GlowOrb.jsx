import { useEffect, useRef } from 'react'

const VERTEX_SRC = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

// mode: "idle" | "thinking" | "answering" — biases the amber/violet mix
const FRAGMENT_SRC = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_mode;
varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec2 center = vec2(0.5, 0.5);

    float pulse = 0.5 + 0.5 * sin(u_time * 1.5);
    float dist = distance(uv, center);

    vec3 amber = vec3(0.957, 0.722, 0.376);  // #F4B860
    vec3 violet = vec3(0.424, 0.486, 0.878); // #6C7CE0

    float glow = exp(-dist * (4.0 + pulse * 2.0));
    vec3 color = mix(amber, violet, u_mode);

    gl_FragColor = vec4(color, glow * 0.8);
}`

function compileShader(gl, type, src) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader
}

/**
 * The companion's ambient presence — a breathing WebGL glow.
 * Kept as a standalone canvas module (own rAF loop, own GL context) so that
 * React re-renders elsewhere in the tree never tear down or restart it.
 * Only `mode` is read reactively, via a ref, to avoid re-mounting the canvas.
 */
export default function GlowOrb({ mode = 'idle', className = '' }) {
  const canvasRef = useRef(null)
  const modeRef = useRef(mode === 'thinking' ? 1 : 0)

  useEffect(() => {
    modeRef.current = mode === 'thinking' ? 1 : 0
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function syncSize() {
      const w = canvas.clientWidth || 80
      const h = canvas.clientHeight || 80
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }

    let resizeObserver
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize)
      resizeObserver.observe(canvas)
    }
    syncSize()

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return // graceful no-op if WebGL unavailable

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC)
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uRes = gl.getUniformLocation(program, 'u_resolution')
    const uMode = gl.getUniformLocation(program, 'u_mode')

    let rafId
    function render(t) {
      if (!resizeObserver) syncSize()
      gl.viewport(0, 0, canvas.width, canvas.height)
      if (uTime) gl.uniform1f(uTime, t * 0.001)
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height)
      if (uMode) gl.uniform1f(uMode, modeRef.current)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafId = requestAnimationFrame(render)
    }
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver?.disconnect()
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return (
    <div
      className={`rounded-full overflow-hidden shadow-[0_0_40px_rgba(248,188,99,0.2)] ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}

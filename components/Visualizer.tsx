
import React, { useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useMotion } from '../contexts/MotionContext.tsx';
import { AudioEngine } from '../services/AudioEngine';
import { CymaticMedium, XRSession } from '../types';

interface VisualizerProps {
    audioEngine: AudioEngine;
    isPlaying: boolean;
    mode?: 'spectrum' | 'waveform' | 'pulse' | 'fractal' | 'dmt' | 'quantum' | 'neural' | 'cosmic' | 'hyper' | 'symmetry' | 'galactic' | 'cyber' | 'sacred_geometry' | 'cymatics' | 'oscilloscope';
    complexity?: number;
    background?: string;
    hdEnabled?: boolean;
    cymaticMedium?: CymaticMedium;
    xrSession?: XRSession;
}

const VERTEX_SHADER = `#version 300 es
in vec4 position;
void main() { gl_Position = position; }`;

// --- FS_NEURAL: 3D Synaptic Voronoi (GOLD) ---
const FS_NEURAL = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_complexity;
uniform sampler2D u_audio;
uniform float u_eye;
out vec4 fragColor;

vec3 hash3( vec2 p ) {
    vec3 q = vec3( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)), dot(p,vec2(419.2,371.9)) );
    return fract(sin(q)*43758.5453);
}

float voronoi( in vec2 x, float time ) {
    vec2 p = floor( x );
    vec2 f = fract( x );
    float k = 1.0 + 63.0 * pow(1.0-0.0, 4.0);
    float va = 0.0;
    float wt = 0.0;
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ ) {
        vec2 g = vec2( float(i), float(j) );
        vec3 o = hash3( p + g ) * vec3(u_complexity, u_complexity, 1.0);
        vec2 r = g - f + o.xy;
        float d = dot(r,r);
        float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
        va += o.z * ww;
        wt += ww;
    }
    return va/wt;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
    uv.x += (u_eye - 0.5) * 0.05;
    float bass = texture(u_audio, vec2(0.01, 0.0)).r;
    
    // BIOTECH AMBER PALETTE
    float v = voronoi(uv * (4.0 + bass * 4.0), u_time);
    vec3 col = vec3(v * 1.0, v * 0.6, v * 0.1); // Amber Base
    col += vec3(bass * 0.8, bass * 0.2, 0.0); // Red/Orange Pulse
    
    fragColor = vec4(col, 1.0);
}`;

// --- FS_COSMIC: Volumetric Dark Matter (DEEP VIOLET) ---
const FS_COSMIC = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_complexity;
uniform float u_eye;
out vec4 fragColor;

float random (in vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_res.xy;
    uv.x += (u_eye - 0.5) * 0.01;
    vec3 col = vec3(0.0);
    
    float n = 0.0;
    vec2 pos = uv * (3.0 + u_complexity * 5.0);
    float t = u_time * 0.2;
    mat2 rot = mat2(cos(t), sin(t), -sin(t), cos(t));
    pos = rot * pos;
    
    n += noise(pos) * 0.5;
    n += noise(pos * 2.0) * 0.25;
    n += noise(pos * 4.0) * 0.125;
    
    // VOID PURPLE PALETTE
    col = mix(vec3(0.05, 0.05, 0.1), vec3(0.2, 0.0, 0.4), n * n);
    col += vec3(1.0, 0.7, 0.2) * smoothstep(0.6, 0.8, n) * 0.5; // Amber stars
    
    fragColor = vec4(col, 1.0);
}`;

// --- FS_HYPER: High-Velocity Optical Tunnel (WARM LIGHT) ---
const FS_HYPER = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform sampler2D u_audio;
uniform float u_eye;
out vec4 fragColor;
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
    uv.x += (u_eye - 0.5) * 0.1;
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float sound = texture(u_audio, vec2(0.1, 0.0)).r;
    
    // Warp Speed
    float t = u_time * 5.0;
    float grid = sin(20.0 / r + t) * sin(a * 10.0);
    
    vec3 col = vec3(0.0);
    col += vec3(1.0, 0.6, 0.1) * smoothstep(0.8, 1.0, grid); // Amber Lines
    col += vec3(1.0, 0.2, 0.0) * smoothstep(0.9, 1.0, grid) * sound; // Orange Pulse
    
    fragColor = vec4(col * r, 1.0);
}`;

// --- FS_SYMMETRY: Bioluminescent Lattice (AMBER/INDIGO MIX) ---
const FS_SYMMETRY = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_complexity;
uniform float u_eye;
out vec4 fragColor;
void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / u_res.y;
    uv.x += (u_eye - 0.5) * 0.02;
    vec3 finalColor = vec3(0.0);
    for (float i = 0.0; i < 4.0; i++) {
        uv = abs(uv);
        uv -= 0.5;
        uv *= 1.1;
        float d = length(uv);
        d = sin(d * 10.0 + u_time) / 10.0;
        d = 0.01 / abs(d);
        // Amber/Indigo contrast
        finalColor += vec3(0.2, 0.0, 0.5) * d * u_complexity; // Indigo Deep
        finalColor += vec3(1.0, 0.7, 0.0) * d * 0.3; // Amber Highlight
    }
    fragColor = vec4(finalColor, 1.0);
}`;

// --- FS_GALACTIC: Gravitational Singularity (FIRE) ---
const FS_GALACTIC = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_eye;
out vec4 fragColor;
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
    uv.x += (u_eye - 0.5) * 0.02;
    float d = length(uv);
    
    // Event Horizon
    float horizon = 0.2;
    float accretion = 0.01 / abs(d - horizon);
    
    // Lensing
    float angle = atan(uv.y, uv.x);
    float spiral = sin(angle * 5.0 + 10.0 * d - u_time * 2.0);
    
    vec3 col = vec3(1.0, 0.4, 0.1) * accretion * (0.5 + 0.5 * spiral);
    if (d < horizon) col = vec3(0.0); // Black hole center
    
    fragColor = vec4(col, 1.0);
}`;

// --- FS_CYBER: Tactical Terrain Scan (RETRO ORANGE) ---
const FS_CYBER = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_eye;
out vec4 fragColor;
void main() {
    vec2 uv = gl_FragCoord.xy / u_res.xy;
    uv.x += (u_eye - 0.5) * 0.02;
    uv.y = 1.0 - uv.y; // Flip Y
    
    vec3 col = vec3(0.0);
    
    // Horizon
    if (uv.y < 0.5) {
        vec2 p = (uv - 0.5) / (uv.y - 0.4);
        p.y += u_time * 2.0;
        
        float grid = max(
            smoothstep(0.95, 1.0, fract(p.x * 2.0)),
            smoothstep(0.95, 1.0, fract(p.y * 2.0))
        );
        
        // Distance fade
        float fog = pow(uv.y * 2.0, 2.0);
        col = vec3(1.0, 0.5, 0.0) * grid * fog; // Amber Grid
    }
    
    fragColor = vec4(col, 1.0);
}`;

// --- FS_DMT_HD: Hyper-Dimensional Architecture (GOLD) ---
const FS_DMT_HD = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform sampler2D u_audio;
uniform float u_complexity;
uniform float u_eye;
out vec4 fragColor;

// Box folding
void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
    uv.x += (u_eye - 0.5) * 0.05;
    
    vec3 p = vec3(uv, mod(u_time * 0.2, 10.0));
    float bass = texture(u_audio, vec2(0.05, 0.0)).r;
    
    vec3 col = vec3(0.0);
    
    // Iterative Folding
    for(int i=0; i<5; i++) {
        p = abs(p) - 0.5;
        p.xy *= mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5)); // Rotate
        float d = length(p.xy);
        float intensity = 0.02 / abs(d - 0.2 * bass);
        
        col += vec3(1.0, 0.8, 0.2) * intensity; // Gold
        col += vec3(0.3, 0.0, 0.4) * intensity * 0.3; // Violet shadow
    }
    
    fragColor = vec4(col * (0.2 + u_complexity), 1.0);
}`;

// --- CYMATICS SHADERS (Unchanged Physics, tuned rendering) ---
const FS_CYMATICS_SIM = `#version 300 es
precision highp float;
uniform sampler2D u_prev;
uniform sampler2D u_audio;
uniform vec2 u_res;
uniform float u_damping;
uniform float u_speed;
uniform float u_complexity;
uniform vec2 u_sources[4];
out vec4 fragColor;
void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    vec2 pixel = 1.0 / u_res;
    vec4 state = texture(u_prev, uv);
    float p = state.r;
    float prevP = state.g;
    
    float n = texture(u_prev, uv + vec2(0.0, pixel.y)).r;
    float s = texture(u_prev, uv + vec2(0.0, -pixel.y)).r;
    float e = texture(u_prev, uv + vec2(pixel.x, 0.0)).r;
    float w = texture(u_prev, uv + vec2(-pixel.x, 0.0)).r;
    float laplacian = n + s + e + w - 4.0 * p;
    
    float force = 0.0;
    for(int i=0; i<4; i++) {
        float d = length(uv - u_sources[i]);
        float spatialFreq = 50.0 + (u_complexity * 250.0); 
        float freqBand = 0.1 + float(i)*0.2 + (u_complexity * 0.1);
        float freqInfo = texture(u_audio, vec2(freqBand, 0.0)).r;
        force += freqInfo * (0.05 + u_complexity * 0.15) * smoothstep(0.1, 0.0, d) * cos(d * spatialFreq);
    }
    
    float velocity = (p - prevP);
    float newP = p + velocity * u_damping + (laplacian * u_speed) + force;
    newP *= 0.99; 
    newP = clamp(newP, -1.0, 1.0);
    fragColor = vec4(newP, p, 0.0, 1.0);
}`;

const FS_CYMATICS_RENDER = `#version 300 es
precision highp float;
uniform sampler2D u_sim;
uniform vec2 u_res;
uniform int u_medium;
out vec4 fragColor;
void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    float h = texture(u_sim, uv).r;
    vec2 pixel = 1.0 / u_res; 
    float h_x = texture(u_sim, uv + vec2(pixel.x, 0.0)).r - texture(u_sim, uv - vec2(pixel.x, 0.0)).r;
    float h_y = texture(u_sim, uv + vec2(0.0, pixel.y)).r - texture(u_sim, uv - vec2(0.0, pixel.y)).r;
    vec3 normal = normalize(vec3(-h_x * 10.0, -h_y * 10.0, 1.0));
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(normal, light), 0.0);
    vec3 col = vec3(0.0);
    if (u_medium == 0) col = mix(vec3(0.1), vec3(0.9, 0.8, 0.6), smoothstep(0.01, 0.0, abs(h)));
    else if (u_medium == 1) col = vec3(0.0, 0.3, 0.5) * diff + vec3(0.8) * pow(diff, 20.0);
    else if (u_medium == 2) col = vec3(0.8) * diff + vec3(1.0) * pow(diff, 10.0);
    else if (u_medium == 3) col = vec3(0.5+0.5*sin(h*10.0), 0.5, 0.5) * diff;
    else if (u_medium == 4) { col = vec3(0.1) * diff; if(h>0.1) col=vec3(0.0); }
    else if (u_medium == 5) col = vec3(0.5*h, 0.2, 1.0) + vec3(0.5,0.0,1.0)*abs(h)*5.0;
    else if (u_medium == 6) col = vec3(1.0, 0.8, 0.2) * diff + vec3(1.0) * pow(diff, 30.0);
    else if (u_medium == 7) col = vec3(0.2, 0.1, 1.0) / abs(h * 10.0);
    fragColor = vec4(col, 1.0);
}`;

export const Visualizer: React.FC<VisualizerProps> = ({ 
    audioEngine, isPlaying, mode = 'spectrum', complexity = 0.5, background = '#0B0C15', hdEnabled = false, cymaticMedium = 'water', xrSession 
}) => {
    const { theme } = useTheme();
    const { reduceMotion } = useMotion();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const colorsRef = useRef({ primary: '#00f3ff', secondary: '#bcff00', accent: '#ff00ea' });
    // Refs so render loops can react to these without re-initializing the canvas
    const reduceMotionRef = useRef(reduceMotion);
    reduceMotionRef.current = reduceMotion;
    const glCleanupRef = useRef<(() => void) | null>(null);
    const resizeHandlerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const style = getComputedStyle(document.body);
        colorsRef.current = {
            primary: style.getPropertyValue('--primary').trim() || '#00f3ff',
            secondary: style.getPropertyValue('--secondary').trim() || '#bcff00',
            accent: style.getPropertyValue('--accent').trim() || '#ff00ea',
        };
    }, [theme]);

    const animationRef = useRef<number | null>(null);
    const frameRef = useRef<number>(0);
    const geoRotRef = useRef<{x: number, y: number}>({x: 0, y: 0});
    
    const isWebGLMode = ['neural', 'cosmic', 'hyper', 'symmetry', 'galactic', 'cyber', 'dmt'].includes(mode) && hdEnabled;
    const isCymatics = mode === 'cymatics';
    const canvasKey = isCymatics ? 'cym' : isWebGLMode ? 'webgl' : '2d';

    useEffect(() => {
        if (!canvasRef.current) return;
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        // Free GPU resources from the previous mode before building new ones
        glCleanupRef.current?.();
        glCleanupRef.current = null;
        resizeHandlerRef.current = null;

        if (!isPlaying || !audioEngine.analyser) {
             const ctx = canvasRef.current.getContext('2d');
             if(ctx) {
                ctx.clearRect(0,0, canvasRef.current.width, canvasRef.current.height);
                if (background !== '#0B0C15') {
                    ctx.fillStyle = background || '#0B0C15';
                    ctx.fillRect(0,0, canvasRef.current.width, canvasRef.current.height);
                }
             }
             return;
        }

        if (xrSession) initXR(mode);
        else if (isCymatics) initCymatics();
        else if (isWebGLMode) initWebGL(mode);
        else initCanvas2D(mode);

        // Keep the canvas backing store in sync with layout (rotation, resize)
        const observer = new ResizeObserver(() => resizeHandlerRef.current?.());
        observer.observe(canvasRef.current);

        return () => {
            observer.disconnect();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            glCleanupRef.current?.();
            glCleanupRef.current = null;
            resizeHandlerRef.current = null;
        };
    }, [mode, complexity, background, hdEnabled, cymaticMedium, isPlaying, xrSession]);

    const initXR = async (currentMode: string) => {
         if (!audioEngine.analyser || !xrSession) return;
    };

    const initCymatics = () => {
        if (!audioEngine.analyser) {
            console.error('[Cymatics] No analyser available');
            return;
        }
        const canvas = canvasRef.current!;
        const gl = canvas.getContext('webgl2');
        if (!gl) {
            console.error('[Cymatics] WebGL2 not supported');
            return;
        }

        // Check for required extensions
        const ext = gl.getExtension("EXT_color_buffer_float");
        if (!ext) {
            console.error('[Cymatics] EXT_color_buffer_float not supported - falling back to basic rendering');
            // Fallback to 2D canvas rendering
            initCanvas2D('pulse');
            return;
        }

        const createProgram = (fsSrc: string) => {
            const vs = gl.createShader(gl.VERTEX_SHADER)!;
            gl.shaderSource(vs, VERTEX_SHADER);
            gl.compileShader(vs);
            if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
                console.error('[Cymatics] Vertex shader compile error:', gl.getShaderInfoLog(vs));
                return null;
            }

            const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
            gl.shaderSource(fs, fsSrc);
            gl.compileShader(fs);
            if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
                console.error('[Cymatics] Fragment shader compile error:', gl.getShaderInfoLog(fs));
                return null;
            }

            const p = gl.createProgram()!;
            gl.attachShader(p, vs);
            gl.attachShader(p, fs);
            gl.linkProgram(p);
            // Shaders are owned by the program once linked
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
                console.error('[Cymatics] Program link error:', gl.getProgramInfoLog(p));
                gl.deleteProgram(p);
                return null;
            }
            return p;
        };

        const simProg = createProgram(FS_CYMATICS_SIM);
        const renderProg = createProgram(FS_CYMATICS_RENDER);

        if (!simProg || !renderProg) {
            console.error('[Cymatics] Failed to create shader programs');
            return;
        }
        
        // Set canvas size
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);

        const textures: WebGLTexture[] = [];
        const fbos: WebGLFramebuffer[] = [];
        for(let i=0; i<2; i++) {
            const t = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, t);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 512, 512, 0, gl.RGBA, gl.HALF_FLOAT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            textures.push(t);
            const f = gl.createFramebuffer()!; gl.bindFramebuffer(gl.FRAMEBUFFER, f);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);

            // Check framebuffer status
            const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            if (status !== gl.FRAMEBUFFER_COMPLETE) {
                console.error('[Cymatics] Framebuffer incomplete:', status);
                return;
            }
            fbos.push(f);
        }
        
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(simProg, 'position');
        gl.enableVertexAttribArray(posLoc); gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const audioTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, audioTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        const data = new Uint8Array(audioEngine.analyser!.frequencyBinCount);

        glCleanupRef.current = () => {
            gl.deleteProgram(simProg);
            gl.deleteProgram(renderProg);
            textures.forEach(t => gl.deleteTexture(t));
            fbos.forEach(f => gl.deleteFramebuffer(f));
            gl.deleteBuffer(buf);
            gl.deleteTexture(audioTex);
        };
        resizeHandlerRef.current = () => {
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
        };

        const render = () => {
            if (!audioEngine.analyser) return;
            audioEngine.analyser.getByteFrequencyData(data);
            gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, audioTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, data.length, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
            
            gl.useProgram(simProg);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[frameRef.current % 2]);
            gl.viewport(0,0,512,512);
            gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, textures[(frameRef.current+1)%2]);
            gl.uniform1i(gl.getUniformLocation(simProg, 'u_prev'), 0);
            gl.uniform1i(gl.getUniformLocation(simProg, 'u_audio'), 2);
            gl.uniform2f(gl.getUniformLocation(simProg, 'u_res'), 512, 512);
            gl.uniform2fv(gl.getUniformLocation(simProg, 'u_sources'), [0.5, 0.5, 0.3, 0.3, 0.7, 0.3, 0.5, 0.7]);
            let damp = 0.98, speed = 0.1;
            if (cymaticMedium === 'mercury') { damp = 0.995; speed = 0.05; }
            else if (cymaticMedium === 'sand') { damp = 0.90; speed = 0.2; }
            // Reduced motion: slow wave propagation for a calmer surface
            if (reduceMotionRef.current) speed *= 0.4;
            gl.uniform1f(gl.getUniformLocation(simProg, 'u_damping'), damp);
            gl.uniform1f(gl.getUniformLocation(simProg, 'u_speed'), speed);
            gl.uniform1f(gl.getUniformLocation(simProg, 'u_complexity'), complexity || 0.5);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.useProgram(renderProg);
            gl.viewport(0,0,canvas.width, canvas.height);
            gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, textures[frameRef.current % 2]);
            gl.uniform1i(gl.getUniformLocation(renderProg, 'u_sim'), 0);
            gl.uniform1i(gl.getUniformLocation(renderProg, 'u_medium'), ['sand','water','mercury','oil','ferrofluid','plasma','gold','aether'].indexOf(cymaticMedium||'water'));
            gl.uniform2f(gl.getUniformLocation(renderProg, 'u_res'), canvas.width, canvas.height);
            
            const loc2 = gl.getAttribLocation(renderProg, 'position');
            gl.enableVertexAttribArray(loc2); gl.vertexAttribPointer(loc2, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            
            frameRef.current++;
            animationRef.current = requestAnimationFrame(render);
        };
        render();
    };

    const initWebGL = (currentMode: string) => {
        if (!audioEngine.analyser) {
            console.error(`[WebGL ${currentMode}] No analyser available`);
            return;
        }
        const canvas = canvasRef.current!;
        const gl = canvas.getContext('webgl2');
        if (!gl) {
            console.error(`[WebGL ${currentMode}] WebGL2 not supported - falling back to oscilloscope`);
            initCanvas2D('oscilloscope');
            return;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);

        let fsSrc = FS_NEURAL;
        if (currentMode === 'cosmic') fsSrc = FS_COSMIC;
        else if (currentMode === 'hyper') fsSrc = FS_HYPER;
        else if (currentMode === 'symmetry') fsSrc = FS_SYMMETRY;
        else if (currentMode === 'galactic') fsSrc = FS_GALACTIC;
        else if (currentMode === 'cyber') fsSrc = FS_CYBER;
        else if (currentMode === 'dmt') fsSrc = FS_DMT_HD;

        // Compile vertex shader with error checking
        const vs = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vs, VERTEX_SHADER);
        gl.compileShader(vs);
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
            console.error(`[WebGL ${currentMode}] Vertex shader compile error:`, gl.getShaderInfoLog(vs));
            initCanvas2D('oscilloscope');
            return;
        }

        // Compile fragment shader with error checking
        const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fs, fsSrc);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            console.error(`[WebGL ${currentMode}] Fragment shader compile error:`, gl.getShaderInfoLog(fs));
            initCanvas2D('oscilloscope');
            return;
        }

        // Link program with error checking
        const prog = gl.createProgram()!;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error(`[WebGL ${currentMode}] Program link error:`, gl.getProgramInfoLog(prog));
            initCanvas2D('oscilloscope');
            return;
        }
        gl.useProgram(prog);

        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(prog, 'position');
        gl.enableVertexAttribArray(posLoc); gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const audioTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, audioTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        const data = new Uint8Array(audioEngine.analyser!.frequencyBinCount);

        glCleanupRef.current = () => {
            gl.deleteProgram(prog);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(buf);
            gl.deleteTexture(audioTex);
        };
        resizeHandlerRef.current = () => {
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
        };

        // With reduced motion, advance shader time at a fraction of real speed —
        // same imagery, gentle movement. Audio reactivity is unaffected.
        let shaderTime = 0;
        let lastFrame: number | null = null;

        const render = (time: number) => {
            if (!audioEngine.analyser) return;
            const dt = lastFrame === null ? 0 : (time - lastFrame) * 0.001;
            lastFrame = time;
            shaderTime += dt * (reduceMotionRef.current ? 0.15 : 1);

            audioEngine.analyser.getByteFrequencyData(data);
            gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, audioTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, data.length, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1i(gl.getUniformLocation(prog, 'u_audio'), 0);
            gl.uniform2f(gl.getUniformLocation(prog, 'u_res'), canvas.width, canvas.height);
            gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), shaderTime);
            gl.uniform1f(gl.getUniformLocation(prog, 'u_complexity'), complexity || 0.5);
            gl.uniform1f(gl.getUniformLocation(prog, 'u_eye'), 0.5);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationRef.current = requestAnimationFrame(render);
        };
        animationRef.current = requestAnimationFrame(render);
    };

    const initCanvas2D = (currentMode: string) => {
        if (!audioEngine.analyser) return;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = { width: 0, height: 0 };
        const applySize = () => {
            const bounds = canvas.getBoundingClientRect();
            rect.width = bounds.width;
            rect.height = bounds.height;
            canvas.width = bounds.width * dpr;   // resets the 2D transform
            canvas.height = bounds.height * dpr;
            ctx.scale(dpr, dpr);
        };
        applySize();
        resizeHandlerRef.current = applySize;

        const bufferLength = audioEngine.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // BUFFERS FOR WAVEFORM
        const timeL = new Uint8Array(bufferLength);
        const timeR = new Uint8Array(bufferLength);
        const timeAux = new Uint8Array(bufferLength);
        const timeMaster = new Uint8Array(bufferLength);

        // FREQUENCY MEASUREMENT UTILITY (Zero Crossing)
        const measureFreq = (data: Uint8Array, sampleRate: number) => {
            let zeroCrossings = 0;
            let firstIndex = -1;
            let lastIndex = -1;
            const THRESHOLD = 5; // Noise gate
            
            for(let i = 1; i < data.length; i++) {
                if(data[i-1] < 128 && data[i] >= 128 && (data[i] - data[i-1] > THRESHOLD)) {
                    if(firstIndex === -1) firstIndex = i;
                    lastIndex = i;
                    zeroCrossings++;
                }
            }
            if(zeroCrossings < 2 || firstIndex === lastIndex) return 0;
            const numCycles = zeroCrossings - 1;
            const totalSamples = lastIndex - firstIndex;
            return sampleRate / (totalSamples / numCycles);
        };

        // RMS CALCULATOR (dB)
        const calculateRMS = (data: Uint8Array) => {
            let sum = 0;
            for(let i=0; i<data.length; i++) {
                const normalized = (data[i] - 128) / 128.0;
                sum += normalized * normalized;
            }
            const rms = Math.sqrt(sum / data.length);
            const db = 20 * Math.log10(rms + 1e-10); // + epsilon to avoid log(0)
            return Math.max(-60, db); // Clamp to noise floor
        };

        // TRIGGER FINDER (Stabilization)
        const getTriggerOffset = (data: Uint8Array) => {
            for(let i=0; i<data.length/2; i++) {
                if(data[i] < 128 && data[i+1] >= 128) return i;
            }
            return 0;
        };

        const render = () => {
            if (!audioEngine.analyser) return;
            audioEngine.analyser.getByteFrequencyData(dataArray);
            
            // Clean clear for transparency if needed
            ctx.clearRect(0,0, rect.width, rect.height);
            
            const cx = rect.width / 2, cy = rect.height / 2;
            const bass = dataArray[4] / 255.0;

            const { primary: primaryColor, secondary: secondaryColor, accent: accentColor } = colorsRef.current;

            ctx.lineWidth = 2; ctx.strokeStyle = primaryColor;

            if (currentMode === 'spectrum') {
                const barW = rect.width / bufferLength * 2.5;
                let x = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const h = (dataArray[i] / 255) * rect.height;
                    ctx.fillStyle = `hsla(${35 + i / 5}, 100%, 50%, 0.8)`; // Amber to Yellow HSL
                    ctx.fillRect(x, rect.height - h, barW, h);
                    x += barW + 1;
                }
            } 
            else if (currentMode === 'waveform') {
                // ... same logic as before ...
                if (audioEngine.analyserL && audioEngine.analyserR) {
                    audioEngine.analyserL.getByteTimeDomainData(timeL);
                    audioEngine.analyserR.getByteTimeDomainData(timeR);
                } else {
                    audioEngine.analyser.getByteTimeDomainData(timeL);
                    timeR.set(timeL);
                }

                const sliceWidth = rect.width / bufferLength;
                
                // Draw Left Channel
                ctx.beginPath(); ctx.strokeStyle = primaryColor; ctx.lineWidth = 2;
                let x = 0;
                for(let i = 0; i < bufferLength; i++) {
                    const v = timeL[i] / 128.0;
                    const y = v * rect.height / 2;
                    if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    x += sliceWidth;
                }
                ctx.stroke();

                // Draw Right Channel with composite blend
                ctx.globalCompositeOperation = 'screen';
                ctx.beginPath(); ctx.strokeStyle = secondaryColor; ctx.lineWidth = 2;
                x = 0;
                for(let i = 0; i < bufferLength; i++) {
                    const v = timeR[i] / 128.0;
                    const y = v * rect.height / 2;
                    if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    x += sliceWidth;
                }
                ctx.stroke();
                ctx.globalCompositeOperation = 'source-over';
            }
            else if (currentMode === 'oscilloscope') {
                // QUAD SPLIT VIEW WITH TRIGGERING & METERS
                const mainH = rect.height * 0.7;
                const subH = rect.height * 0.3;
                const subW = rect.width / 3;
                
                // Data Fetch
                const sampleRate = audioEngine.audioContext?.sampleRate || 44100;
                
                if (audioEngine.analyserL && audioEngine.analyserR && audioEngine.analyserAux) {
                    audioEngine.analyserL.getByteTimeDomainData(timeL);
                    audioEngine.analyserR.getByteTimeDomainData(timeR);
                    audioEngine.analyserAux.getByteTimeDomainData(timeAux);
                    audioEngine.analyser.getByteTimeDomainData(timeMaster);
                } else {
                    audioEngine.analyser.getByteTimeDomainData(timeL);
                    timeR.set(timeL); timeAux.set(timeL); timeMaster.set(timeL);
                }

                const drawScope = (data: Uint8Array, color: string, label: string, xOff: number, yOff: number, w: number, h: number, freq: number, rmsDb: number) => {
                    ctx.save();
                    ctx.translate(xOff, yOff);
                    
                    // Grid
                    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
                    ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
                    ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
                    ctx.stroke();
                    
                    // Label & Metrics
                    ctx.font = '10px monospace'; ctx.fillStyle = color; 
                    ctx.fillText(label, 10, 20);
                    
                    // Right Align: Freq & dB
                    ctx.textAlign = 'right';
                    const dbStr = rmsDb > -60 ? `${rmsDb.toFixed(1)} dB` : '-INF';
                    ctx.fillText(`${freq > 0 ? freq.toFixed(1) + ' Hz' : '--'} | ${dbStr}`, w - 10, 20);
                    ctx.textAlign = 'left';
                    
                    // RMS Bar (Vertical on right edge)
                    const rmsH = Math.max(0, (rmsDb + 60) / 60) * h;
                    ctx.fillStyle = color;
                    ctx.fillRect(w - 4, h - rmsH, 2, rmsH);

                    // Wave (Stabilized)
                    const triggerIdx = getTriggerOffset(data);
                    
                    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2;
                    const slice = w / (bufferLength / 2); // Show half buffer for zoom
                    let x = 0;
                    
                    // Prevent index out of bounds
                    const limit = Math.min(bufferLength, triggerIdx + (bufferLength/2));
                    
                    for(let i=triggerIdx; i<limit; i++) {
                        const v = data[i] / 128.0;
                        const y = v * h / 2;
                        if(i===triggerIdx) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                        x += slice;
                    }
                    ctx.stroke();
                    
                    // Border
                    ctx.strokeStyle = '#333'; ctx.strokeRect(0,0,w,h);
                    ctx.restore();
                };

                // Measurements
                const freqL = measureFreq(timeL, sampleRate);
                const rmsL = calculateRMS(timeL);
                const freqR = measureFreq(timeR, sampleRate);
                const rmsR = calculateRMS(timeR);
                const freqAux = measureFreq(timeAux, sampleRate);
                const rmsAux = calculateRMS(timeAux);

                // MAIN DISPLAY (CH4 - Master)
                ctx.save();
                ctx.translate(0, 0);
                
                // Grid
                ctx.strokeStyle = '#222'; ctx.lineWidth = 1;
                ctx.strokeRect(0,0, rect.width, mainH);
                
                // Lissajous (Phase) - Scaled 1.5x
                ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
                const lissaScale = mainH * 0.6; // Increased from 0.4
                const lissaCX = rect.width / 2;
                const lissaCY = mainH / 2;
                
                for(let i=0; i<bufferLength; i+=2) {
                    const x = ((timeL[i] - 128) / 128) * lissaScale;
                    const y = ((timeR[i] - 128) / 128) * lissaScale; 
                    if(i===0) ctx.moveTo(lissaCX + x, lissaCY + y); 
                    else ctx.lineTo(lissaCX + x, lissaCY + y);
                }
                ctx.stroke();
                
                // Zoomed Waveform Overlay (Master Mix)
                // Draw this faintly behind the Lissajous or distinct?
                // Let's draw it at the bottom of the main view
                ctx.beginPath(); ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)'; ctx.lineWidth = 3;
                const triggerM = getTriggerOffset(timeMaster);
                const sliceM = rect.width / (bufferLength/2);
                let xM = 0;
                const limitM = Math.min(bufferLength, triggerM + (bufferLength/2));
                for(let i=triggerM; i<limitM; i++) {
                    // Zoom Amplitude 3x
                    const v = (timeMaster[i] - 128) / 128.0;
                    const y = (v * 3.0 * (mainH / 2)) + (mainH / 2);
                    if(i===triggerM) ctx.moveTo(xM, y); else ctx.lineTo(xM, y);
                    xM += sliceM;
                }
                ctx.stroke();

                // Main Label
                ctx.font = '12px monospace'; ctx.fillStyle = '#FFF'; 
                ctx.fillText('CH4: MASTER PHASE & ZOOM', 15, 25);
                
                const beatFreq = Math.abs(freqR - freqL);
                if (beatFreq > 0 && beatFreq < 50) {
                    ctx.fillStyle = '#00E5FF';
                    ctx.fillText(`DETECTED BINAURAL BEAT: ${beatFreq.toFixed(2)} Hz`, 15, 45);
                }
                ctx.restore();

                // SUB PANELS
                const ySub = mainH;
                drawScope(timeL, primaryColor, 'CH1: LEFT', 0, ySub, subW, subH, freqL, rmsL);
                drawScope(timeR, secondaryColor, 'CH2: RIGHT', subW, ySub, subW, subH, freqR, rmsR);
                drawScope(timeAux, accentColor, 'CH3: AUX', subW*2, ySub, subW, subH, freqAux, rmsAux);
            }
            else if (currentMode === 'pulse') {
                const r = 50 + (bass * 150);
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 176, 0, ${0.2 + bass * 0.5})`; ctx.fill(); ctx.stroke();
            }
            else if (currentMode === 'fractal') {
                const depth = 4 + Math.floor(bass * 3);
                const drawTree = (x:number, y:number, len:number, a:number, d:number) => {
                    if(d===0) return;
                    const x2 = x + Math.cos(a)*len, y2 = y + Math.sin(a)*len;
                    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y2); ctx.strokeStyle = `hsl(${35 + d*10},100%,50%)`; ctx.stroke();
                    drawTree(x2,y2,len*0.7,a-0.5+bass,d-1); drawTree(x2,y2,len*0.7,a+0.5-bass,d-1);
                };
                drawTree(cx, rect.height, 100, -Math.PI/2, depth);
            }
            else if (currentMode === 'dmt') {
                ctx.save(); ctx.translate(cx, cy);
                for(let i=0; i<12; i++) {
                    ctx.rotate(Math.PI/6);
                    ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(50+bass*100,50,50,100,0,150);
                    ctx.strokeStyle = `hsl(${i*30+bass*360},80%,60%)`; ctx.stroke();
                }
                ctx.restore();
            }
            else if (currentMode === 'sacred_geometry') {
                 const motionScale = reduceMotionRef.current ? 0.25 : 1;
                 geoRotRef.current.x += 0.01 * (1+(complexity||0.5)) * motionScale;
                 geoRotRef.current.y += 0.02 * (1+(complexity||0.5)) * motionScale;
                 const v = [[-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1], [-1,-1,1], [1,-1,1], [1,1,1], [-1,1,1]];
                 const edges = [[0,1],[1,2],[2,3],[3,0], [4,5],[5,6],[6,7],[7,4], [0,4],[1,5],[2,6],[3,7]];
                 const scale = Math.min(rect.width, rect.height) * 0.25 * (1 + bass);
                 ctx.beginPath();
                 const proj = (p: number[]) => {
                    let x = p[0], y = p[1], z = p[2];
                    let x1 = x*Math.cos(geoRotRef.current.y) - z*Math.sin(geoRotRef.current.y);
                    let z1 = z*Math.cos(geoRotRef.current.y) + x*Math.sin(geoRotRef.current.y);
                    let y1 = y*Math.cos(geoRotRef.current.x) - z1*Math.sin(geoRotRef.current.x);
                    return [cx + x1*scale, cy + y1*scale];
                 };
                 edges.forEach(e => { const p1 = proj(v[e[0]]); const p2 = proj(v[e[1]]); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); });
                 ctx.stroke();
            }
            
            animationRef.current = requestAnimationFrame(render);
        };
        render();
    };

    return <canvas key={canvasKey} ref={canvasRef} className="w-full h-full" />;
};

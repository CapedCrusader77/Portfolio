import { useEffect, useRef } from 'react';

export function ContentBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Vertex shader
    const vertexShaderSource = `#version 300 es
      in vec2 a_position;
      out vec2 v_uv;

      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader - fluid organic effect
    const fragmentShaderSource = `#version 300 es
      precision highp float;

      in vec2 v_uv;
      out vec4 fragColor;

      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      // Simple noise function
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      // FBM for organic detail
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = v_uv;
        vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
        uv = (uv - 0.5) * aspect + 0.5;

        // Mouse influence
        vec2 mouse = u_mouse / u_resolution;
        mouse.y = 1.0 - mouse.y;
        float mouseDist = length(uv - mouse);
        float mouseEffect = smoothstep(0.5, 0.0, mouseDist);

        // Create flowing organic patterns
        vec2 flowUV = uv * 2.0;

        // Layer 1 - Base flow
        float n1 = fbm(flowUV + u_time * 0.1);
        float n2 = fbm(flowUV * 1.5 - u_time * 0.08 + 10.0);
        float n3 = fbm(flowUV * 2.0 + u_time * 0.12 + 20.0);

        // Layer 2 - Distortion
        vec2 distort = vec2(
          fbm(uv * 3.0 + u_time * 0.15 + n1),
          fbm(uv * 3.0 - u_time * 0.15 + n2)
        );

        // Layer 3 - Organic shapes
        float organic1 = fbm(uv * 1.5 + distort * 0.5 + u_time * 0.1);
        float organic2 = fbm(uv * 2.0 - distort * 0.3 + u_time * 0.08 + 50.0);

        // Layer 4 - Wave patterns
        float wave1 = sin(uv.x * 5.0 + u_time * 0.2 + organic1 * 3.0) * 0.5 + 0.5;
        float wave2 = sin(uv.y * 4.0 - u_time * 0.15 + organic2 * 3.0) * 0.5 + 0.5;
        float waves = (wave1 + wave2) * 0.5;

        // Layer 5 - Mouse interaction
        float mouseFlow = fbm(uv * 3.0 + mouse * 0.5 + u_time * 0.2);
        float mouseGlow = exp(-mouseDist * 3.0) * mouseEffect;

        // Combine all layers
        float combined = n1 * 0.3 + n2 * 0.2 + n3 * 0.15;
        combined += organic1 * 0.15 + organic2 * 0.1;
        combined += waves * 0.1;
        combined += mouseFlow * 0.1;
        combined += mouseGlow * 0.3;

        // Color palette - very subtle dark tones
        vec3 color1 = vec3(0.0, 0.0, 0.0);     // Pure black
        vec3 color2 = vec3(0.01, 0.01, 0.02);   // Very dark blue
        vec3 color3 = vec3(0.0, 0.01, 0.02);    // Very dark cyan
        vec3 color4 = vec3(0.01, 0.0, 0.02);    // Very dark purple

        // Mix colors based on noise - very subtle
        vec3 color = mix(color1, color2, n1 * 0.3);
        color = mix(color, color3, n2 * 0.2);
        color = mix(color, color4, organic1 * 0.15);

        // Add very subtle glow
        color += combined * vec3(0.02, 0.04, 0.06);

        // Add very subtle mouse glow
        color += mouseGlow * vec3(0.03, 0.05, 0.08);

        // Vignette
        float vignette = 1.0 - length(uv - 0.5) * 0.5;
        color *= vignette;

        // Ensure pure black base
        color = max(vec3(0.0), color - 0.01);

        fragColor = vec4(color, 1.0);
      }
    `;

    // Compile shaders
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Create geometry
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');

    // Mouse tracking
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let startTime = performance.now();
    const animate = () => {
      const time = (performance.now() - startTime) / 1000;

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#000000' }}
    />
  );
}

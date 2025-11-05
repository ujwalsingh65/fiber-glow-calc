import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const Simulation = () => {
  const [n1, setN1] = useState(1.48); // Core refractive index
  const [n2, setN2] = useState(1.46); // Cladding refractive index
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    fiber: THREE.Group;
    lightRays: THREE.Line[];
    animationId: number;
  } | null>(null);

  // Calculate numerical aperture and acceptance angle
  const numericalAperture = Math.sqrt(n1 * n1 - n2 * n2);
  const acceptanceAngle = (Math.asin(numericalAperture) * 180) / Math.PI;

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / 500,
      0.1,
      1000
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, 500);
    canvasRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
    pointLight2.position.set(-5, 5, -5);
    scene.add(pointLight2);

    // Create fiber optic cable
    const fiberGroup = new THREE.Group();

    // Core (inner cylinder)
    const coreGeometry = new THREE.CylinderGeometry(0.3, 0.3, 10, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      emissive: 0x00ffff,
      emissiveIntensity: 0.3,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.rotation.z = Math.PI / 2;
    fiberGroup.add(core);

    // Cladding (outer cylinder)
    const claddingGeometry = new THREE.CylinderGeometry(0.4, 0.4, 10, 32);
    const claddingMaterial = new THREE.MeshPhongMaterial({
      color: 0x4400ff,
      transparent: true,
      opacity: 0.2,
      emissive: 0x4400ff,
      emissiveIntensity: 0.1,
    });
    const cladding = new THREE.Mesh(claddingGeometry, claddingMaterial);
    cladding.rotation.z = Math.PI / 2;
    fiberGroup.add(cladding);

    scene.add(fiberGroup);

    // Create light rays
    const lightRays: THREE.Line[] = [];
    const createLightRay = (startAngle: number, color: number) => {
      const points: THREE.Vector3[] = [];
      const segments = 20;
      let currentPos = new THREE.Vector3(-5, 0, 0);
      let currentAngle = startAngle;
      const rayLength = 10 / segments;

      points.push(currentPos.clone());

      for (let i = 0; i < segments; i++) {
        const nextPos = currentPos.clone();
        nextPos.x += rayLength * Math.cos(currentAngle);
        nextPos.y += rayLength * Math.sin(currentAngle);

        // Check if ray hits boundary (simplified)
        if (Math.abs(nextPos.y) > 0.25) {
          // Total internal reflection
          currentAngle = -currentAngle;
          nextPos.y = nextPos.y > 0 ? 0.25 : -0.25;
        }

        points.push(nextPos);
        currentPos = nextPos;
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 2,
        transparent: true,
        opacity: 0.8,
      });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      lightRays.push(line);
    };

    // Create multiple light rays at different angles
    const maxAngle = (acceptanceAngle * Math.PI) / 180;
    createLightRay(maxAngle * 0.3, 0x00ffff);
    createLightRay(maxAngle * 0.6, 0xff00ff);
    createLightRay(-maxAngle * 0.4, 0x00ff88);
    createLightRay(maxAngle * 0.8, 0xffff00);

    // Animation
    let time = 0;
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate fiber slightly
      fiberGroup.rotation.y = Math.sin(time * 0.5) * 0.1;

      // Animate light rays (pulsing effect)
      lightRays.forEach((ray, index) => {
        const material = ray.material as THREE.LineBasicMaterial;
        material.opacity = 0.5 + Math.sin(time * 2 + index) * 0.3;
      });

      renderer.render(scene, camera);
      
      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }
    };
    animate();

    sceneRef.current = {
      scene,
      camera,
      renderer,
      fiber: fiberGroup,
      lightRays,
      animationId: 0,
    };

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / 500;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, 500);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.renderer.dispose();
        canvasRef.current?.removeChild(sceneRef.current.renderer.domElement);
      }
    };
  }, []);

  // Update light rays when refractive indices change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove old light rays
    sceneRef.current.lightRays.forEach((ray) => {
      sceneRef.current!.scene.remove(ray);
    });
    sceneRef.current.lightRays = [];

    // Create new light rays with updated angles
    const createLightRay = (startAngle: number, color: number) => {
      const points: THREE.Vector3[] = [];
      const segments = 20;
      let currentPos = new THREE.Vector3(-5, 0, 0);
      let currentAngle = startAngle;
      const rayLength = 10 / segments;

      points.push(currentPos.clone());

      for (let i = 0; i < segments; i++) {
        const nextPos = currentPos.clone();
        nextPos.x += rayLength * Math.cos(currentAngle);
        nextPos.y += rayLength * Math.sin(currentAngle);

        if (Math.abs(nextPos.y) > 0.25) {
          currentAngle = -currentAngle;
          nextPos.y = nextPos.y > 0 ? 0.25 : -0.25;
        }

        points.push(nextPos);
        currentPos = nextPos;
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 2,
        transparent: true,
        opacity: 0.8,
      });
      const line = new THREE.Line(geometry, material);
      sceneRef.current!.scene.add(line);
      sceneRef.current!.lightRays.push(line);
    };

    const maxAngle = (acceptanceAngle * Math.PI) / 180;
    createLightRay(maxAngle * 0.3, 0x00ffff);
    createLightRay(maxAngle * 0.6, 0xff00ff);
    createLightRay(-maxAngle * 0.4, 0x00ff88);
    createLightRay(maxAngle * 0.8, 0xffff00);
  }, [n1, n2, acceptanceAngle]);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-bold glow-text">
              3D Fiber Optic Simulation
            </h1>
            <p className="text-xl text-muted-foreground">
              Interactive visualization of light propagation through optical fiber
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glow-card border-primary/30">
              <CardHeader>
                <CardTitle className="text-primary">Control Panel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-foreground">Core Refractive Index (n₁)</Label>
                    <span className="text-primary font-mono font-bold">{n1.toFixed(3)}</span>
                  </div>
                  <Slider
                    value={[n1]}
                    onValueChange={(value) => setN1(value[0])}
                    min={1.44}
                    max={1.52}
                    step={0.001}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-foreground">Cladding Refractive Index (n₂)</Label>
                    <span className="text-secondary font-mono font-bold">{n2.toFixed(3)}</span>
                  </div>
                  <Slider
                    value={[n2]}
                    onValueChange={(value) => setN2(Math.min(value[0], n1 - 0.001))}
                    min={1.42}
                    max={1.50}
                    step={0.001}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Note: n₂ must be less than n₁ for total internal reflection
                  </p>
                </div>

                <div className="pt-6 space-y-4 border-t border-border">
                  <div className="bg-muted/30 p-4 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">Numerical Aperture</p>
                    <p className="text-3xl font-bold text-primary glow-text">
                      {numericalAperture.toFixed(4)}
                    </p>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg border border-secondary/20">
                    <p className="text-sm text-muted-foreground mb-2">Acceptance Angle</p>
                    <p className="text-3xl font-bold text-secondary glow-text">
                      {acceptanceAngle.toFixed(2)}°
                    </p>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">Full Cone Angle</p>
                    <p className="text-3xl font-bold text-primary glow-text">
                      {(acceptanceAngle * 2).toFixed(2)}°
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glow-card border-secondary/30">
              <CardHeader>
                <CardTitle className="text-secondary">3D Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={canvasRef} 
                  className="w-full h-[500px] rounded-lg border border-primary/20 bg-background/50"
                />
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-cyan-400 rounded"></span>
                    <span>Core (n₁ = {n1.toFixed(3)})</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-purple-500 opacity-50 rounded"></span>
                    <span>Cladding (n₂ = {n2.toFixed(3)})</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400 rounded"></span>
                    <span>Light rays showing total internal reflection</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glow-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary">Calculation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Numerical Aperture Formula:</h4>
                  <div className="bg-muted/30 p-4 rounded-lg border border-primary/20">
                    <p className="font-mono text-primary">NA = √(n₁² - n₂²)</p>
                    <p className="font-mono text-sm mt-2">= √({n1.toFixed(3)}² - {n2.toFixed(3)}²)</p>
                    <p className="font-mono text-sm">= √({(n1*n1).toFixed(6)} - {(n2*n2).toFixed(6)})</p>
                    <p className="font-mono text-sm">= √{(n1*n1 - n2*n2).toFixed(6)}</p>
                    <p className="font-mono text-sm font-bold text-primary">= {numericalAperture.toFixed(4)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Acceptance Angle Formula:</h4>
                  <div className="bg-muted/30 p-4 rounded-lg border border-secondary/20">
                    <p className="font-mono text-secondary">θₐ = arcsin(NA)</p>
                    <p className="font-mono text-sm mt-2">= arcsin({numericalAperture.toFixed(4)})</p>
                    <p className="font-mono text-sm font-bold text-secondary">= {acceptanceAngle.toFixed(2)}°</p>
                    <p className="font-mono text-sm mt-3">Full cone angle = 2θₐ</p>
                    <p className="font-mono text-sm font-bold text-secondary">= {(acceptanceAngle * 2).toFixed(2)}°</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-primary/10">
                <p className="text-sm text-foreground/80">
                  <strong className="text-primary">Note:</strong> The 3D visualization shows light rays propagating through the fiber core 
                  via total internal reflection. Rays entering within the acceptance cone (±{acceptanceAngle.toFixed(2)}°) 
                  remain confined to the core, while rays outside this angle would leak into the cladding.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Simulation;

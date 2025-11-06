import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const Simulation = () => {
  const [n1, setN1] = useState(1.48); // Core refractive index
  const [n2, setN2] = useState(1.46); // Cladding refractive index
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    fiber: THREE.Group;
    lightRays: THREE.Group[];
    acceptedRays: THREE.Group[];
    rejectedRays: THREE.Group[];
    acceptanceCone: THREE.Mesh;
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
      canvasRef.current.clientWidth / 700,
      0.1,
      1000
    );
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasRef.current.clientWidth, 700);
    canvasRef.current.appendChild(renderer.domElement);

    // Add OrbitControls for interactive camera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;

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

    // Core (inner cylinder) - glass-like appearance
    const coreGeometry = new THREE.CylinderGeometry(0.3, 0.3, 10, 32);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ddff,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.1,
      emissive: 0x00ffff,
      emissiveIntensity: 0.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.rotation.z = Math.PI / 2;
    fiberGroup.add(core);

    // Cladding (outer cylinder) - darker glass
    const claddingGeometry = new THREE.CylinderGeometry(0.4, 0.4, 10, 32);
    const claddingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6633cc,
      transparent: true,
      opacity: 0.15,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0x4400ff,
      emissiveIntensity: 0.15,
    });
    const cladding = new THREE.Mesh(claddingGeometry, claddingMaterial);
    cladding.rotation.z = Math.PI / 2;
    fiberGroup.add(cladding);

    // Add light source (sodium lamp) at fiber entrance
    const lightSource = new THREE.PointLight(0xffdd00, 3, 10);
    lightSource.position.set(-6.5, 0, 0);
    scene.add(lightSource);

    // Visual representation of light source
    const sourceGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const sourceMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdd00,
      transparent: true,
      opacity: 0.9,
    });
    const sourceMesh = new THREE.Mesh(sourceGeometry, sourceMaterial);
    sourceMesh.position.copy(lightSource.position);
    scene.add(sourceMesh);

    // Add glow effect to light source
    const glowGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdd00,
      transparent: true,
      opacity: 0.3,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.copy(lightSource.position);
    scene.add(glowMesh);

    scene.add(fiberGroup);

    // Create acceptance cone at fiber entrance (more prominent)
    const coneAngle = (acceptanceAngle * Math.PI) / 180;
    const coneHeight = 2.5;
    const coneRadius = Math.tan(coneAngle) * coneHeight;
    const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 32, 1, true);
    const coneMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      emissive: 0x00ff88,
      emissiveIntensity: 0.4,
    });
    const acceptanceCone = new THREE.Mesh(coneGeometry, coneMaterial);
    acceptanceCone.position.set(-5 - coneHeight / 2, 0, 0);
    acceptanceCone.rotation.z = -Math.PI / 2;
    scene.add(acceptanceCone);

    // Add bright wireframe to acceptance cone
    const wireframeGeometry = new THREE.EdgesGeometry(coneGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff88, 
      opacity: 0.8, 
      transparent: true,
      linewidth: 2
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    acceptanceCone.add(wireframe);

    // Add cone base circle for better visualization
    const circleGeometry = new THREE.RingGeometry(coneRadius - 0.02, coneRadius + 0.02, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.position.set(-5 - coneHeight, 0, 0);
    circle.rotation.y = Math.PI / 2;
    scene.add(circle);

    // Create light rays at different incident angles
    const acceptedRays: THREE.Group[] = [];
    const rejectedRays: THREE.Group[] = [];
    const allLightRays: THREE.Group[] = [];

    const createLightRay = (incidentAngle: number, isAccepted: boolean) => {
      const rayGroup = new THREE.Group();
      const points: THREE.Vector3[] = [];
      const segments = isAccepted ? 25 : 5;
      let currentPos = new THREE.Vector3(-6, 0, 0);
      let currentAngle = incidentAngle;
      const rayLength = isAccepted ? 11 / segments : 1;

      points.push(currentPos.clone());

      if (isAccepted) {
        // Light propagates through the fiber with total internal reflection
        for (let i = 0; i < segments; i++) {
          const nextPos = currentPos.clone();
          nextPos.x += rayLength * Math.cos(currentAngle);
          nextPos.y += rayLength * Math.sin(currentAngle);

          // Check if ray hits core boundary
          if (Math.abs(nextPos.y) > 0.28) {
            // Total internal reflection
            currentAngle = -currentAngle;
            nextPos.y = nextPos.y > 0 ? 0.28 : -0.28;
          }

          points.push(nextPos);
          currentPos = nextPos;
        }
      } else {
        // Light refracts out of the fiber
        const refractAngle = incidentAngle * 1.5; // Simplified refraction
        currentPos.x += rayLength * Math.cos(refractAngle);
        currentPos.y += rayLength * Math.sin(refractAngle);
        points.push(currentPos.clone());
      }

      // Create the light ray line with enhanced colors
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: isAccepted ? 0xffdd00 : 0xff3333, // Yellow for guided, red for lost
        linewidth: 3,
        transparent: true,
        opacity: 1.0,
      });
      const line = new THREE.Line(geometry, material);
      rayGroup.add(line);

      // Add strong glowing effect
      if (isAccepted) {
        // Bright yellow glow for guided rays
        const glowMaterial1 = new THREE.LineBasicMaterial({
          color: 0xffdd00,
          transparent: true,
          opacity: 0.5,
          linewidth: 8,
        });
        const glowLine1 = new THREE.Line(geometry.clone(), glowMaterial1);
        rayGroup.add(glowLine1);

        // Outer cyan glow
        const glowMaterial2 = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.3,
          linewidth: 12,
        });
        const glowLine2 = new THREE.Line(geometry.clone(), glowMaterial2);
        rayGroup.add(glowLine2);
      } else {
        // Red glow for rejected rays
        const glowMaterial = new THREE.LineBasicMaterial({
          color: 0xff3333,
          transparent: true,
          opacity: 0.4,
          linewidth: 6,
        });
        const glowLine = new THREE.Line(geometry.clone(), glowMaterial);
        rayGroup.add(glowLine);
      }

      scene.add(rayGroup);
      allLightRays.push(rayGroup);
      
      if (isAccepted) {
        acceptedRays.push(rayGroup);
      } else {
        rejectedRays.push(rayGroup);
      }
    };

    // Create rays within and outside acceptance angle
    const maxAcceptanceAngle = (acceptanceAngle * Math.PI) / 180;
    
    // Accepted rays (within acceptance angle)
    createLightRay(0, true); // Straight ray
    createLightRay(maxAcceptanceAngle * 0.4, true);
    createLightRay(maxAcceptanceAngle * 0.7, true);
    createLightRay(-maxAcceptanceAngle * 0.5, true);
    createLightRay(-maxAcceptanceAngle * 0.8, true);
    
    // Rejected rays (outside acceptance angle)
    createLightRay(maxAcceptanceAngle * 1.3, false);
    createLightRay(-maxAcceptanceAngle * 1.4, false);
    createLightRay(maxAcceptanceAngle * 1.8, false);

    // Animation
    let time = 0;
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      time += 0.01;

      // Update controls
      controls.update();

      // Subtle fiber rotation
      fiberGroup.rotation.y = Math.sin(time * 0.3) * 0.05;

      // Animate light source pulsing
      const sourceLight = scene.children.find(child => child instanceof THREE.PointLight) as THREE.PointLight;
      if (sourceLight) {
        sourceLight.intensity = 2.5 + Math.sin(time * 4) * 0.5;
      }

      // Animate accepted light rays (flowing light effect)
      acceptedRays.forEach((rayGroup, index) => {
        rayGroup.children.forEach((child, childIndex) => {
          if (child instanceof THREE.Line) {
            const material = child.material as THREE.LineBasicMaterial;
            if (childIndex === 0) {
              // Main ray - steady bright
              material.opacity = 1.0;
            } else {
              // Glow layers - pulsing
              const baseOpacity = childIndex === 1 ? 0.5 : 0.3;
              material.opacity = baseOpacity + Math.sin(time * 3 + index * 0.8) * 0.2;
            }
          }
        });
      });

      // Animate rejected rays (fading pulse)
      rejectedRays.forEach((rayGroup, index) => {
        rayGroup.children.forEach((child, childIndex) => {
          if (child instanceof THREE.Line) {
            const material = child.material as THREE.LineBasicMaterial;
            if (childIndex === 0) {
              material.opacity = 0.8 + Math.sin(time * 2 + index) * 0.2;
            } else {
              material.opacity = 0.3 + Math.sin(time * 2 + index) * 0.1;
            }
          }
        });
      });

      // Prominent pulsing of acceptance cone
      const coneMat = acceptanceCone.material as THREE.MeshPhongMaterial;
      coneMat.opacity = 0.2 + Math.sin(time * 2) * 0.1;
      coneMat.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.2;

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
      controls,
      fiber: fiberGroup,
      lightRays: allLightRays,
      acceptedRays,
      rejectedRays,
      acceptanceCone,
      animationId: 0,
    };

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / 700;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, 700);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.controls.dispose();
        sceneRef.current.renderer.dispose();
        canvasRef.current?.removeChild(sceneRef.current.renderer.domElement);
      }
    };
  }, []);

  // Update light rays and fiber appearance when refractive indices change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Update core appearance based on n1
    const coreMesh = sceneRef.current.fiber.children[0] as THREE.Mesh;
    const coreMaterial = coreMesh.material as THREE.MeshPhysicalMaterial;
    coreMaterial.opacity = 0.3 + (n1 - 1.44) / (1.52 - 1.44) * 0.3;
    coreMaterial.emissiveIntensity = 0.3 + (n1 - 1.44) / (1.52 - 1.44) * 0.4;

    // Update cladding appearance based on n2
    const claddingMesh = sceneRef.current.fiber.children[1] as THREE.Mesh;
    const claddingMaterial = claddingMesh.material as THREE.MeshPhysicalMaterial;
    claddingMaterial.opacity = 0.1 + (n2 - 1.42) / (1.50 - 1.42) * 0.15;

    // Update acceptance cone with better visualization
    const coneAngle = (acceptanceAngle * Math.PI) / 180;
    const coneHeight = 2.5;
    const coneRadius = Math.tan(coneAngle) * coneHeight;
    
    sceneRef.current.scene.remove(sceneRef.current.acceptanceCone);
    
    // Find and remove old circle
    const oldCircle = sceneRef.current.scene.children.find(
      child => child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry
    );
    if (oldCircle) sceneRef.current.scene.remove(oldCircle);
    
    const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 32, 1, true);
    const coneMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      emissive: 0x00ff88,
      emissiveIntensity: 0.4,
    });
    const newCone = new THREE.Mesh(coneGeometry, coneMaterial);
    newCone.position.set(-5 - coneHeight / 2, 0, 0);
    newCone.rotation.z = -Math.PI / 2;
    
    const wireframeGeometry = new THREE.EdgesGeometry(coneGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff88, 
      opacity: 0.8, 
      transparent: true,
      linewidth: 2
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    newCone.add(wireframe);
    
    sceneRef.current.scene.add(newCone);
    sceneRef.current.acceptanceCone = newCone;

    // Add cone base circle
    const circleGeometry = new THREE.RingGeometry(coneRadius - 0.02, coneRadius + 0.02, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.position.set(-5 - coneHeight, 0, 0);
    circle.rotation.y = Math.PI / 2;
    sceneRef.current.scene.add(circle);

    // Remove old light rays
    sceneRef.current.lightRays.forEach((ray) => {
      sceneRef.current!.scene.remove(ray);
    });
    sceneRef.current.lightRays = [];
    sceneRef.current.acceptedRays = [];
    sceneRef.current.rejectedRays = [];

    // Create new light rays
    const createLightRay = (incidentAngle: number, isAccepted: boolean) => {
      const rayGroup = new THREE.Group();
      const points: THREE.Vector3[] = [];
      const segments = isAccepted ? 25 : 5;
      let currentPos = new THREE.Vector3(-6, 0, 0);
      let currentAngle = incidentAngle;
      const rayLength = isAccepted ? 11 / segments : 1;

      points.push(currentPos.clone());

      if (isAccepted) {
        for (let i = 0; i < segments; i++) {
          const nextPos = currentPos.clone();
          nextPos.x += rayLength * Math.cos(currentAngle);
          nextPos.y += rayLength * Math.sin(currentAngle);

          if (Math.abs(nextPos.y) > 0.28) {
            currentAngle = -currentAngle;
            nextPos.y = nextPos.y > 0 ? 0.28 : -0.28;
          }

          points.push(nextPos);
          currentPos = nextPos;
        }
      } else {
        const refractAngle = incidentAngle * 1.5;
        currentPos.x += rayLength * Math.cos(refractAngle);
        currentPos.y += rayLength * Math.sin(refractAngle);
        points.push(currentPos.clone());
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: isAccepted ? 0xffdd00 : 0xff3333,
        linewidth: 3,
        transparent: true,
        opacity: 1.0,
      });
      const line = new THREE.Line(geometry, material);
      rayGroup.add(line);

      if (isAccepted) {
        const glowMaterial1 = new THREE.LineBasicMaterial({
          color: 0xffdd00,
          transparent: true,
          opacity: 0.5,
          linewidth: 8,
        });
        const glowLine1 = new THREE.Line(geometry.clone(), glowMaterial1);
        rayGroup.add(glowLine1);

        const glowMaterial2 = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.3,
          linewidth: 12,
        });
        const glowLine2 = new THREE.Line(geometry.clone(), glowMaterial2);
        rayGroup.add(glowLine2);
      } else {
        const glowMaterial = new THREE.LineBasicMaterial({
          color: 0xff3333,
          transparent: true,
          opacity: 0.4,
          linewidth: 6,
        });
        const glowLine = new THREE.Line(geometry.clone(), glowMaterial);
        rayGroup.add(glowLine);
      }

      sceneRef.current!.scene.add(rayGroup);
      sceneRef.current!.lightRays.push(rayGroup);
      
      if (isAccepted) {
        sceneRef.current!.acceptedRays.push(rayGroup);
      } else {
        sceneRef.current!.rejectedRays.push(rayGroup);
      }
    };

    const maxAcceptanceAngle = (acceptanceAngle * Math.PI) / 180;
    
    // Accepted rays
    createLightRay(0, true);
    createLightRay(maxAcceptanceAngle * 0.4, true);
    createLightRay(maxAcceptanceAngle * 0.7, true);
    createLightRay(-maxAcceptanceAngle * 0.5, true);
    createLightRay(-maxAcceptanceAngle * 0.8, true);
    
    // Rejected rays
    createLightRay(maxAcceptanceAngle * 1.3, false);
    createLightRay(-maxAcceptanceAngle * 1.4, false);
    createLightRay(maxAcceptanceAngle * 1.8, false);
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
                  className="w-full h-[700px] rounded-lg border border-primary/20 bg-background/50"
                />
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p className="text-xs text-primary/70 mb-3 font-semibold">🖱️ Click and drag to rotate • Scroll to zoom • Right-click to pan</p>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(255,221,0,0.8)]"></span>
                      <span className="font-medium">Light Source (Sodium Lamp)</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-8 h-1.5 bg-cyan-400 rounded"></span>
                      <span>Core (n₁ = {n1.toFixed(3)})</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-8 h-1.5 bg-purple-500 opacity-50 rounded"></span>
                      <span>Cladding (n₂ = {n2.toFixed(3)})</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-8 h-1.5 bg-yellow-400 rounded shadow-[0_0_10px_rgba(255,221,0,0.6)]"></span>
                      <span className="font-semibold text-yellow-400">✓ Guided Rays (Total Internal Reflection)</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-8 h-1.5 bg-red-500 rounded shadow-[0_0_6px_rgba(255,51,51,0.5)]"></span>
                      <span className="font-semibold text-red-400">✗ Lost Rays (Refracted Out)</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-8 h-1.5 bg-green-400 opacity-40 rounded shadow-[0_0_8px_rgba(0,255,136,0.4)]"></span>
                      <span className="font-semibold text-green-400">Acceptance Cone (±{acceptanceAngle.toFixed(2)}°)</span>
                    </p>
                  </div>
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

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

const FIBER_PRESETS: Record<string, { name: string; n1: number; n2: number; description: string }> = {
  "smf-28": { name: "SMF-28 (Single-Mode)", n1: 1.4681, n2: 1.4629, description: "Standard single-mode fiber, 8.2µm core" },
  "om1": { name: "OM1 (Multi-Mode 62.5µm)", n1: 1.496, n2: 1.471, description: "Legacy multi-mode, 62.5µm core" },
  "om2": { name: "OM2 (Multi-Mode 50µm)", n1: 1.496, n2: 1.479, description: "Multi-mode 50µm core, 1Gb Ethernet" },
  "om3": { name: "OM3 (Multi-Mode 50µm)", n1: 1.482, n2: 1.462, description: "Laser-optimized 50µm, 10Gb Ethernet" },
  "pof": { name: "POF (Plastic Fiber)", n1: 1.492, n2: 1.417, description: "Plastic optical fiber, 1mm core" },
  "custom": { name: "Custom", n1: 1.48, n2: 1.46, description: "Set your own values" },
};

const LED_PRESETS: Record<string, { name: string; wavelength: number; color: string; rgb: string; glowRgba: string }> = {
  red: { name: "Red", wavelength: 630, color: "#ff2020", rgb: "255,32,32", glowRgba: "rgba(255,32,32,0.4)" },
  orange: { name: "Orange", wavelength: 590, color: "#ff8c00", rgb: "255,140,0", glowRgba: "rgba(255,140,0,0.4)" },
  yellow: { name: "Yellow", wavelength: 570, color: "#ffd700", rgb: "255,215,0", glowRgba: "rgba(255,215,0,0.4)" },
  green: { name: "Green", wavelength: 525, color: "#00e040", rgb: "0,224,64", glowRgba: "rgba(0,224,64,0.4)" },
  blue: { name: "Blue", wavelength: 470, color: "#3080ff", rgb: "48,128,255", glowRgba: "rgba(48,128,255,0.4)" },
  violet: { name: "Violet", wavelength: 405, color: "#9040ff", rgb: "144,64,255", glowRgba: "rgba(144,64,255,0.4)" },
  white: { name: "White", wavelength: 550, color: "#f0f0ff", rgb: "240,240,255", glowRgba: "rgba(240,240,255,0.4)" },
  ir: { name: "Infrared (IR)", wavelength: 850, color: "#cc2020", rgb: "204,32,32", glowRgba: "rgba(204,32,32,0.3)" },
};

const Simulation = () => {
  const [fiberType, setFiberType] = useState("custom");
  const [n1, setN1] = useState(1.48);
  const [n2, setN2] = useState(1.46);
  const [simValue, setSimValue] = useState(50);
  const [ledColor, setLedColor] = useState("red");
  const [wavelength, setWavelength] = useState(630);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Calculate numerical aperture, acceptance angle, and critical angle
  const numericalAperture = Math.sqrt(Math.max(0, n1 * n1 - n2 * n2));
  const acceptanceAngle = numericalAperture <= 1 ? (Math.asin(numericalAperture) * 180) / Math.PI : 90;
  const criticalAngle = n2 < n1 ? (Math.asin(n2 / n1) * 180) / Math.PI : 90;
  const led = LED_PRESETS[ledColor];

  // Sync wavelength when preset changes
  // Sync pause ref
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    setWavelength(LED_PRESETS[ledColor].wavelength);
  }, [ledColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ledColorHex = led.color;
    const ledRgb = led.rgb;
    const ledGlowRgba = led.glowRgba;

    // Set canvas size
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 500;

    // Fiber dimensions and position
    const fiberStartX = 150;
    const fiberEndX = width - 50;
    const fiberCenterY = height / 2;
    const coreHeight = 60;
    const claddingHeight = 80;

    // Light ray class
    class LightRay {
      x: number;
      y: number;
      angle: number;
      speed: number;
      path: { x: number; y: number }[];
      isGuided: boolean;
      active: boolean;
      offset: number;

      constructor(angle: number, isGuided: boolean, offset: number = 0) {
        this.x = fiberStartX - 80;
        this.y = fiberCenterY;
        this.angle = angle;
        this.speed = 3;
        this.path = [{ x: this.x, y: this.y }];
        this.isGuided = isGuided;
        this.active = false;
        this.offset = offset;
      }

      update() {
        if (!this.active) return;

        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);

        // Check if ray entered fiber
        if (this.x >= fiberStartX && this.x <= fiberEndX) {
          // Check for total internal reflection
          const distanceFromCenter = Math.abs(this.y - fiberCenterY);
          
          if (this.isGuided && distanceFromCenter >= coreHeight / 2) {
            // Reflect at core boundary
            this.angle = -this.angle;
            this.y = this.angle > 0 
              ? fiberCenterY - coreHeight / 2 
              : fiberCenterY + coreHeight / 2;
          }
        }

        this.path.push({ x: this.x, y: this.y });

        // Remove ray if it goes too far
        if (this.x > fiberEndX + 50 || this.y < 0 || this.y > height || 
            (!this.isGuided && this.path.length > 30)) {
          this.active = false;
          this.path = [];
        }

        // Limit path length for performance
        if (this.path.length > 200) {
          this.path.shift();
        }
      }

      draw(ctx: CanvasRenderingContext2D, time: number) {
        if (this.path.length < 2) return;

         // Draw glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.isGuided ? ledColorHex : '#ff3333';
        
        // Draw main ray
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        
        for (let i = 1; i < this.path.length; i++) {
          ctx.lineTo(this.path[i].x, this.path[i].y);
        }

        ctx.strokeStyle = this.isGuided ? ledColorHex : '#ff3333';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Add animated glow effect
        if (this.isGuided && this.active) {
          const pulseIntensity = 0.5 + Math.sin(time * 3 + this.offset) * 0.3;
          ctx.shadowBlur = 20 * pulseIntensity;
          ctx.strokeStyle = `rgba(${ledRgb}, ${pulseIntensity})`;
          ctx.lineWidth = 5;
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
      }
    }

    // Create light rays
    const maxAngle = (acceptanceAngle * Math.PI) / 180;
    const rays: LightRay[] = [
      new LightRay(0, true, 0),
      new LightRay(maxAngle * 0.5, true, 0.5),
      new LightRay(maxAngle * 0.8, true, 1),
      new LightRay(-maxAngle * 0.5, true, 1.5),
      new LightRay(-maxAngle * 0.8, true, 2),
      new LightRay(maxAngle * 1.3, false, 2.5),
      new LightRay(-maxAngle * 1.3, false, 3),
      new LightRay(maxAngle * 1.6, false, 3.5),
    ];

    let rayIndex = 0;
    let lastRayTime = 0;
    let time = 0;

    // Animation loop
    const animate = () => {
      if (!isPausedRef.current) {
        time += 0.016;
      }
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, width, height);

      // Draw cladding
      ctx.fillStyle = 'rgba(102, 51, 204, 0.2)';
      ctx.fillRect(fiberStartX, fiberCenterY - claddingHeight / 2, 
                   fiberEndX - fiberStartX, claddingHeight);
      
      // Draw cladding borders
      ctx.strokeStyle = 'rgba(102, 51, 204, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(fiberStartX, fiberCenterY - claddingHeight / 2,
                     fiberEndX - fiberStartX, claddingHeight);

      // Draw core
      ctx.fillStyle = 'rgba(136, 221, 255, 0.3)';
      ctx.fillRect(fiberStartX, fiberCenterY - coreHeight / 2,
                   fiberEndX - fiberStartX, coreHeight);
      
      // Draw core borders with glow
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ffff';
      ctx.strokeRect(fiberStartX, fiberCenterY - coreHeight / 2,
                     fiberEndX - fiberStartX, coreHeight);
      ctx.shadowBlur = 0;

      // Draw acceptance cone
      const coneStartX = fiberStartX - 80;
      const coneEndX = fiberStartX;
      const coneAngleRad = maxAngle;
      const coneHeight = Math.tan(coneAngleRad) * (coneEndX - coneStartX);

      ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
      ctx.beginPath();
      ctx.moveTo(coneStartX, fiberCenterY);
      ctx.lineTo(coneEndX, fiberCenterY - coneHeight);
      ctx.lineTo(coneEndX, fiberCenterY + coneHeight);
      ctx.closePath();
      ctx.fill();

      // Draw cone borders
      ctx.strokeStyle = `rgba(0, 255, 136, ${0.5 + Math.sin(time * 2) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff88';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw light source (LED)
      const lampX = coneStartX;
      const lampY = fiberCenterY;
      const lampRadius = 14;
      const glowRadius = 32;

      // Outer glow
      const glowGradient = ctx.createRadialGradient(lampX, lampY, lampRadius, lampX, lampY, glowRadius);
      glowGradient.addColorStop(0, ledGlowRgba);
      glowGradient.addColorStop(1, `rgba(${ledRgb}, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(lampX, lampY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // LED body (rounded rect shape)
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.roundRect(lampX - 10, lampY - 16, 20, 32, 4);
      ctx.fill();
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.stroke();

      // LED lens
      const lensGradient = ctx.createRadialGradient(lampX, lampY, 0, lampX, lampY, 8);
      lensGradient.addColorStop(0, '#ffffff');
      lensGradient.addColorStop(0.3, ledColorHex);
      lensGradient.addColorStop(1, ledColorHex);
      ctx.fillStyle = lensGradient;
      ctx.beginPath();
      ctx.arc(lampX, lampY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing effect
      const pulseIntensity = 0.7 + Math.sin(time * 4) * 0.3;
      ctx.shadowBlur = 20 * pulseIntensity;
      ctx.shadowColor = ledColorHex;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!isPausedRef.current) {
        // Activate rays sequentially
        if (time - lastRayTime > 0.5 && rayIndex < rays.length) {
          rays[rayIndex].active = true;
          rayIndex++;
          lastRayTime = time;
        }

        // Reset animation when all rays are done
        if (rayIndex >= rays.length && rays.every(ray => !ray.active)) {
          rayIndex = 0;
          rays.forEach(ray => {
            ray.x = fiberStartX - 80;
            ray.y = fiberCenterY;
            ray.path = [{ x: ray.x, y: ray.y }];
            ray.active = false;
          });
        }

        // Update rays
        rays.forEach(ray => {
          ray.update();
        });
      }

      // Draw rays (always, even when paused)
      rays.forEach(ray => {
        ray.draw(ctx, time);
      });

      // Draw labels
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#00ffff';
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#00ffff';
      ctx.fillText('Core (n₁)', fiberStartX + 20, fiberCenterY - 5);
      
      ctx.fillStyle = '#9966ff';
      ctx.shadowColor = '#9966ff';
      ctx.fillText('Cladding (n₂)', fiberStartX + 20, fiberCenterY + claddingHeight / 2 - 10);

      ctx.fillStyle = ledColorHex;
      ctx.shadowColor = ledColorHex;
      ctx.fillText(`LED (${wavelength}nm)`, lampX - 40, lampY + glowRadius + 15);

      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.fillText('Acceptance Cone', coneStartX + 10, fiberCenterY - coneHeight - 10);

      ctx.shadowBlur = 0;

      // Draw legend
      const legendX = width - 200;
      const legendY = 30;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(legendX - 10, legendY - 10, 180, 90);
      
      ctx.font = '12px Arial';
      
      // Guided ray
      ctx.strokeStyle = ledColorHex;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY + 10);
      ctx.lineTo(legendX + 30, legendY + 10);
      ctx.stroke();
      ctx.fillStyle = ledColorHex;
      ctx.fillText('Guided Ray (TIR)', legendX + 40, legendY + 14);

      // Lost ray
      ctx.strokeStyle = '#ff3333';
      ctx.beginPath();
      ctx.moveTo(legendX, legendY + 35);
      ctx.lineTo(legendX + 30, legendY + 35);
      ctx.stroke();
      ctx.fillStyle = '#ff3333';
      ctx.fillText('Lost Ray (Refracted)', legendX + 40, legendY + 39);

      // TIR label
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '10px Arial';
      ctx.fillText('TIR = Total Internal Reflection', legendX, legendY + 65);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [acceptanceAngle, led, wavelength, resetKey]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">
                2D Animated Numerical Aperture Simulation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg border-2 border-primary/30 shadow-lg shadow-primary/20"
                style={{ height: '500px' }}
              />
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                  className="gap-2 border-primary/30 hover:bg-primary/10"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? "Play" : "Pause"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setIsPaused(false); setResetKey(k => k + 1); }}
                  className="gap-2 border-primary/30 hover:bg-primary/10"
                >
                  <RotateCcw className="w-4 h-4" />
                  Replay
                </Button>
              </div>

              {/* LED Color & Wavelength Controls */}
              <div className="relative p-5 rounded-xl border border-primary/30 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(240 10% 6%), hsl(260 15% 10%))' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4 block">
                  LED Light Source
                </Label>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Color Select */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">LED Color</Label>
                    <Select value={ledColor} onValueChange={setLedColor}>
                      <SelectTrigger className="bg-background/80 border-primary/30">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full" style={{ background: led.color, boxShadow: `0 0 6px ${led.color}` }} />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LED_PRESETS).map(([key, preset]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-3 h-3 rounded-full" style={{ background: preset.color, boxShadow: `0 0 6px ${preset.color}` }} />
                              {preset.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Wavelength Slider */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Wavelength (nm)</Label>
                    <Slider
                      min={380}
                      max={950}
                      step={5}
                      value={[wavelength]}
                      onValueChange={(v) => setWavelength(v[0])}
                      className="w-full"
                    />
                  </div>

                  {/* Wavelength Input */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Wavelength Value</Label>
                    <Input
                      type="number"
                      min={380}
                      max={950}
                      value={wavelength}
                      onChange={(e) => setWavelength(Math.max(380, Math.min(950, Number(e.target.value))))}
                      className="font-mono font-bold text-center bg-background/80 border-primary/30"
                    />
                  </div>
                </div>

                {/* Color bar preview */}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-block w-5 h-5 rounded-full border border-primary/30" style={{ background: led.color, boxShadow: `0 0 10px ${led.color}` }} />
                  <span>{led.name} — {wavelength} nm</span>
                </div>
              </div>

              {/* Fiber Type Presets */}
              <div className="relative p-5 rounded-xl border border-primary/30 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(240 10% 6%), hsl(260 15% 10%))' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4 block">
                  Fiber Type Preset
                </Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Select Fiber Type</Label>
                    <Select value={fiberType} onValueChange={(val) => {
                      setFiberType(val);
                      if (val !== "custom") {
                        const preset = FIBER_PRESETS[val];
                        setN1(preset.n1);
                        setN2(preset.n2);
                      }
                    }}>
                      <SelectTrigger className="bg-background/80 border-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FIBER_PRESETS).map(([key, preset]) => (
                          <SelectItem key={key} value={key}>{preset.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <p className="text-xs text-muted-foreground italic">{FIBER_PRESETS[fiberType].description}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="n1" className="text-base font-semibold">
                    Core Refractive Index (n₁): {n1.toFixed(3)}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      id="n1"
                      min={1.44}
                      max={1.52}
                      step={0.001}
                      value={[n1]}
                      onValueChange={(value) => { setN1(value[0]); setFiberType("custom"); }}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={1.44}
                      max={1.52}
                      step={0.001}
                      value={n1}
                      onChange={(e) => {
                        const v = Math.max(1.44, Math.min(1.52, Number(e.target.value)));
                        setN1(v);
                        setFiberType("custom");
                      }}
                      className="w-24 text-center font-mono font-bold text-primary bg-background/80 border-primary/30"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="n2" className="text-base font-semibold">
                    Cladding Refractive Index (n₂): {n2.toFixed(3)}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      id="n2"
                      min={1.42}
                      max={1.50}
                      step={0.001}
                      value={[n2]}
                      onValueChange={(value) => { setN2(value[0]); setFiberType("custom"); }}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={1.42}
                      max={1.50}
                      step={0.001}
                      value={n2}
                      onChange={(e) => {
                        const v = Math.max(1.42, Math.min(1.50, Number(e.target.value)));
                        setN2(v);
                        setFiberType("custom");
                      }}
                      className="w-24 text-center font-mono font-bold text-primary bg-background/80 border-primary/30"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Numerical Aperture (NA):
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {numericalAperture.toFixed(4)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Acceptance Angle (θₐ):
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {acceptanceAngle.toFixed(2)}°
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Critical Angle (θ꜀):
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {criticalAngle.toFixed(2)}°
                  </p>
                </div>
              </div>

              {/* Simulation Value Bar */}
              <div className="relative p-5 rounded-xl border border-primary/30 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(240 10% 6%), hsl(260 15% 10%))' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4 block">
                  Set Simulation Value
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[simValue]}
                      onValueChange={(v) => setSimValue(v[0])}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:shadow-[0_0_10px_hsl(var(--primary)/0.7)] [&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary"
                    />
                    <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground/60 font-mono">
                      <span>0</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={simValue}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(100, Number(e.target.value)));
                      setSimValue(v);
                    }}
                    className="w-20 text-center font-mono font-bold text-primary bg-background/80 border-primary/30 focus:border-primary focus:shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                  />
                </div>
              </div>

              <div className="p-4 bg-accent/20 rounded-lg border border-accent/40">
                <h3 className="font-semibold mb-2 text-accent-foreground">
                  Formula:
                </h3>
                <p className="font-mono text-sm text-accent-foreground">
                  NA = √(n₁² - n₂²)
                </p>
                <p className="font-mono text-sm mt-2 text-accent-foreground">
                  θₐ = sin⁻¹(NA)
                </p>
                <p className="font-mono text-sm mt-2 text-accent-foreground">
                  θ꜀ = sin⁻¹(n₂/n₁)
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h3 className="font-semibold mb-3 text-foreground">How it works:</h3>
                <div className="space-y-2 text-sm">
                  <p>• <strong style={{ color: led.color }}>Colored rays</strong> entering within the acceptance cone undergo <strong>Total Internal Reflection (TIR)</strong> and bounce inside the core.</p>
                  <p>• <strong className="text-red-400">Red rays</strong> entering outside the acceptance angle refract out and are lost.</p>
                  <p>• The <strong className="text-green-400">acceptance cone</strong> shows the region where light can successfully enter and propagate.</p>
                  <p>• Change the <strong>LED color</strong> and <strong>wavelength</strong> to see different light sources.</p>
                  <p>• Adjust n₁ and n₂ to see how NA and acceptance angle change in real-time.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Simulation;

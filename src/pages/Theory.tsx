import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Theory = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-bold glow-text">
              Numerical Aperture in Optical Fibers
            </h1>
            <p className="text-xl text-muted-foreground">
              Understanding Light Propagation and Critical Parameters
            </p>
          </div>

          <Card className="glow-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Introduction to Optical Fibers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Optical fibers are cylindrical waveguides that transmit light signals over long distances with minimal loss. 
                They form the backbone of modern telecommunications, enabling high-speed internet, telephone networks, and data transmission globally. 
                An optical fiber consists of two main components: a core (the central region through which light travels) and a cladding 
                (the outer layer that confines light within the core through total internal reflection).
              </p>
              <p>
                The principle of operation relies on the difference in refractive indices between the core and cladding materials. 
                When light enters the fiber at angles within a specific cone (the acceptance cone), it undergoes total internal reflection 
                at the core-cladding boundary, allowing it to propagate through the fiber with minimal attenuation. This phenomenon is 
                fundamental to fiber optic technology and is quantified by the numerical aperture.
              </p>
            </CardContent>
          </Card>

          <Card className="glow-card border-secondary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">What is Numerical Aperture?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                The Numerical Aperture (NA) is a dimensionless number that characterizes the light-gathering ability of an optical fiber. 
                It represents the sine of the maximum half-angle of the cone of light that can enter or exit the fiber and still propagate 
                successfully through total internal reflection. The NA is one of the most critical parameters in fiber optics as it determines:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The light-gathering capability of the fiber</li>
                <li>The coupling efficiency when connecting fibers or light sources</li>
                <li>The modal dispersion characteristics</li>
                <li>The maximum acceptance angle for incoming light</li>
              </ul>
              <p className="mt-4">
                Mathematically, the numerical aperture is defined by the refractive indices of the core (n₁) and cladding (n₂):
              </p>
              <div className="bg-muted/30 p-6 rounded-lg border border-primary/20 text-center my-6">
                <p className="text-xl font-mono text-primary glow-text">
                  NA = √(n₁² - n₂²)
                </p>
              </div>
              <p>
                This equation derives from Snell's law and the condition for total internal reflection. A higher NA indicates a larger 
                acceptance cone, meaning the fiber can collect light over a wider range of angles. However, this also typically results 
                in greater modal dispersion in multimode fibers.
              </p>
            </CardContent>
          </Card>

          <Card className="glow-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Acceptance Angle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                The acceptance angle (θₐ) is the maximum angle at which light can enter the fiber core from air and still propagate 
                through the fiber via total internal reflection. Light rays entering at angles greater than the acceptance angle will 
                not satisfy the conditions for total internal reflection and will leak into the cladding, eventually being lost.
              </p>
              <p>
                The relationship between numerical aperture and acceptance angle is given by:
              </p>
              <div className="bg-muted/30 p-6 rounded-lg border border-secondary/20 text-center my-6">
                <p className="text-xl font-mono text-secondary glow-text">
                  θₐ = arcsin(NA) = arcsin(√(n₁² - n₂²))
                </p>
              </div>
              <p>
                The full acceptance cone angle is 2θₐ. For example, if a fiber has an NA of 0.22, the acceptance angle is approximately 
                12.7°, and the full cone angle is about 25.4°. This means that light entering the fiber within a cone of 25.4° will be 
                guided through the fiber.
              </p>
            </CardContent>
          </Card>

          <Card className="glow-card border-secondary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Total Internal Reflection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Total Internal Reflection (TIR) is the physical phenomenon that enables light propagation in optical fibers. 
                When light traveling in a denser medium (higher refractive index) strikes the boundary with a less dense medium 
                (lower refractive index) at an angle greater than the critical angle, all light is reflected back into the denser medium—none 
                is refracted into the less dense medium.
              </p>
              <p>
                The critical angle (θc) at the core-cladding interface is determined by:
              </p>
              <div className="bg-muted/30 p-6 rounded-lg border border-primary/20 text-center my-6">
                <p className="text-xl font-mono text-primary glow-text">
                  θc = arcsin(n₂/n₁)
                </p>
              </div>
              <p>
                For TIR to occur, the angle of incidence at the core-cladding boundary must be greater than θc. This is why the core 
                must have a higher refractive index than the cladding (n₁ &gt; n₂). The difference between these refractive indices, 
                along with their absolute values, determines the numerical aperture and thus the acceptance angle of the fiber.
              </p>
              <p>
                In practical fibers, the refractive index difference is typically small (around 1-2%), which helps minimize modal 
                dispersion while still maintaining sufficient light-guiding capability.
              </p>
            </CardContent>
          </Card>

          <Card className="glow-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Factors Affecting Numerical Aperture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Several factors influence the numerical aperture of an optical fiber:
              </p>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-lg text-primary mb-2">1. Core Refractive Index (n₁)</h4>
                  <p>
                    A higher core refractive index increases the NA, allowing the fiber to accept light over a wider cone angle. 
                    Common core materials include silica glass (n ≈ 1.46) doped with germanium or phosphorus to increase the refractive index.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-secondary mb-2">2. Cladding Refractive Index (n₂)</h4>
                  <p>
                    A lower cladding refractive index increases the NA. The cladding is typically made of pure silica or silica doped 
                    with fluorine to decrease the refractive index.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-primary mb-2">3. Refractive Index Profile</h4>
                  <p>
                    Step-index fibers have a uniform core refractive index, while graded-index fibers have a refractive index that 
                    decreases gradually from the center to the edge of the core. The NA can vary across the core diameter in graded-index fibers.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-secondary mb-2">4. Wavelength of Light</h4>
                  <p>
                    Refractive indices are wavelength-dependent (dispersion), so the NA can vary slightly with the wavelength of light used. 
                    This is particularly important in wavelength-division multiplexing (WDM) systems.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card border-secondary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Applications and Practical Considerations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Understanding numerical aperture is crucial for various applications:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong className="text-primary">Telecommunications:</strong> Single-mode fibers (low NA, typically 0.1-0.14) are preferred 
                  for long-distance, high-bandwidth applications due to minimal modal dispersion.
                </li>
                <li>
                  <strong className="text-secondary">Local Area Networks:</strong> Multimode fibers (higher NA, typically 0.2-0.3) are used 
                  for shorter distances, offering easier coupling and lower costs.
                </li>
                <li>
                  <strong className="text-primary">Sensing Applications:</strong> Fibers with specific NA values are designed for temperature, 
                  pressure, and chemical sensors.
                </li>
                <li>
                  <strong className="text-secondary">Medical Endoscopy:</strong> Fiber bundles with appropriate NA values enable imaging and 
                  light delivery in minimally invasive procedures.
                </li>
                <li>
                  <strong className="text-primary">Industrial Applications:</strong> High-power laser delivery systems require fibers with 
                  specific NA values to handle power density while maintaining beam quality.
                </li>
              </ul>
              <p className="mt-4">
                When designing or selecting optical fiber systems, engineers must balance the NA with other parameters such as core diameter, 
                bandwidth, and attenuation. A higher NA allows for easier coupling and alignment but may result in increased modal dispersion 
                in multimode fibers, limiting transmission bandwidth and distance.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Theory;

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Conclusion = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-bold glow-text">
              Conclusion
            </h1>
            <p className="text-xl text-muted-foreground">
              Summary and Key Takeaways
            </p>
          </div>

          <Card className="glow-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Summary of Findings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Through this interactive exploration of numerical aperture in optical fibers, we have examined the fundamental 
                principles that govern light propagation in fiber optic systems. The numerical aperture (NA) emerges as a critical 
                parameter that quantifies the light-gathering capability of an optical fiber and directly determines the maximum 
                angle at which light can enter the fiber and still propagate successfully.
              </p>
              <p>
                Our simulation demonstrated the relationship between the core refractive index (n₁) and cladding refractive index (n₂), 
                showing how the difference between these values affects the numerical aperture according to the formula NA = √(n₁² - n₂²). 
                The interactive 3D visualization illustrated total internal reflection in action, with light rays bouncing within the 
                fiber core at the core-cladding boundary.
              </p>
            </CardContent>
          </Card>

          <Card className="glow-card border-secondary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Key Observations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                From our experiments with varying refractive indices, several important observations can be made:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-4">
                <li>
                  <strong className="text-primary">Refractive Index Difference:</strong> The numerical aperture increases with a 
                  larger difference between n₁ and n₂. However, this difference must be carefully controlled—too large a difference 
                  can lead to excessive modal dispersion in multimode fibers, limiting bandwidth and transmission distance.
                </li>
                <li>
                  <strong className="text-secondary">Acceptance Angle Relationship:</strong> The acceptance angle (θₐ = arcsin(NA)) 
                  determines the cone of light that can be coupled into the fiber. A larger acceptance angle makes coupling easier 
                  but may compromise other performance characteristics.
                </li>
                <li>
                  <strong className="text-primary">Total Internal Reflection:</strong> For TIR to occur, light must strike the 
                  core-cladding boundary at an angle greater than the critical angle. This is only possible when n₁ &gt; n₂, which 
                  is why the core must always have a higher refractive index than the cladding.
                </li>
                <li>
                  <strong className="text-secondary">Practical Limitations:</strong> In real-world applications, typical NA values 
                  range from 0.1 to 0.3 for telecommunications fibers. Single-mode fibers have lower NA values (0.1-0.14) for 
                  long-distance, high-bandwidth transmission, while multimode fibers have higher NA values (0.2-0.3) for easier 
                  coupling in shorter-distance applications.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glow-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Practical Implications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Understanding numerical aperture has several practical implications for fiber optic system design and deployment:
              </p>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-lg text-primary mb-2">1. System Design Considerations</h4>
                  <p>
                    Engineers must balance the NA with other parameters such as core diameter, bandwidth requirements, and transmission 
                    distance. A higher NA facilitates easier coupling between light sources and fibers, and between fiber-to-fiber 
                    connections, but may result in higher modal dispersion in multimode fibers.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-secondary mb-2">2. Light Source Coupling</h4>
                  <p>
                    The numerical aperture determines how efficiently light from LEDs, lasers, or other fibers can be coupled into the 
                    fiber. Light sources with emission cones larger than the fiber's acceptance cone will result in coupling losses, 
                    as some light falls outside the acceptance angle.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-primary mb-2">3. Modal Dispersion Trade-offs</h4>
                  <p>
                    In multimode fibers, different modes of light travel at different velocities and path lengths. A higher NA allows 
                    more modes to propagate, which increases modal dispersion and limits the maximum transmission distance and bandwidth. 
                    This is why single-mode fibers with lower NA are preferred for long-haul telecommunications.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-secondary mb-2">4. Application-Specific Optimization</h4>
                  <p>
                    Different applications require different NA values. Medical endoscopes benefit from higher NA for better light 
                    collection, industrial sensors may need specific NA values for optimal performance, and telecommunication systems 
                    require lower NA for minimal dispersion over long distances.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card border-secondary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Mathematical Relationships Demonstrated</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                The simulation clearly illustrated the mathematical relationships governing optical fiber behavior:
              </p>
              <div className="bg-muted/30 p-6 rounded-lg border border-primary/20 space-y-4 my-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Numerical Aperture:</p>
                  <p className="font-mono text-primary text-lg">NA = √(n₁² - n₂²)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Acceptance Angle:</p>
                  <p className="font-mono text-secondary text-lg">θₐ = arcsin(NA) = arcsin(√(n₁² - n₂²))</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Critical Angle:</p>
                  <p className="font-mono text-primary text-lg">θc = arcsin(n₂/n₁)</p>
                </div>
              </div>
              <p>
                These equations are interconnected through Snell's law and the principles of total internal reflection. The interactive 
                nature of the simulation allowed us to observe how changing the refractive indices directly affects both the numerical 
                aperture and the acceptance angle, reinforcing the theoretical understanding with visual confirmation.
              </p>
            </CardContent>
          </Card>

          <Card className="glow-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Future Directions and Advanced Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                While this simulation focused on the fundamental principles of numerical aperture, several advanced topics merit 
                further exploration:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong className="text-secondary">Graded-Index Fibers:</strong> Unlike step-index fibers, graded-index fibers have 
                  a continuously varying refractive index across the core, which can reduce modal dispersion while maintaining good 
                  light-gathering capability.
                </li>
                <li>
                  <strong className="text-primary">Wavelength-Dependent Effects:</strong> Refractive indices vary with wavelength 
                  (chromatic dispersion), affecting the NA differently for different colors of light. This is particularly important 
                  in wavelength-division multiplexing (WDM) systems.
                </li>
                <li>
                  <strong className="text-secondary">Photonic Crystal Fibers:</strong> These advanced fibers use periodic structures 
                  to achieve unique properties, including unusual NA characteristics and the ability to guide light through air cores.
                </li>
                <li>
                  <strong className="text-primary">Bend Loss and NA:</strong> The relationship between fiber bending radius, NA, and 
                  light loss is crucial for practical installations where fibers must navigate around obstacles.
                </li>
                <li>
                  <strong className="text-secondary">Mode Field Diameter:</strong> In single-mode fibers, the mode field diameter 
                  (MFD) becomes more relevant than NA for characterizing coupling efficiency and splice loss.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glow-card border-secondary/30">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Final Thoughts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                The numerical aperture is a fundamental parameter that bridges theoretical optics with practical fiber optic system 
                design. Through this interactive exploration, we have seen how the simple relationship NA = √(n₁² - n₂²) has profound 
                implications for light propagation, system performance, and real-world applications.
              </p>
              <p>
                The 3D simulation demonstrated that optical fiber technology, while based on simple principles of reflection and 
                refraction, requires careful engineering to optimize multiple competing parameters. The ability to visualize total 
                internal reflection and see how light rays behave within the fiber core provides invaluable insight into why fiber 
                optics has become the foundation of modern telecommunications.
              </p>
              <p>
                As fiber optic technology continues to evolve—with innovations in materials, manufacturing techniques, and network 
                architectures—the fundamental principles of numerical aperture and total internal reflection remain as relevant as 
                ever. Understanding these concepts is essential for anyone working with or studying optical communication systems, 
                from telecommunications engineers to researchers developing next-generation photonic devices.
              </p>
              <p className="pt-4 border-t border-border mt-6 italic text-primary">
                This interactive simulation serves as both an educational tool and a demonstration of how theoretical principles 
                translate into observable phenomena. By adjusting the refractive indices and observing the results in real-time, 
                we gain a deeper, more intuitive understanding of the physics underlying one of humanity's most important 
                communication technologies.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Conclusion;

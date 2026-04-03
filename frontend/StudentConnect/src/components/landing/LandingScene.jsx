import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, RoundedBox, Sphere, Cone, Cylinder, Torus } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- 3D Materials ---
const glassMaterial = {
    roughness: 0.1, metalness: 0.8, transmission: 0.9, ior: 1.5, thickness: 0.5, clearcoat: 1
};
const accentMaterial = { color: "#d44332", emissive: "#d44332", emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.5 };
const blueMaterial = { color: "#3d5999", emissive: "#3d5999", emissiveIntensity: 0.3, roughness: 0.2, metalness: 0.5 };
const yellowMaterial = { color: "#ffdc82", emissive: "#ffdc82", emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.5 };
const whiteMaterial = { color: "#ffffff", roughness: 1 };

// --- Objects ---

// 1. Hero: Connection Nodes
const ConnectionNode = React.forwardRef((props, ref) => (
    <group ref={ref} {...props}>
        <Sphere args={[0.8, 32, 32]} castShadow>
            <meshPhysicalMaterial {...glassMaterial} color="#d44332" />
        </Sphere>
        <Torus args={[1.2, 0.05, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial {...accentMaterial} />
        </Torus>
        <Torus args={[1.6, 0.02, 16, 64]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <meshStandardMaterial {...blueMaterial} />
        </Torus>
        <Sphere args={[0.15]} position={[1.2, 0, 0]}><meshStandardMaterial {...accentMaterial} /></Sphere>
        <Sphere args={[0.1]} position={[-1.13, 1.13, 0]}><meshStandardMaterial {...blueMaterial} /></Sphere>
    </group>
));

// 2. Mission: Lightbulb
const Lightbulb = React.forwardRef((props, ref) => (
    <group ref={ref} {...props}>
        <Sphere args={[1, 32, 32]} position={[0, 0.5, 0]} castShadow>
            <meshPhysicalMaterial {...glassMaterial} color="#ffdc82" emissive="#ffdc82" emissiveIntensity={0.2} />
        </Sphere>
        <Cylinder args={[0.4, 0.3, 0.6]} position={[0, -0.8, 0]}>
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.1, 0.1, 0.2]} position={[0, -1.2, 0]}>
            <meshStandardMaterial color="#333" />
        </Cylinder>
        <Torus args={[0.42, 0.05, 16, 32]} position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}><meshStandardMaterial color="#666" /></Torus>
        <Torus args={[0.42, 0.05, 16, 32]} position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}><meshStandardMaterial color="#666" /></Torus>
    </group>
));

// 3. Features: Smartphone
const PhoneObject = React.forwardRef((props, ref) => (
    <group ref={ref} {...props}>
        <RoundedBox args={[2, 4, 0.2]} radius={0.15} castShadow>
            <meshPhysicalMaterial {...glassMaterial} color="#111" transmission={0} />
        </RoundedBox>
        <RoundedBox args={[1.8, 3.8, 0.05]} radius={0.1} position={[0, 0, 0.1]}>
            <meshStandardMaterial {...accentMaterial} emissiveIntensity={0.1} />
        </RoundedBox>
        <RoundedBox args={[1.5, 0.6, 0.06]} radius={0.05} position={[0, 1.3, 0.12]}><meshStandardMaterial {...whiteMaterial} /></RoundedBox>
        <RoundedBox args={[0.7, 0.4, 0.06]} radius={0.05} position={[-0.4, 0.6, 0.12]}><meshStandardMaterial {...yellowMaterial} /></RoundedBox>
        <RoundedBox args={[0.7, 0.4, 0.06]} radius={0.05} position={[0.4, 0.6, 0.12]}><meshStandardMaterial {...blueMaterial} /></RoundedBox>
        <RoundedBox args={[1.5, 1.2, 0.06]} radius={0.05} position={[0, -0.4, 0.12]}><meshStandardMaterial {...whiteMaterial} /></RoundedBox>
    </group>
));

// 4. About: Graduation Cap
const GraduationCap = React.forwardRef((props, ref) => (
    <group ref={ref} {...props}>
        <Cylinder args={[0.8, 0.8, 0.5, 32]} position={[0, -0.25, 0]}>
            <meshStandardMaterial color="#222" roughness={0.9} />
        </Cylinder>
        <RoundedBox args={[2.5, 0.1, 2.5]} radius={0.02} position={[0, 0.05, 0]} rotation={[0, Math.PI / 4, 0]}>
            <meshStandardMaterial color="#111" roughness={0.8} />
        </RoundedBox>
        <Cylinder args={[0.02, 0.02, 1.2]} position={[0.8, -0.5, 0.8]} rotation={[0, 0, Math.PI / 8]}>
            <meshStandardMaterial {...yellowMaterial} />
        </Cylinder>
        <Sphere args={[0.1]} position={[0, 0.15, 0]}>
            <meshStandardMaterial {...yellowMaterial} />
        </Sphere>
    </group>
));

// 5. Contact: Paper Plane
const PaperPlane = React.forwardRef((props, ref) => (
    <group ref={ref} {...props}>
        <Cone args={[1, 3, 3]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <meshPhysicalMaterial {...glassMaterial} color="#ffffff" transmission={0} roughness={0.2} />
        </Cone>
        <Cone args={[0.9, 2.9, 3]} position={[0, 0.05, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshStandardMaterial {...blueMaterial} />
        </Cone>
    </group>
));


const AnimatedSceneCluster = () => {
    const masterGroup = useRef(null);
    const nodeRef = useRef(null);
    const bulbRef = useRef(null);
    const phoneRef = useRef(null);
    const capRef = useRef(null);
    const planeRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.landing-page',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1,
                }
            });

            // Initial State setup
            gsap.set(masterGroup.current.position, { x: 3, y: 1, z: 0 }); // Hero Top Right
            gsap.set(nodeRef.current.scale, { x: 1, y: 1, z: 1 });
            gsap.set([bulbRef.current.scale, phoneRef.current.scale, capRef.current.scale, planeRef.current.scale], { x: 0, y: 0, z: 0 });

            // Segment 1: Hero -> Mission
            tl.to(masterGroup.current.position, { x: -3, y: -1, z: -1, ease: "power1.inOut" }, 0)
                .to(masterGroup.current.rotation, { x: 1, y: 2, z: 0.5, ease: "power1.inOut" }, 0)
                .to(nodeRef.current.scale, { x: 0, y: 0, z: 0, ease: "back.in(1.5)" }, 0)
                .to(bulbRef.current.scale, { x: 1.2, y: 1.2, z: 1.2, ease: "back.out(1.5)", delay: 0.2 }, 0);

            // Segment 2: Mission -> Features
            tl.to(masterGroup.current.position, { x: 0, y: -2, z: -3, ease: "power1.inOut" }, 1)
                .to(masterGroup.current.rotation, { x: -0.5, y: -1, z: -0.2, ease: "power1.inOut" }, 1)
                .to(bulbRef.current.scale, { x: 0, y: 0, z: 0, ease: "back.in(1.5)" }, 1)
                .to(phoneRef.current.scale, { x: 1, y: 1, z: 1, ease: "back.out(1.5)", delay: 0.2 }, 1);

            // Segment 3: Features -> About
            tl.to(masterGroup.current.position, { x: 3, y: -3, z: 0, ease: "power1.inOut" }, 2)
                .to(masterGroup.current.rotation, { x: 0.2, y: 3, z: 0.3, ease: "power1.inOut" }, 2)
                .to(phoneRef.current.scale, { x: 0, y: 0, z: 0, ease: "back.in(1.5)" }, 2)
                .to(capRef.current.scale, { x: 1, y: 1, z: 1, ease: "back.out(1.5)", delay: 0.2 }, 2);

            // Segment 4: About -> Contact
            tl.to(masterGroup.current.position, { x: 0, y: -4, z: 2, ease: "power1.inOut" }, 3)
                .to(masterGroup.current.rotation, { x: 0, y: 0, z: 0, ease: "power1.inOut" }, 3)
                .to(capRef.current.scale, { x: 0, y: 0, z: 0, ease: "back.in(1.5)" }, 3)
                .to(planeRef.current.scale, { x: 1, y: 1, z: 1, ease: "back.out(1.5)", delay: 0.2 }, 3);

        });

        return () => ctx.revert();
    }, []);

    // Ambient floating for the active object
    useFrame((state) => {
        if (masterGroup.current) {
            masterGroup.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.002;
            masterGroup.current.rotation.y += 0.002;
        }
    });

    return (
        <group ref={masterGroup}>
            <ConnectionNode ref={nodeRef} />
            <Lightbulb ref={bulbRef} />
            <PhoneObject ref={phoneRef} />
            <GraduationCap ref={capRef} />
            <PaperPlane ref={planeRef} />
        </group>
    );
};

export default function LandingScene() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#3d5999" />
                <Environment preset="city" />
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <AnimatedSceneCluster />
                </Float>
            </Canvas>
        </div>
    );
}

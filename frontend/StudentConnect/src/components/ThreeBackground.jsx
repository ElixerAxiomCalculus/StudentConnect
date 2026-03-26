import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        // Scene layout
        const scene = new THREE.Scene();
        // Soft warm background fog
        scene.fog = new THREE.FogExp2(0xfaf0e6, 0.001);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 25;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentMount.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Core light following cursor
        const pointLight = new THREE.PointLight(0xffffff, 2, 80);
        pointLight.position.set(0, 0, 15);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0xd44332, 1.5, 60); // Accent #d44332
        pointLight2.position.set(-15, 10, 5);
        scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0x00aced, 1.5, 60); // Secondary Accent
        pointLight3.position.set(15, -10, 5);
        scene.add(pointLight3);

        // Soft Abstract Blobs
        const geometry = new THREE.IcosahedronGeometry(4, 32); // High segment count for spherical look

        // Materials with physical properties for nice specular highlights
        const material1 = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.2
        });
        const material2 = new THREE.MeshPhysicalMaterial({
            color: 0xff7c6d,
            roughness: 0.3,
            metalness: 0.1
        });
        const material3 = new THREE.MeshPhysicalMaterial({
            color: 0x3d5999,
            roughness: 0.2,
            metalness: 0.1
        });

        const blob1 = new THREE.Mesh(geometry, material1);
        blob1.position.set(-10, 5, -5);
        scene.add(blob1);

        const blob2 = new THREE.Mesh(geometry, material2);
        blob2.position.set(12, -8, -10);
        blob2.scale.set(1.5, 1.5, 1.5);
        scene.add(blob2);

        const blob3 = new THREE.Mesh(geometry, material3);
        blob3.position.set(4, 10, -15);
        blob3.scale.set(0.8, 0.8, 0.8);
        scene.add(blob3);

        // Particles System (Subtle drifting particles)
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 400;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 80;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.08,
            color: 0x888888,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Mouse Parallax tracking
        let mouseX = 0;
        let mouseY = 0;

        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        const onDocumentMouseMove = (event) => {
            mouseX = (event.clientX - windowHalfX);
            mouseY = (event.clientY - windowHalfY);
        };

        document.addEventListener('mousemove', onDocumentMouseMove);

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Animation Loop
        let frameId;
        const clock = new THREE.Clock();

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Parallax Camera movement (easing)
            camera.position.x += (mouseX * 0.005 - camera.position.x) * 0.02;
            camera.position.y += (-mouseY * 0.005 - camera.position.y) * 0.02;

            // Link depth light to mouse
            pointLight.position.x += (mouseX * 0.02 - pointLight.position.x) * 0.05;
            pointLight.position.y += (-mouseY * 0.02 - pointLight.position.y) * 0.05;

            // Optional subtle ambient rotation of scene
            scene.rotation.y += 0.0005;

            // Bobbing motion for blobs
            blob1.position.y = 5 + Math.sin(elapsedTime * 0.5) * 1.5;
            blob1.rotation.x += 0.001;
            blob1.rotation.y += 0.002;

            blob2.position.y = -8 + Math.sin(elapsedTime * 0.3) * 2;
            blob2.rotation.x -= 0.001;
            blob2.rotation.y += 0.0015;

            blob3.position.y = 10 + Math.sin(elapsedTime * 0.4) * 1.2;
            blob3.rotation.x += 0.002;
            blob3.rotation.z += 0.001;

            // Slow particle drift
            particlesMesh.rotation.y = -elapsedTime * 0.015;
            particlesMesh.rotation.x = elapsedTime * 0.008;

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousemove', onDocumentMouseMove);
            if (currentMount) {
                currentMount.removeChild(renderer.domElement);
            }

            // Dispose Three.js resources
            geometry.dispose();
            material1.dispose();
            material2.dispose();
            material3.dispose();
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                pointerEvents: 'none',
                opacity: 0.6 // Toned down so it doesn't distract too much
            }}
        />
    );
}

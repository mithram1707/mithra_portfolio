// ══════════════════════════════════════════
//  THREE.JS — Interactive Particle Field
// ══════════════════════════════════════════
(function initThree() {
    const canvas = document.getElementById('bgCanvas');
    const renderer = new (window.THREE ? THREE.WebGLRenderer : Object)();

    // Load Three.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => buildScene();
    document.head.appendChild(script);

    function buildScene() {
        const W = window.innerWidth, H = window.innerHeight;
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
        camera.position.z = 5;

        const isMobile = W < 768;
        const COUNT = isMobile ? 600 : 1800;

        // Particle geometry
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(COUNT * 3);
        const colors = new Float32Array(COUNT * 3);
        const sizes = new Float32Array(COUNT);

        const pinkRGB  = [0.878, 0.067, 0.373];
        const greenRGB = [0.294, 0.435, 0.267];
        const pink2RGB = [1.0,   0.310, 0.639];

        for (let i = 0; i < COUNT; i++) {
            pos[i * 3]     = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 15;

            const pick = Math.random();
            const c = pick < 0.5 ? pinkRGB : pick < 0.8 ? greenRGB : pink2RGB;
            colors[i * 3]     = c[0];
            colors[i * 3 + 1] = c[1];
            colors[i * 3 + 2] = c[2];

            sizes[i] = Math.random() * 3 + 1;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            size: 0.06,
            vertexColors: true,
            transparent: true,
            opacity: 0.75,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const particles = new THREE.Points(geo, mat);
        scene.add(particles);

        // Floating geometric shapes
        const shapes3D = [];
        const shapeGeos = [
            new THREE.OctahedronGeometry(0.3),
            new THREE.TetrahedronGeometry(0.3),
            new THREE.IcosahedronGeometry(0.25),
            new THREE.TorusGeometry(0.2, 0.08, 8, 16),
        ];
        const shapeMats = [
            new THREE.MeshBasicMaterial({ color: 0xE0115F, wireframe: true, transparent: true, opacity: 0.4 }),
            new THREE.MeshBasicMaterial({ color: 0x4B6F44, wireframe: true, transparent: true, opacity: 0.4 }),
            new THREE.MeshBasicMaterial({ color: 0xFF4FA3, wireframe: true, transparent: true, opacity: 0.35 }),
            new THREE.MeshBasicMaterial({ color: 0x7FA66B, wireframe: true, transparent: true, opacity: 0.35 }),
        ];

        if (!isMobile) {
            for (let i = 0; i < 12; i++) {
                const mesh = new THREE.Mesh(
                    shapeGeos[i % shapeGeos.length],
                    shapeMats[i % shapeMats.length]
                );
                mesh.position.set(
                    (Math.random() - 0.5) * 16,
                    (Math.random() - 0.5) * 12,
                    (Math.random() - 0.5) * 8
                );
                mesh.userData = {
                    rotX: (Math.random() - 0.5) * 0.015,
                    rotY: (Math.random() - 0.5) * 0.015,
                    floatSpeed: Math.random() * 0.008 + 0.003,
                    floatOffset: Math.random() * Math.PI * 2,
                    baseY: mesh.position.y,
                };
                scene.add(mesh);
                shapes3D.push(mesh);
            }
        }

        // Mouse tracking
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', e => {
            mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Scroll tracking
        let scrollY = 0;
        window.addEventListener('scroll', () => { scrollY = window.scrollY; });

        // Animate
        let t = 0;
        let morphPositions = null;
        function animate() {
            requestAnimationFrame(animate);
            t += 0.005;

            // Particle morphing
            if (window.__morphTrigger) {
                window.__morphTrigger = false;
                morphPositions = window.__getMorphShape ? window.__getMorphShape(window.__morphShape, COUNT) : null;
            }
            if (morphPositions) {
                const cur = geo.attributes.position.array;
                let done = true;
                for (let i = 0; i < cur.length; i++) {
                    const diff = morphPositions[i] - cur[i];
                    if (Math.abs(diff) > 0.01) { cur[i] += diff * 0.04; done = false; }
                    else cur[i] = morphPositions[i];
                }
                geo.attributes.position.needsUpdate = true;
                if (done) morphPositions = null;
            }

            // Rotate particle field with mouse
            particles.rotation.x += (mouseY * 0.3 - particles.rotation.x) * 0.03;
            particles.rotation.y += (mouseX * 0.3 - particles.rotation.y) * 0.03;
            particles.rotation.z += 0.0008;

            // Scroll parallax
            camera.position.y = -scrollY * 0.002;

            // Animate shapes
            shapes3D.forEach(m => {
                m.rotation.x += m.userData.rotX;
                m.rotation.y += m.userData.rotY;
                m.position.y = m.userData.baseY + Math.sin(t + m.userData.floatOffset) * 0.5;
            });

            renderer.render(scene, camera);
        }
        animate();

        // Resize
        window.addEventListener('resize', () => {
            const W2 = window.innerWidth, H2 = window.innerHeight;
            camera.aspect = W2 / H2;
            camera.updateProjectionMatrix();
            renderer.setSize(W2, H2);
        });
    }
})();

// ══════════════════════════════════════════
//  CUSTOM CURSOR
// ══════════════════════════════════════════
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursorTrail');
let cx = 0, cy = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
});

function animateTrail() {
    tx += (cx - tx) * 0.12;
    ty += (cy - ty) * 0.12;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animateTrail);
}
animateTrail();

document.querySelectorAll('a,button,.sparkle-card,.float-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(2)';
        trail.style.transform  = 'translate(-50%,-50%) scale(1.5)';
        trail.style.borderColor = 'rgba(255,79,163,0.8)';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
        trail.style.transform  = 'translate(-50%,-50%) scale(1)';
        trail.style.borderColor = 'rgba(224,17,95,0.5)';
    });
});

// ══════════════════════════════════════════
//  SCROLL PROGRESS BAR
// ══════════════════════════════════════════
const scrollBar = document.getElementById('scrollBar');
window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    scrollBar.style.width = pct + '%';
});

// ══════════════════════════════════════════
//  SPARKLE BURST on card hover/click
// ══════════════════════════════════════════
const SPARKLE_COLORS = ['#E0115F','#FF4FA3','#7FA66B','#fff','#FFD700','#4B6F44','#FF8EC7'];

function spawnSparkles(x, y, count = 18) {
    for (let i = 0; i < count; i++) {
        const s = document.createElement('div');
        s.className = 'sparkle-burst';
        const angle = (i / count) * Math.PI * 2;
        const dist  = 40 + Math.random() * 80;
        s.style.cssText = `
            left:${x}px; top:${y}px;
            background:${SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)]};
            width:${4 + Math.random() * 6}px;
            height:${4 + Math.random() * 6}px;
            box-shadow:0 0 8px currentColor;
            --tx:${Math.cos(angle) * dist}px;
            --ty:${Math.sin(angle) * dist}px;
            animation-duration:${0.6 + Math.random() * 0.5}s;
        `;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1200);
    }
}

// Trigger sparkles on sparkle-card hover
document.querySelectorAll('.sparkle-card').forEach(card => {
    let sparkleInterval = null;

    card.addEventListener('mouseenter', e => {
        const r = card.getBoundingClientRect();
        spawnSparkles(r.left + r.width / 2, r.top + r.height / 2, 22);
        // Continuous sparkles while hovering
        sparkleInterval = setInterval(() => {
            const rx = r.left + Math.random() * r.width;
            const ry = r.top  + Math.random() * r.height;
            spawnSparkles(rx, ry, 5);
        }, 300);
    });

    card.addEventListener('mouseleave', () => {
        clearInterval(sparkleInterval);
    });

    card.addEventListener('click', e => {
        spawnSparkles(e.clientX, e.clientY, 35);
    });
});

// ══════════════════════════════════════════
//  3D TILT on profile picture
// ══════════════════════════════════════════
const profileWrap = document.getElementById('profileWrap');
if (profileWrap) {
    profileWrap.addEventListener('mousemove', e => {
        const r = profileWrap.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        profileWrap.style.transform =
            `translateY(-20px) rotateY(${x * 30}deg) rotateX(${-y * 30}deg) scale(1.05)`;
    });
    profileWrap.addEventListener('mouseleave', () => {
        profileWrap.style.transform = '';
    });
}

// ══════════════════════════════════════════
//  3D TILT on project & blog cards
// ══════════════════════════════════════════
document.querySelectorAll('.pcard, .bcard, .card, .stat-box').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform =
            `translateY(-25px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.04)`;
        card.style.boxShadow =
            `${-x * 20}px ${-y * 20}px 40px rgba(224,17,95,0.3),
             0 30px 60px rgba(0,0,0,0.5),
             0 0 50px rgba(224,17,95,0.2)`;
        card.style.animation = 'none';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.boxShadow  = '';
        card.style.animation  = '';
    });
});

// ══════════════════════════════════════════
//  TYPEWRITER
// ══════════════════════════════════════════
const phrases = ['CSBS Student 🎓','Problem Solver 💡','AI Enthusiast 🤖','Web Developer 💻','Competitive Coder ⚡'];
let pi = 0, ci = 0, del = false;
const typer = document.getElementById('typer');

function typeWriter() {
    if (!typer) return;
    const cur = phrases[pi];
    typer.textContent = del ? cur.substring(0, --ci) : cur.substring(0, ++ci);
    if (!del && ci === cur.length) setTimeout(() => del = true, 1800);
    else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    setTimeout(typeWriter, del ? 55 : 95);
}

// ══════════════════════════════════════════
//  SMOOTH SCROLL + NAV ACTIVE
// ══════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.getElementById('navMenu').classList.remove('open');
    });
});

const sections  = document.querySelectorAll('.section');
const navLinks  = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 250) current = s.getAttribute('id');
    });
    navLinks.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('href') === '#' + current) l.classList.add('active');
    });

    const nb = document.getElementById('navbar');
    nb.style.background = window.scrollY > 60
        ? 'rgba(13,15,14,0.97)'
        : 'rgba(13,15,14,0.75)';
});

// ══════════════════════════════════════════
//  HAMBURGER
// ══════════════════════════════════════════
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navMenu').classList.toggle('open');
});

// ══════════════════════════════════════════
//  SCROLL REVEAL
// ══════════════════════════════════════════
const revealObs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ══════════════════════════════════════════
//  MOUSE TRAIL SPARKLES (home section only)
// ══════════════════════════════════════════
let lastSparkle = 0;
document.querySelector('.home-section')?.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastSparkle < 80) return;
    lastSparkle = now;
    const s = document.createElement('div');
    s.className = 'sparkle-burst';
    const size = 3 + Math.random() * 5;
    s.style.cssText = `
        left:${e.clientX}px; top:${e.clientY}px;
        background:${SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)]};
        width:${size}px; height:${size}px;
        --tx:${(Math.random()-0.5)*40}px;
        --ty:${(Math.random()-0.5)*40}px;
        animation-duration:0.7s;
    `;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 700);
});

// ══════════════════════════════════════════
//  FEATURE 1 — PROJECT MODAL
// ══════════════════════════════════════════
const PROJECTS = [
    {
        emoji: '🚗', tag: 'Computer Vision',
        title: 'Parking Slot Detection System',
        desc: 'Designed and developed a smart parking slot detection system capable of identifying vacant and occupied parking spaces in real time using image processing techniques. The system processes video feeds from a camera mounted above a parking area and visually marks available slots, aiming to reduce congestion and improve parking efficiency.',
        techs: ['Python', 'OpenCV', 'Image Processing', 'Computer Vision', 'Real-Time Detection']
    },
    {
        emoji: '👣', tag: 'Green Energy',
        title: 'Footsteps to Energy Conversion',
        desc: 'Explores the innovative concept of harvesting energy from human footsteps using piezoelectric materials or pressure-sensitive flooring systems. Covers the basic principles of energy conversion from mechanical to electrical form, types of technologies used, and real-world applications such as powering streetlights, sensors, or public infrastructure in high-footfall areas.',
        techs: ['IoT', 'Piezoelectric', 'Energy Harvesting', 'Embedded Systems', 'Sustainability']
    },
    {
        emoji: '♻️', tag: 'Sustainability',
        title: 'Waste Management System',
        desc: 'Waste-to-energy (WTE) conversion system that transforms waste materials into usable energy, addressing both waste management and energy generation challenges. This technology reduces landfill dependency and lowers environmental pollution by efficiently extracting energy from discarded materials.',
        techs: ['Embedded Systems', 'Sensors', 'Data Analysis', 'Green Tech', 'WTE']
    },
    {
        emoji: '👂', tag: 'AI / Assistive Tech',
        title: 'Hear-Aid',
        desc: 'An AI-powered assistive system that detects, amplifies, and filters important sounds to help hearing-impaired individuals communicate effectively in real time. Bridges the gap between sound perception and comprehension using advanced signal processing and machine learning algorithms.',
        techs: ['AI/ML', 'Signal Processing', 'Python', 'Deep Learning', 'Assistive Tech']
    },
    {
        emoji: '🔐', tag: 'FinTech / Security',
        title: 'UPI Fraud Detection',
        desc: 'An intelligent fraud monitoring system that uses machine learning to analyze transaction patterns and detect suspicious UPI activities instantly. Enhances digital payment security with real-time alerts and anomaly detection, protecting users from financial fraud.',
        techs: ['Machine Learning', 'Python', 'Data Science', 'Anomaly Detection', 'FinTech']
    },
    {
        emoji: '📰', tag: 'NLP / AI',
        title: 'Fake News Detection',
        desc: 'An AI-based content verification system that identifies and flags misleading or false information by analyzing text patterns and source credibility. Helps combat misinformation in digital media using natural language processing and classification algorithms.',
        techs: ['NLP', 'ML', 'Text Analysis', 'Classification', 'Python']
    }
];

const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');

function openModal(idx) {
    const p = PROJECTS[idx];
    document.getElementById('modalEmoji').textContent = p.emoji;
    document.getElementById('modalTag').textContent   = p.tag;
    document.getElementById('modalTitle').textContent = p.title;
    document.getElementById('modalDesc').textContent  = p.desc;
    const techsEl = document.getElementById('modalTechs');
    techsEl.innerHTML = p.techs.map(t => `<span>${t}</span>`).join('');
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    spawnSparkles(window.innerWidth / 2, window.innerHeight / 2, 30);
}

function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

document.querySelectorAll('.pcard[data-modal]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openModal(+card.dataset.modal));
});
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeSkills(); } });

// ══════════════════════════════════════════
//  FEATURE 2 — SKILL PROGRESS BARS
// ══════════════════════════════════════════
const skillsOverlay = document.getElementById('skillsOverlay');
const skillsClose   = document.getElementById('skillsClose');
const openSkillsBtn = document.getElementById('openSkillsBtn');

function openSkills() {
    skillsOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Animate bars after short delay
    setTimeout(() => {
        document.querySelectorAll('.bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.w + '%';
        });
    }, 200);
    spawnSparkles(window.innerWidth / 2, window.innerHeight / 2, 25);
}

function closeSkills() {
    skillsOverlay.classList.remove('open');
    document.body.style.overflow = '';
    // Reset bars for re-animation next open
    document.querySelectorAll('.bar-fill').forEach(bar => bar.style.width = '0%');
}

openSkillsBtn?.addEventListener('click', openSkills);
skillsClose?.addEventListener('click', closeSkills);
skillsOverlay?.addEventListener('click', e => { if (e.target === skillsOverlay) closeSkills(); });

// ══════════════════════════════════════════
//  FEATURE 3 — PARTICLE MORPHING
// ══════════════════════════════════════════
const morphShapes = ['random', 'sphere', 'wave', 'spiral', 'grid'];
const morphLabels = ['🌀 Random', '🌐 Sphere', '🌊 Wave', '🌀 Spiral', '▦ Grid'];
let morphIdx = 0;
let particlePositions = null;
let morphTarget = null;
let isMorphing = false;

window.__setMorphTarget = function(positions, target) {
    particlePositions = positions;
    morphTarget = target;
};

window.__getMorphShape = function(shape, count) {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        let x, y, z;
        if (shape === 'sphere') {
            const phi   = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;
            const r = 5 + Math.random() * 2;
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        } else if (shape === 'wave') {
            x = (Math.random() - 0.5) * 20;
            z = (Math.random() - 0.5) * 10;
            y = Math.sin(x * 0.5) * 3 + Math.cos(z * 0.5) * 2;
        } else if (shape === 'spiral') {
            const t = (i / count) * Math.PI * 20;
            const r = t * 0.15;
            x = Math.cos(t) * r;
            y = (Math.random() - 0.5) * 15;
            z = Math.sin(t) * r;
        } else if (shape === 'grid') {
            const side = Math.ceil(Math.cbrt(count));
            x = ((i % side) / side - 0.5) * 18;
            y = (Math.floor(i / side) % side / side - 0.5) * 18;
            z = (Math.floor(i / (side * side)) / side - 0.5) * 10;
        } else {
            x = (Math.random() - 0.5) * 20;
            y = (Math.random() - 0.5) * 20;
            z = (Math.random() - 0.5) * 15;
        }
        arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
    }
    return arr;
};

const morphBtn = document.getElementById('morphBtn');
morphBtn?.addEventListener('click', () => {
    morphIdx = (morphIdx + 1) % morphShapes.length;
    morphBtn.textContent = morphLabels[morphIdx].split(' ')[0];
    spawnSparkles(
        morphBtn.getBoundingClientRect().left + 27,
        morphBtn.getBoundingClientRect().top + 27,
        20
    );
    // Signal Three.js to morph (picked up in buildScene animate loop)
    window.__morphShape = morphShapes[morphIdx];
    window.__morphTrigger = true;
});

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    typeWriter();
});

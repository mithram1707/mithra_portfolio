// ── Particles Background ──
function createParticles() {
    const container = document.getElementById('particles');
    const colors = ['#6c63ff', '#f39c12', '#e74c3c', '#27ae60', '#9b59b6', '#3498db'];
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 6 + 2;
        p.style.cssText = `
            width: ${size}px; height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 15 + 10}s;
            animation-delay: ${Math.random() * 15}s;
        `;
        container.appendChild(p);
    }
}

// ── Typewriter Effect ──
const phrases = [
    'CSBS Student 🎓',
    'Problem Solver 💡',
    'AI Enthusiast 🤖',
    'Web Developer 💻',
    'Competitive Coder ⚡',
];

let phraseIdx = 0, charIdx = 0, deleting = false;
const typeEl = document.getElementById('typewriter');

function typeWriter() {
    const current = phrases[phraseIdx];
    if (deleting) {
        typeEl.textContent = current.substring(0, --charIdx);
    } else {
        typeEl.textContent = current.substring(0, ++charIdx);
    }
    if (!deleting && charIdx === current.length) {
        setTimeout(() => deleting = true, 1800);
    } else if (deleting && charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
    }
    setTimeout(typeWriter, deleting ? 60 : 100);
}

// ── Smooth Scroll for nav links ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.getElementById('navMenu').classList.remove('open');
    });
});

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 200) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });

    // Navbar solid on scroll
    const navbar = document.getElementById('navbar');
    navbar.style.background = window.scrollY > 50
        ? 'rgba(10,10,15,0.98)'
        : 'rgba(10,10,15,0.8)';
});

// ── Hamburger Toggle ──
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navMenu').classList.toggle('open');
});

// ── Scroll Reveal Animations ──
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

function initReveal() {
    const items = document.querySelectorAll(
        '.about-card, .project-card, .blog-card, .resume-block, .timeline-item, .cert-item, .achievement-item'
    );
    items.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${i * 0.07}s, transform 0.6s ease ${i * 0.07}s`;
        revealObserver.observe(el);
    });
}

// ── Mouse Sparkle on Home ──
function initSparkle() {
    const home = document.querySelector('.home-section');
    home.addEventListener('mousemove', e => {
        const s = document.createElement('div');
        const colors = ['#6c63ff','#f39c12','#e74c3c','#27ae60','#fff'];
        const size = Math.random() * 8 + 4;
        s.style.cssText = `
            position: fixed; pointer-events: none; z-index: 999;
            border-radius: 50%;
            width: ${size}px; height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${e.clientX - size/2}px; top: ${e.clientY - size/2}px;
            animation: sparkleAnim 0.8s ease-out forwards;
        `;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 800);
    });
}

// Inject sparkle keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes sparkleAnim {
        0%   { transform: scale(0) rotate(0deg); opacity: 1; }
        100% { transform: scale(2) rotate(180deg) translateY(-20px); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    typeWriter();
    initReveal();
    initSparkle();
});

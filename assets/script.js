// === Modal helpers ===
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
    }
}

function openViaClick(type) {
    window.location.hash = type;
}

function checkHashAndOpenModal() {
    const hash = window.location.hash;
    document.querySelectorAll('.modal').forEach(el => el.style.display = 'none');

    if (hash === '#policy') openModal('policy-modal');
    if (hash === '#pd') openModal('pd-modal');
    if (hash === '#offer') openModal('offer-modal');
}

// === Cookie banner ===
function acceptCookies() {
    document.getElementById('cookie-banner').style.display = 'none';
}

// === Scroll reveal ===
function initScrollReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// === Dynamic year ===
function setDynamicYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('.dynamic-year').forEach(el => {
        el.textContent = year;
    });
}

// === Floating socials visibility ===
function initFloatingSocials() {
    const staticBlock = document.getElementById('static-social-block');
    const floatingSocials = document.getElementById('floating-socials');

    if (!staticBlock || !floatingSocials) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                floatingSocials.classList.add('hidden');
            } else {
                floatingSocials.classList.remove('hidden');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(staticBlock);
}

// === Form validation ===
function initForm() {
    const form = document.getElementById('secureForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        document.querySelectorAll('.input-field').forEach(el => el.classList.remove('error-field'));
        document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');

        const nameInput = document.getElementById('form-name');
        const phoneInput = document.getElementById('form-phone');
        const emailInput = document.getElementById('form-email');

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();

        let hasError = false;

        const nameRegex = /^[А-Яа-яЁёA-Za-z\s\-]{2,100}$/;
        if (!nameRegex.test(name)) {
            nameInput.classList.add('error-field');
            document.getElementById('error-name').style.display = 'block';
            hasError = true;
        }

        const phoneRegex = /^\+[0-9\s\-]{9,18}$/;
        if (!phoneRegex.test(phone)) {
            phoneInput.classList.add('error-field');
            document.getElementById('error-phone').style.display = 'block';
            hasError = true;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email) || email.includes('..')) {
            emailInput.classList.add('error-field');
            document.getElementById('error-email').style.display = 'block';
            hasError = true;
        }

        if (!document.getElementById('agree-policy').checked || !document.getElementById('agree-pd').checked) {
            alert('Для отправки формы необходимо отметить согласие с Политикой конфиденциальности и Согласием на обработку ПД.');
            return;
        }

        if (hasError) return;

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка данных...';

        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('email', email);

        function sendFormPayload(payload) {
            fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(payload))
            })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    alert('✨ Ваше сообщение было успешно отправлено! Юридическое согласие (ПЭП) зафиксировано на сервере.');
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Подписать договор';
                } else {
                    alert('Ошибка сервера: ' + (data.message || 'Попробуйте снова'));
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Подписать договор';
                }
            })
            .catch(error => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Подписать договор';
                alert('Произошла техническая ошибка соединения с сервером. Заявка не ушла. Попробуйте снова.');
            });
        }

        sendFormPayload(formData);
    });

    // Live input error clearing
    document.querySelectorAll('.input-field').forEach(function (element) {
        element.addEventListener('input', function () {
            this.classList.remove('error-field');
            const errorId = 'error-' + this.id.replace('form-', '');
            const errorDiv = document.getElementById(errorId);
            if (errorDiv) errorDiv.style.display = 'none';
        });
    });
}

// === Parallax ===
function initParallax() {
    const bands = document.querySelectorAll('.parallax-band');
    if (!bands.length) return;

    let ticking = false;
    function update() {
        bands.forEach(band => {
            const img = band.querySelector('img');
            if (!img) return;
            const rect = band.getBoundingClientRect();
            const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.3;
            img.style.transform = `translate(-50%, ${offset}px)`;
        });
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    update();
}

// === Smooth scroll for nav links ===
function initSmoothNav() {
    document.querySelectorAll('.nav-links a, .footer-nav a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// === Cookie banner ===
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) {
        banner.style.display = 'block';
    }
}

function acceptCookies() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.style.display = 'none';
    }
    localStorage.setItem('cookiesAccepted', 'true');
}

// === Init ===
document.addEventListener('DOMContentLoaded', function () {
    checkHashAndOpenModal();
    setDynamicYear();
    initScrollReveal();
    initParallax();
    initSmoothNav();
    initCookieBanner();
    initForm();
});

window.addEventListener('hashchange', checkHashAndOpenModal);
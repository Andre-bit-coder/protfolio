document.addEventListener("DOMContentLoaded", () => {
    const isHtmlDirectoryPage = window.location.pathname.includes('/html/');
    const sharedComponentsPath = isHtmlDirectoryPage ? 'shared' : 'html/shared';
    
    // --- 1. INITIALISEER ANIMATIES (AOS) ---
    // We checken eerst of AOS geladen is om foutmeldingen te voorkomen
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }

    // --- 2. HEADER LADEN & DARK MODE LOGICA ---
    fetch(`${sharedComponentsPath}/header.html`)
        .then(response => {
            if (!response.ok) throw new Error("Header not found");
            return response.text();
        })
        .then(data => {
            document.getElementById('header').innerHTML = data;

            // Rewrite shared-header links for root pages where needed.
            if (!isHtmlDirectoryPage) {
                document.querySelectorAll('#header [data-root-href]').forEach((el) => {
                    const rootHref = el.getAttribute('data-root-href');
                    if (rootHref) {
                        el.setAttribute('href', rootHref);
                    }
                });
            }

            // Nu de header er is, kunnen we de Dark Mode knop zoeken
            const toggleSwitch = document.querySelector('#checkbox');
            const currentTheme = localStorage.getItem('theme');

            // Check eerdere keuze uit localStorage
            if (currentTheme) {
                document.body.classList.add(currentTheme);
                // Zet het schuifje goed als light mode aan staat
                if (currentTheme === 'light-mode' && toggleSwitch) {
                    toggleSwitch.checked = true;
                }
            }

            // Luister naar klik op de schakelaar
            if (toggleSwitch) {
                toggleSwitch.addEventListener('change', function (e) {
                    if (e.target.checked) {
                        document.body.classList.add('light-mode');
                        localStorage.setItem('theme', 'light-mode');
                    } else {
                        document.body.classList.remove('light-mode');
                        localStorage.setItem('theme', null);
                    }
                });
            }
        })
        .catch(error => console.error('Error loading header:', error));

    // --- 3. FOOTER LADEN ---
    fetch(`${sharedComponentsPath}/footer.html`)
        .then(response => response.text())
        .then(data => document.getElementById('footer').innerHTML = data);


    // --- 4. IMAGE ZOOM / LIGHTBOX ---
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
        <button type="button" class="image-lightbox-close" aria-label="Close image">&times;</button>
        <img class="image-lightbox-img" alt="Zoomed image preview">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.image-lightbox-img');
    const lightboxCloseBtn = lightbox.querySelector('.image-lightbox-close');

    const closeLightbox = () => {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('image-zoom-open');
        lightboxImg.removeAttribute('src');
        lightboxImg.removeAttribute('alt');
    };

    const openLightbox = (img) => {
        const src = img.currentSrc || img.src;
        if (!src) return;

        lightboxImg.src = src;
        lightboxImg.alt = img.alt || 'Zoomed image';
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('image-zoom-open');
    };

    document.querySelectorAll('img').forEach((img) => {
        if (img.closest('#header') || img.closest('#footer') || img.closest('#projects') || img.classList.contains('no-zoom')) return;
        img.classList.add('zoomable-image');
    });

    document.addEventListener('click', (event) => {
        const clickedImage = event.target.closest('img.zoomable-image');

        if (clickedImage) {
            openLightbox(clickedImage);
            return;
        }

        if (event.target === lightbox || event.target === lightboxCloseBtn) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
            closeLightbox();
        }
    });


    // --- 5. CONTACT FORMULIER LOGICA ---
    const form = document.getElementById('myForm');
    const submitBtn = document.getElementById('submitButton');
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('confirmationModal');
    const confirmBtn = document.getElementById('confirmButton');
    const cancelBtn = document.getElementById('cancelButton');

    // Alleen uitvoeren als het formulier op de pagina bestaat (voorkomt fouten op andere pagina's)
    if (form) {
        submitBtn.addEventListener('click', (e) => {
            if (form.checkValidity()) {
                e.preventDefault();
                overlay.style.display = 'block';
                modal.style.display = 'block';
            } else {
                // Forceer de browser om validatie foutmeldingen te tonen
                form.reportValidity();
            }
        });

        cancelBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
            modal.style.display = 'none';
        });

        confirmBtn.addEventListener('click', () => {
            // Collect form data
            const formData = new FormData(form);
            
            // Submit form via fetch API to Formspree
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Formspree response:', data);
                alert('Bericht succesvol verstuurd! Dank je wel voor je bericht.');
                overlay.style.display = 'none';
                modal.style.display = 'none';
                form.reset();
            })
            .catch(error => {
                console.error('Error details:', error);
                alert('Er is een fout opgetreden bij het verzenden van het bericht. Probeer het later opnieuw.');
                overlay.style.display = 'none';
                modal.style.display = 'none';
            });
        });
    }
});  
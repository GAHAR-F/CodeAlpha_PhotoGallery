// Photo Gallery Lightbox with Navigation
class PhotoGallery {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.currentCategory = 'checked1';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.collectImages();
        this.setupKeyboardNavigation();
    }

    setupEventListeners() {
        // Lightbox elements
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightbox-img');
        this.closeBtn = document.querySelector('.close-btn');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.imageCounter = document.getElementById('image-counter');

        // Close lightbox events
        this.closeBtn.addEventListener('click', () => this.closeLightbox());
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) this.closeLightbox();
        });

        // Navigation events
        this.prevBtn.addEventListener('click', () => this.showPrevious());
        this.nextBtn.addEventListener('click', () => this.showNext());

        // View button events
        document.addEventListener('click', (e) => {
            console.log('Click detected on:', e.target);
            if (e.target.classList.contains('view-btn')) {
                console.log('View button clicked!');
                const picContainer = e.target.closest('.pic');
                if (picContainer) {
                    console.log('Found pic container:', picContainer);
                    this.openLightbox(picContainer);
                } else {
                    console.log('No pic container found');
                }
            }
        });

        // Category filter events
        document.querySelectorAll('input[name="Photos"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentCategory = e.target.id.replace('checked', '');
                this.updateImageCollection();
            });
        });
    }

    collectImages() {
        this.images = Array.from(document.querySelectorAll('.pic')).map((pic, index) => ({
            element: pic,
            src: pic.querySelector('img').src,
            alt: pic.querySelector('img').alt,
            category: pic.dataset.category,
            index: index
        }));
        this.updateImageCollection();
    }

    updateImageCollection() {
        if (this.currentCategory === 'checked1') {
            // All photos
            this.filteredImages = this.images;
        } else if (this.currentCategory === 'checked2') {
            // Family photos
            this.filteredImages = this.images.filter(img => img.category === 'family');
        } else if (this.currentCategory === 'checked3') {
            // Childs photos
            this.filteredImages = this.images.filter(img => img.category === 'childs');
        } else if (this.currentCategory === 'checked4') {
            // Places photos
            this.filteredImages = this.images.filter(img => img.category === 'places');
        }
    }

    openLightbox(picContainer) {
        console.log('Opening lightbox for:', picContainer);
        const img = picContainer.querySelector('img');
        const src = img.src;
        const alt = img.alt;
        
        console.log('Image src:', src);
        console.log('Filtered images:', this.filteredImages);
        
        // Find current image index in filtered collection
        this.currentIndex = this.filteredImages.findIndex(img => img.src === src);
        if (this.currentIndex === -1) this.currentIndex = 0;
        
        console.log('Current index:', this.currentIndex);
        
        this.lightboxImg.src = src;
        this.lightboxImg.alt = alt;
        this.updateNavigation();
        this.showLightbox();
    }

    showLightbox() {
        console.log('Showing lightbox');
        console.log('Lightbox element:', this.lightbox);
        this.lightbox.style.display = 'flex';
        setTimeout(() => {
            this.lightbox.classList.add('show');
            console.log('Lightbox shown with class');
        }, 10);
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightbox.classList.remove('show');
        setTimeout(() => {
            this.lightbox.style.display = 'none';
        }, 300);
        document.body.style.overflow = 'auto';
    }

    showNext() {
        if (this.filteredImages.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.filteredImages.length;
        this.updateLightboxImage();
        this.updateNavigation();
    }

    showPrevious() {
        if (this.filteredImages.length === 0) return;
        
        this.currentIndex = this.currentIndex === 0 
            ? this.filteredImages.length - 1 
            : this.currentIndex - 1;
        this.updateLightboxImage();
        this.updateNavigation();
    }

    updateLightboxImage() {
        const currentImage = this.filteredImages[this.currentIndex];
        if (currentImage) {
            this.lightboxImg.src = currentImage.src;
            this.lightboxImg.alt = currentImage.alt;
        }
    }

    updateNavigation() {
        if (this.filteredImages.length <= 1) {
            this.prevBtn.style.display = 'none';
            this.nextBtn.style.display = 'none';
        } else {
            this.prevBtn.style.display = 'block';
            this.nextBtn.style.display = 'block';
        }
        
        this.imageCounter.textContent = `${this.currentIndex + 1} / ${this.filteredImages.length}`;
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('show')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.showPrevious();
                    break;
                case 'ArrowRight':
                    this.showNext();
                    break;
            }
        });
    }
}

// Touch/swipe support for mobile devices
class TouchNavigation {
    constructor(gallery) {
        this.gallery = gallery;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        const lightbox = document.getElementById('lightbox');
        
        lightbox.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        });

        lightbox.addEventListener('touchend', (e) => {
            this.endX = e.changedTouches[0].clientX;
            this.endY = e.changedTouches[0].clientY;
            this.handleSwipe();
        });
    }

    handleSwipe() {
        const diffX = this.startX - this.endX;
        const diffY = this.startY - this.endY;
        const minSwipeDistance = 50;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                // Swipe left - next image
                this.gallery.showNext();
            } else {
                // Swipe right - previous image
                this.gallery.showPrevious();
            }
        }
    }
}

// Image loading optimization
class ImageLoader {
    constructor() {
        this.setupLazyLoading();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('.pic img');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.remove('loading');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            img.classList.add('loading');
            imageObserver.observe(img);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const gallery = new PhotoGallery();
    const touchNav = new TouchNavigation(gallery);
    const imageLoader = new ImageLoader();
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add loading animation for images
    const images = document.querySelectorAll('.pic img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.parentElement.classList.remove('loading');
        });
    });
});

// Add some additional interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add click sound effect (optional)
    const addClickSound = () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.1;
        return audio;
    };

    // Add click sound to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sound = addClickSound();
            sound.play().catch(() => {}); // Ignore errors if audio fails
        });
    });

    // Add hover effect for navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
    });
});

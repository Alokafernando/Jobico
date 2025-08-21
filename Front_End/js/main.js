let currentPage = 1;
const itemsPerPage = 6;
const categoryCards = document.querySelectorAll('.category-card');
const totalPages = Math.ceil(categoryCards.length / itemsPerPage);

function showPage(page) {
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Show/hide cards for current page
    categoryCards.forEach((card, index) => {
        card.style.display = (index >= startIndex && index < endIndex) ? 'flex' : 'none';
    });

    // Update pagination buttons
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach((btn, index) => {
        if (index === 0) { // Previous button
            btn.disabled = (currentPage === 1);
            btn.classList.toggle('disabled', currentPage === 1);
        } else if (index === paginationButtons.length - 1) { // Next button
            btn.disabled = (currentPage === totalPages);
            btn.classList.toggle('disabled', currentPage === totalPages);
        } else if (index <= totalPages) { // Numbered buttons
            btn.textContent = index;
            btn.classList.toggle('active', index === page);
        }
    });
}

function nextPage() {
    if (currentPage < totalPages) {
        showPage(currentPage + 1);
    }
}

function prevPage() {
    if (currentPage > 1) {
        showPage(currentPage - 1);
    }
}

// Add click handlers for pagination buttons
document.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.textContent === '❮') {
            prevPage();
        } else if (this.textContent === '❯') {
            nextPage();
        } else {
            const pageNumber = parseInt(this.textContent);
            if (!isNaN(pageNumber)) {
                showPage(pageNumber);
            }
        }
    });
});

// Initialize first page
showPage(1);

// Job tabs functionality
function showJobs(type) {
    document.querySelectorAll('.job-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    event.target.classList.add('active');

    console.log('Showing jobs for:', type);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(20px)';
        header.querySelector('.logo').style.color = '#333';
        header.querySelectorAll('.nav-links a').forEach(link => {
            link.style.color = '#333';
        });
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.05)';
        header.style.backdropFilter = 'blur(10px)';
        header.querySelector('.logo').style.color = 'white';
        header.querySelectorAll('.nav-links a').forEach(link => {
            link.style.color = 'rgba(255, 255, 255, 0.9)';
        });
    }
});

// Search form submission
document.querySelector('.search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const jobTitle = this.querySelector('.search-input').value;
    const location = this.querySelector('.location-dropdown').value;

    if (jobTitle.trim() === '') {
        alert('Please enter a job title or keyword');
        return;
    }

    console.log('Searching for:', jobTitle, 'in', location);
    alert(`Searching for "${jobTitle}" jobs in ${location}`);
});

// Newsletter subscription
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('.newsletter-input').value;

    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }

    alert('Thank you for subscribing to our newsletter!');
    this.querySelector('.newsletter-input').value = '';
});

// Apply button functionality
document.querySelectorAll('.apply-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const jobTitle = this.closest('.job-card').querySelector('.job-title').textContent;
        alert(`Application started for: ${jobTitle}\nYou would be redirected to the application form.`);
    });
});

// Category search function
function searchCategory(category) {
    alert(`Searching for jobs in ${category} category`);
    // In a real implementation, this would filter jobs by category
}
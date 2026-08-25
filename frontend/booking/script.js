document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. MOBILE MENU TOGGLE & SLIDE ANIMATION ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            // Toggle the menu slide animation
            mobileMenu.classList.toggle('open');
            
            // Toggle the "open" class on the button (triggers the lines -> X animation)
            mobileMenuBtn.classList.toggle('open');
        });

        // Close mobile menu when a link is clicked
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open'); // Slide up
                mobileMenuBtn.classList.remove('open'); // Turn X back to lines
            
                // Saves the click so the line remains stuck when you reload
                const sectionId = link.getAttribute('href').substring(1);
                if(sectionId) {
                    sessionStorage.setItem('activeSection', sectionId);
                }
            });
        });
    }

    // =========================================
    // 2. ACTIVE NAV LINK HIGHLIGHTING
    // =========================================
    const sections = document.querySelectorAll('section[id]');
    const desktopNavLinks = document.querySelectorAll('#desktop-nav .nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function setActiveLink(activeId) {
        desktopNavLinks.forEach(link => link.classList.remove('active'));
        mobileNavLinks.forEach(link => link.classList.remove('active'));

        desktopNavLinks.forEach(link => {
            if (link.getAttribute('href') === `#${activeId}` || 
                (activeId === 'home' && link.getAttribute('href') === '../index.html')) {
                link.classList.add('active');
            }
        });
        mobileNavLinks.forEach(link => {
            if (link.getAttribute('href') === `#${activeId}` || 
                (activeId === 'home' && link.getAttribute('href') === '../index.html')) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        if (current) setActiveLink(current);
    });


    // =========================================
    // 3. BOOKING FORM - CHARACTER COUNTER
    // =========================================
    const notes = document.getElementById('notes');
    if(notes) {
        notes.addEventListener('input', function() {
            document.getElementById('charCount').innerText = this.value.length;
        });
    }

    // =========================================
    // 4. LIVE UPDATE PAYMENT METHOD IN SUMMARY
    // =========================================
    const paymentDropdown = document.getElementById('paymentSelect');
    if (paymentDropdown) {
        paymentDropdown.addEventListener('change', function() {
            updateSummary(); // Updates the "Payment Method" row instantly
        });
    }

    // =========================================
    // 5. RUN INITIAL PRICE CALCULATION
    // =========================================
    updateSummary();
});


// =========================================
// 6. SERVICE SELECTION & LIVE PRICING
// =========================================
function updateServiceFromDropdown() {
    const select = document.getElementById('serviceSelect');
    const value = select.value; 
    
    if(value) {
        const parts = value.split('|');
        return {
            price: parseFloat(parts[0]),
            name: parts[1]
        };
    }
    return { price: 0, name: "Select Service" };
}

function updateSummary() {
    console.log("--- Recalculating Price ---");

    const areaInput = document.getElementById('floorArea');
    const area = parseInt(areaInput.value) || 0;

    const serviceData = updateServiceFromDropdown();
    const currentPrice = serviceData.price;
    const currentService = serviceData.name;

    const subtotal = area * currentPrice;
    const formattedTotal = subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const priceDisplay = document.getElementById('priceDisplay');
    if(priceDisplay) {
        priceDisplay.innerText = "P " + currentPrice.toFixed(2);
    }

    const sumTotalElement = document.getElementById('sumTotal');
    if(sumTotalElement) {
        sumTotalElement.innerText = "P " + formattedTotal;
    }

    // --- UPDATE PAYMENT METHOD ROW (FIXED ID) ---
    const paymentSelect = document.getElementById('paymentSelect');
    const summaryPaymentSpan = document.getElementById('sumPaymentMethod'); // This matches your HTML

    if (paymentSelect && summaryPaymentSpan) {
        const selectedIndex = paymentSelect.selectedIndex;
        
        // Only show the name if a real option is selected
        if (selectedIndex > 0) {
            const selectedText = paymentSelect.options[selectedIndex].text;
            summaryPaymentSpan.textContent = selectedText; // Shows "GCash", "Maya", or "Cash"
        } else {
            summaryPaymentSpan.textContent = "-"; // Shows dash if nothing is picked
        }
    }
    // ----------------------------------

    document.getElementById('sumService').innerText = currentService;
    document.getElementById('sumPrice').innerText = "P" + currentPrice.toFixed(2);
    document.getElementById('sumArea').innerText = area + " sqm";
    document.getElementById('sumSubtotal').innerText = "P" + formattedTotal;
    document.getElementById('sidebarTotal').innerText = "P" + formattedTotal;
}

function selectPaymentDropdown() {
    // This function is now optional, but kept for compatibility with your HTML onchange
    updateSummary();
}

// =========================================
// 7. CONNECT THE SUBMIT BUTTON TO BACKEND
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.querySelector('button.w-full.bg-brand-dark');

    if (submitBtn) {
        submitBtn.addEventListener('click', async function() {
            const fullName = document.querySelector('input[placeholder="Enter your full name"]').value;
            const phone = document.querySelector('input[placeholder="Enter your phone number"]').value;
            const email = document.querySelector('input[placeholder="Enter your email address"]').value;
            const address = document.querySelector('textarea[placeholder="Enter your complete address"]').value;
            
            const serviceSelect = document.getElementById('serviceSelect');
            const [price, serviceName] = serviceSelect.value.split('|');
            
            const area = document.getElementById('floorArea').value;
            const date = document.querySelector('input[type="date"]').value;
            const time = document.querySelector('select[class*="pl-10"]').value;
            const payment = document.getElementById('paymentSelect').value;
            const notes = document.getElementById('notes').value;

            if(!fullName || !phone || !email || !address || !serviceSelect.value || !area || !date || !time || !payment) {
                alert("Please fill out all required fields before submitting.");
                return;
            }

            const bookingData = {
                full_name: fullName,
                phone: phone,
                email: email,
                service_address: address,
                service_type: serviceName,
                area_size: parseFloat(area),
                price_per_sqm: parseFloat(price),
                total_price: parseFloat(area) * parseFloat(price),
                preferred_date: date,
                preferred_time: time,
                payment_method: payment,
                notes: notes
            };

            try {
                // 🔒 SECURITY FIX: Use the correct API URL (Works with CORS)
                const response = await fetch('http://localhost:5000/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });

                const result = await response.json();

                if (result.success) {
                    alert(`✅ Booking Successful! Your Booking ID is: ${result.bookingId}`);
    
                    document.querySelector('input[placeholder="Enter your full name"]').value = '';
                    document.querySelector('input[placeholder="Enter your phone number"]').value = '';
                    document.querySelector('input[placeholder="Enter your email address"]').value = '';
                    document.querySelector('textarea[placeholder="Enter your complete address"]').value = '';
                    document.getElementById('floorArea').value = '';
                    document.getElementById('notes').value = '';
    
                    document.getElementById('serviceSelect').selectedIndex = 0;
                    document.querySelector('select[class*="pl-10"]').selectedIndex = 0;
                    document.getElementById('paymentSelect').selectedIndex = 0;
    
                    document.querySelector('input[type="date"]').value = '';

                    updateSummary();

                } else {
                    alert(`❌ Error: ${result.message}`);
                }

            } catch (error) {
                console.error('Error submitting booking:', error);
                alert('❌ Failed to connect to the server. Please make sure your backend is running on port 5000.');
            }
        });
    }
});

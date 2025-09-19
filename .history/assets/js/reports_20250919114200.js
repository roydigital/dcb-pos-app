let currentReportOrders = [];
const reportHeading = document.getElementById('report-heading');
const totalRevenueEl = document.getElementById('total-revenue');
const orderCountEl = document.getElementById('order-count');
const upiTotalEl = document.getElementById('upi-total');
const cashTotalEl = document.getElementById('cash-total');
const tableBody = document.getElementById('report-table-body');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function updateHeading(startDate, endDate) {
    const startStr = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endStr = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    if (startStr === endStr) {
        if (formatDate(startDate) === formatDate(new Date())) {
            reportHeading.textContent = "Today's Sales Report";
        } else {
            reportHeading.textContent = `Sales Report for ${startStr}`;
        }
    } else {
        reportHeading.textContent = `Sales Report: ${startStr} to ${endStr}`;
    }
}

async function generateReport(startDate, endDate) {
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    
    updateHeading(startDate, endDate);

    try {
        const response = await fetch(`/api/reports?startDate=${startDateStr}&endDate=${endDateStr}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        currentReportOrders = data.orders; // Store orders globally

        // Update stat cards
        totalRevenueEl.textContent = `₹${data.totalRevenue.toFixed(2)}`;
        orderCountEl.textContent = data.orderCount;
        upiTotalEl.textContent = `₹${(data.paymentBreakdown.upi || 0).toFixed(2)}`;
        cashTotalEl.textContent = `₹${(data.paymentBreakdown.cash || 0).toFixed(2)}`;

        // Populate table
        tableBody.innerHTML = ''; // Clear existing rows

        if (data.orders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500">No delivered orders found for the selected period.</td></tr>`;
            return;
        }

        data.orders.forEach(order => {
            const itemsSummary = order.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
            const row = `
                <tr class="hover:bg-gray-700 clickable-row" data-order-id="${order._id}">
                    <td class="px-6 py-4 whitespace-nowrap font-medium">#${order.orderNumber}</td>
                    <td class="px-6 py-4 whitespace-normal">${itemsSummary}</td>
                    <td class="px-6 py-4 whitespace-nowrap font-semibold">₹${order.totalAmount.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap capitalize">${order.paymentMode}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error('Failed to fetch sales report:', error);
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Error loading report. Please check the console.</td></tr>`;
    }
}

function updateTime() {
    const timeEl = document.getElementById('current-time');
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function setupEventListeners() {
    document.getElementById('btn-today').addEventListener('click', () => {
        const today = new Date();
        generateReport(today, today);
    });

    document.getElementById('btn-yesterday').addEventListener('click', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        generateReport(yesterday, yesterday);
    });

    document.getElementById('btn-last-7-days').addEventListener('click', () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        generateReport(startDate, endDate);
    });

    document.getElementById('btn-this-week').addEventListener('click', () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, etc.
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        generateReport(startDate, endDate);
    });

    document.getElementById('btn-last-week').addEventListener('click', () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() - dayOfWeek - 1);
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);
        generateReport(startDate, endDate);
    });

    document.getElementById('btn-last-30-days').addEventListener('click', () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);
        generateReport(startDate, endDate);
    });

    document.getElementById('btn-this-month').addEventListener('click', () => {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        generateReport(startDate, endDate);
    });

    document.getElementById('btn-generate').addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        if (startDate && endDate) {
            generateReport(new Date(startDate), new Date(endDate));
        } else {
            alert('Please select both a start and end date.');
        }
    });
}

// Modal Logic
const modal = document.getElementById('order-details-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');

function hideModal() {
    modal.style.display = 'none';
}

tableBody.addEventListener('click', (event) => {
    const row = event.target.closest('.clickable-row');
    if (!row) return;

    const orderId = row.dataset.orderId;
    const orderData = currentReportOrders.find(o => o._id === orderId);

    if (!orderData) return;

    // Correctly format and display the date
    document.getElementById('modal-date').textContent = new Date(orderData.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

    // Populate standard fields
    document.getElementById('modal-order-number').textContent = `#${orderData.orderNumber}`;
    document.getElementById('modal-total-amount').textContent = `₹${orderData.totalAmount.toFixed(2)}`;
    document.getElementById('modal-payment-mode').textContent = orderData.paymentMode;

    // Correctly display customer details with a fallback
    const customerName = orderData.customerName || 'Walk-in Customer';
    const customerPhone = orderData.customerPhone || 'N/A';
    document.getElementById('modal-customer').textContent = `${customerName} (${customerPhone})`;

    // Correctly generate and display the items list
    const itemsListEl = document.getElementById('modal-items');
    itemsListEl.innerHTML = ''; // Clear previous items
    orderData.items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.quantity}x ${item.name} - ₹${item.price.toFixed(2)}`;
        itemsListEl.appendChild(li);
    });

    // Correctly display the notes, but only if they exist
    const notesContainer = document.getElementById('modal-notes-container');
    const notesContent = document.getElementById('modal-notes');
    if (orderData.notes && orderData.notes.trim() !== '') {
        notesContent.textContent = orderData.notes;
        notesContainer.style.display = 'block'; // Show the notes section
    } else {
        notesContainer.style.display = 'none'; // Hide if no notes
    }

    // Show the modal
    document.getElementById('order-details-modal').style.display = 'flex';
});

modalCloseBtn.addEventListener('click', hideModal);
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        hideModal();
    }
});

// Initial calls
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    generateReport(today, today);
    setupEventListeners();
});
updateTime();
setInterval(updateTime, 1000);

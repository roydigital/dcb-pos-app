async function fetchAndDisplayCustomers() {
    const tableBody = document.getElementById('customer-table-body');
    tableBody.innerHTML = ''; // Clear existing rows
    try {
        const response = await fetch('/api/customers');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const customers = await response.json();

        if (customers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No customers found.</td></tr>';
            return;
        }

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-700';

            const customerSince = new Date(customer.createdAt).toLocaleDateString();
            const lastOrdered = customer.lastOrdered ? new Date(customer.lastOrdered).toLocaleDateString() : 'N/A';

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${customer.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${customer.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap">${customerSince}</td>
                <td class="px-6 py-4 whitespace-nowrap">${lastOrdered}</td>
                <td class="px-6 py-4 whitespace-nowrap">${customer.totalOrders}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Failed to fetch customers:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading customer data.</td></tr>';
    }
}

function updateTime() {
    const timeEl = document.getElementById('current-time');
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

document.getElementById('export-btn').addEventListener('click', () => {
    window.location.href = '/api/customers/export';
});

// Initial calls
document.addEventListener('DOMContentLoaded', fetchAndDisplayCustomers);
updateTime();

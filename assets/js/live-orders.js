async function fetchAndDisplayOrders() {
    const grid = document.getElementById('live-orders-grid');
    try {
        const response = await fetch('http://localhost:3006/api/orders/today');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const orders = await response.json();

        grid.innerHTML = ''; // Clear previous orders

        if (orders.length === 0) {
            grid.innerHTML = '<p class="text-gray-500 col-span-full text-center">No orders for today yet.</p>';
            return;
        }

        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'order-card';

            const itemsList = order.items.map(item => 
                `<li>${item.quantity}x ${item.name}</li>`
            ).join('');

            const notesSection = order.notes ? `<p class="text-yellow-400 mt-2"><strong>Notes:</strong> ${order.notes}</p>` : '';

            card.innerHTML = `
                <div>
                    <h3 class="text-xl font-bold text-white mb-2">Order #${order.orderNumber}</h3>
                    <p class="text-gray-400 mb-4">${order.customerName || 'Walk-in Customer'}</p>
                    <ul class="text-gray-300 space-y-1 mb-4 list-disc list-inside">
                        ${itemsList}
                    </ul>
                    ${notesSection}
                    <p class="text-lg font-semibold text-white border-t border-gray-700 pt-2 mt-2">Total: ₹${order.totalAmount.toFixed(2)}</p>
                </div>
                <div class="flex space-x-2 mt-4">
                    <button data-id="${order._id}" class="mark-delivered-btn w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                        Mark as Delivered
                    </button>
                    <button data-id="${order._id}" class="cancel-btn w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                        Cancel Order
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        grid.innerHTML = '<p class="text-red-500 col-span-full text-center">Failed to load orders. Please check the connection.</p>';
    }
}

function updateTime() {
    const timeEl = document.getElementById('current-time');
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Initial calls and interval
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayOrders();
    setInterval(fetchAndDisplayOrders, 15000); // Refresh every 15 seconds
    
    updateTime();
    setInterval(updateTime, 1000); // Update time every second

    // Event listener for order actions
    document.getElementById('live-orders-grid').addEventListener('click', async (event) => {
        const target = event.target;
        const orderId = target.dataset.id;

        if (target.classList.contains('mark-delivered-btn')) {
            try {
                const response = await fetch(`http://localhost:3006/api/orders/${orderId}/deliver`, {
                    method: 'PATCH',
                });
                if (!response.ok) throw new Error('Failed to deliver order');
                fetchAndDisplayOrders();
            } catch (error) {
                console.error('Error delivering order:', error);
                alert('Failed to mark order as delivered.');
            }
        }

        if (target.classList.contains('cancel-btn')) {
            if (confirm('Are you sure you want to cancel this order?')) {
                try {
                    const response = await fetch(`http://localhost:3006/api/orders/${orderId}/cancel`, {
                        method: 'PATCH',
                    });
                    if (!response.ok) throw new Error('Failed to cancel order');
                    fetchAndDisplayOrders();
                } catch (error) {
                    console.error('Error canceling order:', error);
                    alert('Failed to cancel order.');
                }
            }
        }
    });
});

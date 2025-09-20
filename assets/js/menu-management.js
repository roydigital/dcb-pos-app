let menuData = []; // Cache for menu data

async function fetchAndDisplayMenu() {
    const tableBody = document.getElementById('menu-table-body');
    tableBody.innerHTML = ''; // Clear existing menu
    try {
        const response = await fetch('http://localhost:3006/api/menu');
        if (!response.ok) throw new Error('Failed to fetch menu');
        menuData = await response.json();

        if (menuData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">No menu items found.</td></tr>';
            return;
        }

        menuData.forEach(item => {
            const prices = item.prices.map(p => `${p.size}: ₹${p.price.toFixed(2)}`).join(', ');
            const row = `
                <tr class="hover:bg-gray-700">
                    <td class="px-6 py-4 whitespace-nowrap">${item.category}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${item.name}</td>
                    <td class="px-6 py-4 whitespace-normal">${prices}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="edit-btn text-blue-500 hover:text-blue-700 mr-4" data-id="${item._id}">Edit</button>
                        <button class="delete-btn text-red-500 hover:text-red-700" data-id="${item._id}">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Error loading menu.</td></tr>';
    }
}

// --- Add New Item Logic ---
document.getElementById('add-price-btn').addEventListener('click', () => {
    const container = document.getElementById('price-options-container');
    const newPriceOption = document.createElement('div');
    newPriceOption.className = 'flex items-center space-x-2';
    newPriceOption.innerHTML = `
        <input type="text" name="size" placeholder="Size (e.g., Full)" required class="block w-1/2 bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-red-500 focus:border-red-500">
        <input type="number" name="price" placeholder="Price" required class="block w-1/2 bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-red-500 focus:border-red-500">
    `;
    container.appendChild(newPriceOption);
});

document.getElementById('add-item-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const prices = [];
    const sizes = formData.getAll('size');
    const priceValues = formData.getAll('price');
    for (let i = 0; i < sizes.length; i++) {
        if (sizes[i] && priceValues[i]) {
            prices.push({ size: sizes[i], price: parseFloat(priceValues[i]) });
        }
    }

    const itemData = {
        category: formData.get('category'),
        name: formData.get('name'),
        prices: prices
    };

    try {
        const response = await fetch('http://localhost:3006/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
        });

        if (!response.ok) throw new Error('Failed to save item');
        
        form.reset();
        const priceContainer = document.getElementById('price-options-container');
        while (priceContainer.children.length > 1) {
            priceContainer.removeChild(priceContainer.lastChild);
        }

        fetchAndDisplayMenu(); // Refresh the menu
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Failed to save menu item.');
    }
});

// --- Edit and Delete Logic ---
document.getElementById('menu-table-body').addEventListener('click', async (event) => {
    const target = event.target;
    const id = target.dataset.id;

    // Handle Delete
    if (target.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await fetch(`http://localhost:3006/api/menu/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to delete item');
                fetchAndDisplayMenu(); // Refresh table
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item.');
            }
        }
    }

    // Handle Edit
    if (target.classList.contains('edit-btn')) {
        const item = menuData.find(i => i._id === id);
        if (item) {
            document.getElementById('edit-item-id').value = item._id;
            document.getElementById('edit-category').value = item.category;
            document.getElementById('edit-item-name').value = item.name;
            
            const priceContainer = document.getElementById('edit-price-options-container');
            priceContainer.innerHTML = ''; // Clear previous price fields
            item.prices.forEach(p => {
                const priceRow = document.createElement('div');
                priceRow.className = 'flex items-center space-x-2';
                priceRow.innerHTML = `
                    <input type="text" name="size" value="${p.size}" required class="block w-1/2 bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white">
                    <input type="number" name="price" value="${p.price}" required class="block w-1/2 bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white">
                `;
                priceContainer.appendChild(priceRow);
            });

            document.getElementById('edit-item-modal').style.display = 'block';
        }
    }
});

// Add price option in edit modal
document.getElementById('edit-add-price-btn').addEventListener('click', () => {
    const container = document.getElementById('edit-price-options-container');
    const newPriceOption = document.createElement('div');
    newPriceOption.className = 'flex items-center space-x-2';
    newPriceOption.innerHTML = `
        <input type="text" name="size" placeholder="Size" required class="block w-1/2 bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white">
        <input type="number" name="price" placeholder="Price" required class="block w-1/2 bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white">
    `;
    container.appendChild(newPriceOption);
});

// Handle Edit Form Submission
document.getElementById('edit-item-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('edit-item-id').value;
    const form = event.target;
    const formData = new FormData(form);

    const prices = [];
    const sizes = formData.getAll('size');
    const priceValues = formData.getAll('price');
    for (let i = 0; i < sizes.length; i++) {
         if (sizes[i] && priceValues[i]) {
            prices.push({ size: sizes[i], price: parseFloat(priceValues[i]) });
        }
    }

    const updatedData = {
        category: formData.get('category'),
        name: formData.get('name'),
        prices: prices
    };

    try {
        const response = await fetch(`http://localhost:3006/api/menu/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) throw new Error('Failed to update item');
        
        document.getElementById('edit-item-modal').style.display = 'none';
        fetchAndDisplayMenu();
    } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item.');
    }
});

// Cancel Edit
document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    document.getElementById('edit-item-modal').style.display = 'none';
});

// --- Utility Functions ---
function updateTime() {
    const timeEl = document.getElementById('current-time');
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Initial calls
document.addEventListener('DOMContentLoaded', fetchAndDisplayMenu);
updateTime();
setInterval(updateTime, 1000);

// --- Bulk Price Update Logic ---
document.getElementById('increase-prices-btn').addEventListener('click', () => handleBulkUpdate('increase'));
document.getElementById('decrease-prices-btn').addEventListener('click', () => handleBulkUpdate('decrease'));

async function handleBulkUpdate(direction) {
    const percentageInput = document.getElementById('percentage-input');
    const percentage = parseFloat(percentageInput.value);

    if (isNaN(percentage) || percentage <= 0) {
        alert('Please enter a valid percentage greater than 0.');
        return;
    }

    const confirmationMessage = `Are you sure you want to ${direction} all prices by ${percentage}%? This action cannot be undone.`;
    if (!confirm(confirmationMessage)) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3006/api/menu/bulk-update-prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ percentage, direction })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update prices.');
        }

        alert('Prices updated successfully!');
        percentageInput.value = ''; // Clear input
        fetchAndDisplayMenu(); // Refresh the menu
    } catch (error) {
        console.error('Error during bulk price update:', error);
        alert(`An error occurred: ${error.message}`);
    }
}

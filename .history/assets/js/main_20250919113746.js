let currentOrder = [];
let fullMenuList = [];

function populateMenu(menuItemsToShow) {
    const menuGrid = document.getElementById('menu-grid');
    menuGrid.innerHTML = ''; // Clear existing items

    menuItemsToShow.forEach(item => {
        item.prices.forEach(priceInfo => {
        const button = document.createElement('button');
        
        // Conditional background colors based on portion size
        if (priceInfo.size === 'Half') {
            button.className = 'bg-sky-700 hover:bg-sky-600 text-white font-semibold py-3 px-2 rounded-lg text-sm flex flex-col justify-center items-center shadow-lg transition-colors duration-200';
        } else if (priceInfo.size === 'Full') {
            button.className = 'bg-teal-700 hover:bg-teal-600 text-white font-semibold py-3 px-2 rounded-lg text-sm flex flex-col justify-center items-center shadow-lg transition-colors duration-200';
        } else {
            button.className = 'bg-gray-700 hover:bg-red-600 text-white font-semibold py-3 px-2 rounded-lg text-sm flex flex-col justify-center items-center shadow-lg transition-colors duration-200';
        }

        let itemName = item.name;
        if (priceInfo.size !== 'Standard') {
            itemName += ` (${priceInfo.size})`;
        }
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = itemName;
        nameSpan.className = 'text-center';

        const priceSpan = document.createElement('span');
        priceSpan.textContent = `₹${priceInfo.price.toFixed(2)}`;
        priceSpan.className = 'text-lg font-bold mt-1';

        button.appendChild(nameSpan);
        button.appendChild(priceSpan);
        
        button.addEventListener('click', () => addToOrder(itemName, priceInfo.price));
        
        menuGrid.appendChild(button);
        });
    });
}

async function fetchAndDisplayMenu() {
    const menuGrid = document.getElementById('menu-grid');
    try {
        const response = await fetch('/api/menu');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        fullMenuList = await response.json();
        populateMenu(fullMenuList);
    } catch (error) {
        console.error("Failed to fetch menu:", error);
        menuGrid.innerHTML = `<p class="text-red-400 col-span-full text-center">Failed to load menu. Please check the connection and try again.</p>`;
    }
}

function addToOrder(itemName, itemPrice) {
    const existingItem = currentOrder.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        currentOrder.push({ name: itemName, price: itemPrice, quantity: 1 });
    }
    renderOrder();
}

function renderOrder() {
    const orderItemsDiv = document.getElementById('order-items');
    orderItemsDiv.innerHTML = '';

    if (currentOrder.length === 0) {
        orderItemsDiv.innerHTML = '<p class="text-gray-500">Click on a menu item to start an order.</p>';
        orderItemsDiv.classList.add('flex', 'items-center', 'justify-center');
    } else {
        orderItemsDiv.classList.remove('flex', 'items-center', 'justify-center');
        const ul = document.createElement('ul');
        ul.className = 'space-y-2 w-full';

        currentOrder.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between bg-gray-700 p-2 rounded-md';

            const nameAndQty = document.createElement('div');
            nameAndQty.className = 'flex items-center';
            
            const qtySpan = document.createElement('span');
            qtySpan.textContent = `${item.quantity}x`;
            qtySpan.className = 'font-bold mr-2';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = item.name;

            nameAndQty.appendChild(qtySpan);
            nameAndQty.appendChild(nameSpan);

            const priceAndControls = document.createElement('div');
            priceAndControls.className = 'flex items-center';

            const priceSpan = document.createElement('span');
            priceSpan.textContent = `₹${(item.price * item.quantity).toFixed(2)}`;
            priceSpan.className = 'font-bold mr-4';

            const controls = document.createElement('div');
            controls.className = 'flex items-center space-x-2';

            const plusBtn = document.createElement('button');
            plusBtn.textContent = '+';
            plusBtn.className = 'bg-green-500 hover:bg-green-600 text-white font-bold w-6 h-6 rounded-full';
            plusBtn.onclick = () => {
                item.quantity++;
                renderOrder();
            };

            const minusBtn = document.createElement('button');
            minusBtn.textContent = '-';
            minusBtn.className = 'bg-yellow-500 hover:bg-yellow-600 text-white font-bold w-6 h-6 rounded-full';
            minusBtn.onclick = () => {
                item.quantity--;
                if (item.quantity === 0) {
                    currentOrder.splice(index, 1);
                }
                renderOrder();
            };

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&#128465;'; // Trash can icon
            removeBtn.className = 'bg-red-500 hover:bg-red-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center';
            removeBtn.onclick = () => {
                currentOrder.splice(index, 1);
                renderOrder();
            };

            controls.appendChild(plusBtn);
            controls.appendChild(minusBtn);
            controls.appendChild(removeBtn);

            priceAndControls.appendChild(priceSpan);
            priceAndControls.appendChild(controls);

            li.appendChild(nameAndQty);
            li.appendChild(priceAndControls);
            ul.appendChild(li);
        });
        orderItemsDiv.appendChild(ul);
    }

    const totalAmount = currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
    document.getElementById('total-amount').textContent = `₹${totalAmount.toFixed(2)}`;
}

function updateTime() {
    const timeEl = document.getElementById('current-time');
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function showTemporaryMessage(message, isError = false) {
    const messageContainer = document.createElement('div');
    messageContainer.textContent = message;
    messageContainer.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-semibold shadow-lg ${isError ? 'bg-red-600' : 'bg-green-600'}`;
    
    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.remove();
    }, 3000); // Message disappears after 3 seconds
}

async function handleFinalizeBill() {
    if (currentOrder.length === 0) {
        showTemporaryMessage("Cannot finalize an empty order.", true);
        return;
    }

    const totalAmount = currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('phone-number').value;
    const paymentMode = document.querySelector('input[name="payment-mode"]:checked').value;
    const notes = document.getElementById('order-notes').value;

    const orderData = {
        items: currentOrder,
        totalAmount: totalAmount,
        customerName: customerName,
        customerPhone: customerPhone,
        paymentMode: paymentMode,
        notes: notes
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Order successful:', result);
            showTemporaryMessage("Order Finalized Successfully!");
            
            printReceipt(result);

            // Clear order and inputs
            currentOrder = [];
            renderOrder();
            document.getElementById('customer-name').value = '';
            document.getElementById('phone-number').value = '';
            document.getElementById('order-notes').value = '';
        } else {
            const errorData = await response.json();
            console.error('Error finalizing order:', errorData);
            showTemporaryMessage(`Error: ${errorData.message || 'Could not finalize order.'}`, true);
        }
    } catch (error) {
        console.error('Network or fetch error:', error);
        showTemporaryMessage("A network error occurred. Please try again.", true);
    }
}

function printReceipt(orderData) {
  // --- NEW INCLUSIVE GST CALCULATIONS ---
  const grandTotal = orderData.totalAmount;
  const preTaxTotal = grandTotal / 1.05;
  const gstAmount = grandTotal - preTaxTotal;

  // --- CUSTOMER RECEIPT - ITEM ROWS ---
  const customerItemRows = orderData.items.map(item => `
    <tr>
      <td style="text-align: left;">${item.quantity}x ${item.name}</td>
      <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  // --- KITCHEN TICKET - ITEM ROWS (NO PRICES) ---
  const kitchenItemRows = orderData.items.map(item => `
    <tr>
      <td style="font-size: 14pt; font-weight: bold;">${item.quantity}x</td>
      <td style="font-size: 14pt;">${item.name}</td>
    </tr>
  `).join('');

  // --- CREATE THE FULL HTML FOR THE NEW WINDOW ---
  const receiptHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { width: 72mm; font-family: 'Courier New', monospace; font-size: 10pt; color: #000; }
          .header, .totals-section { text-align: center; }
          .header h1 { margin: 5px 0; font-size: 14pt; }
          .header p { margin: 2px 0; font-size: 9pt; }
          .items-table, .summary-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .items-table th, .summary-table td { padding: 3px; }
          .items-table th { border-bottom: 1px dashed #000; }
          .kitchen-items-table td { padding: 4px 2px; }
          .text-right { text-align: right; }
          hr.dashed { border-top: 1px dashed #000; margin: 10px 0; }
          .cut-here { text-align: center; font-size: 9pt; margin: 40px 0; padding: 10px 0; border-top: 2px dashed #000; border-bottom: 2px dashed #000; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Delhi Chicken Brothers</h1>
          <p>Shop 6, Aar City Regency, Gaur City 2</p>
          <p>Uttar Pradesh 201009</p>
          <p>GSTIN: 09ALRPR8561K2Z0</p>
          <p>Mobile: 9211022131</p>
        </div>
        <hr class="dashed">
        <p>Order #: ${orderData.orderNumber}</p>
        <p>Date: ${new Date(orderData.createdAt).toLocaleString('en-IN')}</p>
        <hr class="dashed">
        <table class="items-table">
          <thead>
            <tr>
              <th style="text-align: left;">Item</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${customerItemRows}
          </tbody>
        </table>
        <hr class="dashed">
        <table class="summary-table">
          <tbody>
            <tr>
              <td>Total:</td>
              <td class="text-right">₹${grandTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size: 8pt;">(Includes GST @ 5%):</td>
              <td class="text-right" style="font-size: 8pt;">₹${gstAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div class="totals-section" style="margin-top: 10px;">
            <p>Thank you for your order!</p>
        </div>
        <div class="cut-here">
          --- < CUT HERE > ---
        </div>

        <div class="header">
            <h1 style="font-size: 18pt;">KITCHEN TICKET</h1>
            <p style="font-size: 14pt;">Order #: ${orderData.orderNumber}</p>
            <p style="font-size: 9pt;">${new Date(orderData.createdAt).toLocaleTimeString('en-IN')}</p>
        </div>
        <hr class="dashed">
        <table class="kitchen-items-table">
            <tbody>
                ${kitchenItemRows}
            </tbody>
        </table>
        ${orderData.notes ? `
            <hr class="dashed">
            <div style="text-align: left;">
                <h2 style="font-size: 14pt; margin: 5px 0;">**NOTE:**</h2>
                <p style="font-size: 14pt; font-weight: bold;">${orderData.notes}</p>
            </div>
        ` : ''}
        </body>
    </html>
  `;

  // --- Use the New Window Method to Print ---
  const printWindow = window.open('', '_blank');
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

document.getElementById('clear-order-btn').addEventListener('click', () => {
    currentOrder = [];
    renderOrder();
});

document.getElementById('finalize-bill-btn').addEventListener('click', handleFinalizeBill);

const customerNameInput = document.getElementById('customer-name');
const customerSearchResults = document.getElementById('customer-search-results');
const phoneNumberInput = document.getElementById('phone-number');

customerNameInput.addEventListener('input', async (e) => {
    const searchText = e.target.value;

    if (searchText.length < 2) {
        customerSearchResults.innerHTML = '';
        customerSearchResults.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(searchText)}`);
        if (!response.ok) {
            throw new Error('Customer search failed');
        }
        const customers = await response.json();

        customerSearchResults.innerHTML = '';
        if (customers.length > 0) {
            customers.forEach(customer => {
                const resultItem = document.createElement('div');
                resultItem.className = 'p-2 hover:bg-gray-700 cursor-pointer';
                resultItem.textContent = `${customer.name} - ${customer.phone}`;
                resultItem.dataset.name = customer.name;
                resultItem.dataset.phone = customer.phone;
                customerSearchResults.appendChild(resultItem);
            });
            customerSearchResults.style.display = 'block';
        } else {
            customerSearchResults.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching customers:', error);
        customerSearchResults.innerHTML = '';
        customerSearchResults.style.display = 'none';
    }
});

customerSearchResults.addEventListener('click', (e) => {
    if (e.target.dataset.name) {
        customerNameInput.value = e.target.dataset.name;
        phoneNumberInput.value = e.target.dataset.phone;
        customerSearchResults.innerHTML = '';
        customerSearchResults.style.display = 'none';
    }
});

customerNameInput.addEventListener('blur', () => {
    // Delay hiding to allow click event to register
    setTimeout(() => {
        customerSearchResults.innerHTML = '';
        customerSearchResults.style.display = 'none';
    }, 150);
});

document.addEventListener('click', (e) => {
    if (!customerNameInput.contains(e.target) && !customerSearchResults.contains(e.target)) {
        customerSearchResults.innerHTML = '';
        customerSearchResults.style.display = 'none';
    }
});

document.getElementById('menu-search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredMenu = fullMenuList.filter(item => item.name.toLowerCase().includes(searchTerm));
    populateMenu(filteredMenu);
});

// Initial calls
fetchAndDisplayMenu();
updateTime();
setInterval(updateTime, 1000); // Update time every second

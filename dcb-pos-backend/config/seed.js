const { MenuItem } = require('../models');

// Function to seed initial menu data if the collection is empty
const seedMenuData = async () => {
    try {
        const count = await MenuItem.countDocuments();
        if (count === 0) {
            console.log('No menu items found. Seeding initial data...');
            const menuData = [
                { category: 'Tandoori Menu', name: 'Juicy Chicken Kebab', prices: [{ size: 'Half', price: 79 }, { size: 'Full', price: 149 }] },
                { category: 'Tandoori Menu', name: 'Minced Mutton Kebab', prices: [{ size: 'Half', price: 99 }, { size: 'Full', price: 179 }] },
                { category: 'Tandoori Menu', name: 'Spicy Chicken Tikka', prices: [{ size: 'Half', price: 119 }, { size: 'Full', price: 199 }] },
                { category: 'Tandoori Menu', name: 'Spicy Roasted Tangdi', prices: [{ size: 'Half', price: 89 }, { size: 'Full', price: 159 }] },
                { category: 'Tandoori Menu', name: 'Chicken Barbeque', prices: [{ size: 'Half', price: 129 }, { size: 'Full', price: 229 }] },
                { category: 'Tandoori Menu', name: 'Afghani Slurpy Tikka', prices: [{ size: 'Half', price: 139 }, { size: 'Full', price: 239 }] },
                { category: 'Tandoori Menu', name: 'Spicy Malai Chicken Tikka', prices: [{ size: 'Half', price: 139 }, { size: 'Full', price: 229 }] },
                { category: 'Fried Menu', name: 'Chicken Lollypop Spicy', prices: [{ size: 'Half', price: 169 }, { size: 'Full', price: 319 }] },
                { category: 'Fried Menu', name: 'Deep Fried Chicken', prices: [{ size: 'Half', price: 119 }, { size: 'Full', price: 199 }] },
                { category: 'Fried Menu', name: 'Fried Crispy Tangdi', prices: [{ size: 'Half', price: 69 }, { size: 'Full', price: 129 }] },
                { category: 'Fried Menu', name: 'Crispy Spicy Fried Chicken', prices: [{ size: 'Half', price: 79 }, { size: 'Full', price: 139 }] },
                { category: 'Fried Menu', name: 'Spicy Crispy Fingers', prices: [{ size: 'Half', price: 119 }, { size: 'Full', price: 199 }] },
                { category: 'Roll Menu', name: 'Spicy Chicken Tikka Roll', prices: [{ size: 'Half', price: 129 }, { size: 'Full', price: 219 }] },
                { category: 'Roll Menu', name: 'Juicy Chicken Kebab Roll', prices: [{ size: 'Half', price: 89 }, { size: 'Full', price: 169 }] },
                { category: 'Roll Menu', name: 'Afghani Slurpy Tikka Roll', prices: [{ size: 'Half', price: 149 }, { size: 'Full', price: 259 }] },
                { category: 'Roll Menu', name: 'Minced Mutton Kebab Roll', prices: [{ size: 'Half', price: 109 }, { size: 'Full', price: 199 }] },
                { category: 'Breads', name: 'Roomali', prices: [{ size: 'Standard', price: 12 }] }
            ];
            await MenuItem.insertMany(menuData);
            console.log('Menu data seeded successfully.');
        }
    } catch (error) {
        console.error('Error seeding menu data:', error);
    }
};

module.exports = seedMenuData;

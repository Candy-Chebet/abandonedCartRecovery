import { prisma } from '/app/db.server';

export async function getAbandonedCartDetails(customerId) {
    try {
        if (!customerId) {
            throw new Error('Customer ID is required');
        }

        const customerWithCarts = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                abandonedCarts: {
                    include: {
                        shop: true,
                        items: true, // Assuming items are now in JSON format, we don't need a special query here
                    },
                },
            },
        });

        if (!customerWithCarts) {
            throw new Error('Customer not found');
        }

        // Parse the items if they're stored as JSON strings
        const cartsWithParsedItems = customerWithCarts.abandonedCarts.map(cart => {
            if (cart.items && typeof cart.items === 'string') {
                try {
                    cart.items = JSON.parse(cart.items); // Ensure it's parsed if it's a string
                } catch (error) {
                    console.error('Error parsing items:', error);
                    cart.items = [];
                }
            }
            return cart;
        });

        return { ...customerWithCarts, abandonedCarts: cartsWithParsedItems };
    } catch (error) {
        console.error('Error retrieving abandoned carts:', error.message || error);
        throw new Error('Failed to retrieve abandoned carts: ' + (error.message || 'Unknown error'));
    }
}



export async function getShopAbandonedCarts(shopId) {
    try {
        if (!shopId) {
            throw new Error('Shop ID is required');
        }

        const abandonedCarts = await prisma.abandonedCart.findMany({
            where: { shopId },
            include: {
                customer: true,
                shop: true,
            },
        });

        if (abandonedCarts.length === 0) {
            throw new Error('No abandoned carts found for this shop');
        }

        // Parse the items if they're stored as JSON strings
        const cartsWithParsedItems = abandonedCarts.map(cart => {
            if (cart.items && typeof cart.items === 'string') {
                try {
                    cart.items = JSON.parse(cart.items); // Ensure it's parsed if it's a string
                } catch (error) {
                    console.error('Error parsing items:', error);
                    cart.items = [];
                }
            }
            return cart;
        });

        return cartsWithParsedItems;
    } catch (error) {
        console.error('Error fetching shop abandoned carts:', error.message || error);
        throw new Error('Failed to retrieve abandoned carts: ' + (error.message || 'Unknown error'));
    }
}

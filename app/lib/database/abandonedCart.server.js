import { prisma } from '/app/db.server';

export async function getAbandonedCartDetails(customerId) {
    try {
        const customerWithCarts = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                abandonedCarts: {
                    include: {
                        shop: true,
                        items: true,
                    },
                },

                
            },
        });
        return customerWithCarts;

    } catch(error) {
        console.error('Error retrieving abandoned carts');
        throw new Error('Failed to retrieve data.');

    }
};

export async function getShopAbandonedCarts(shopId) {
    try {
        return await prisma.abandonedCart.findMany({
            where: { shopId },
            include: {
                customer:true,
                shop: true,
            },
        });

    }catch(error) {
        console.error('Error fetching shop abandoned carts:', error);
        throw new Error('Failed to retrive abandoned carts');

    }
};
import prisma from '../../utils/prisma-client.js';

export const getBarTypes = async (page = 1, perPage = 25) => {
    try {
        const totalRows = await prisma.bar_type.count();
        const totalPages = Math.ceil(totalRows / perPage);

        const data = await prisma.bar_type.findMany({
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: { bar_type_id: 'asc' }
        });

        return {
            success: true,
            totalRows,
            totalPages,
            page,
            perPage,
            data
        };
    } catch (error) {
        console.error('getBarTypes error:', error);
        throw error;
    }
};

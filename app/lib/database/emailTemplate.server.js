import { prisma } from '/app/db.server';

export async function createEmailTemplate(templateData) {
    try {
        return await prisma.emailTemplate.create({
            data: {
                subject: templateData.subject,
                content: templateData.content,
                logo: templateData.logo,
                image: templateData.image,
                shop: {
                    connect: {id: templateData.shopId},

                },
            },
        });
    }catch (error) {
        console.error('error creating email template:', error);
        throw new Error('Failed to create email template');
    }
}


export async function getEmailTemplates(shopId) {
    try {
        return await prisma.emailTemplate.findMany({
            where: { shopId },
            include: { shop: true },
        });
    } catch (error) {
        console.error('error not retrieve available templates:', error);
        throw new Error('Failed to retrieve email templates')
    }
} 

export async function getEmailTemplateById(templateId) {
    try {

        return await prisma.emailTemplate.findUnique({
            where: {id: templateId},
            include: {
                shop: true
            },
            
        })

    } catch(error) {
        console.error('error retrieving the email template');        throw new Error('Failed to retrieve the email template');

    }
}

export async function deleteEmailTemplate(templateId) {
    try {
        return await prisma.template.delete({
            where: { id: templateId},
        });
    } catch(error) {
        console.error('Error deleting email template:', error);
        throw new error('Failed to delete email template');
    }
}
import { prisma } from '/app/db.server'; 

export async function createEmailTemplate(templateData) {
    try {
        // Ensure templateData is properly structured before passing to Prisma
        if (!templateData.subject || !templateData.content || !templateData.shopId) {
            throw new Error('Missing required fields: subject, content, or shopId');
        }

        return await prisma.emailTemplate.create({
            data: {
                subject: templateData.subject,
                content: templateData.content,
                logo: templateData.logo,
                image: templateData.image,
                shop: {
                    connect: { id: templateData.shopId },
                },
            },
        });
    } catch (error) {
        console.error('Error creating email template:', error.message || error);
        throw new Error('Failed to create email template: ' + (error.message || 'Unknown error'));
    }
}


export async function getEmailTemplates(shopId) {
    try {
        if (!shopId) {
            throw new Error('Shop ID is required');
        }

        const templates = await prisma.emailTemplate.findMany({
            where: { shopId },
            include: { shop: true },
        });

        if (templates.length === 0) {
            throw new Error('No email templates found for this shop');
        }

        return templates;
    } catch (error) {
        console.error('Error retrieving email templates:', error.message || error);
        throw new Error('Failed to retrieve email templates: ' + (error.message || 'Unknown error'));
    }
}

export async function getEmailTemplateById(templateId) {
    try {
        if (!templateId) {
            throw new Error('Template ID is required');
        }

        const template = await prisma.emailTemplate.findUnique({
            where: { id: templateId },
            include: { shop: true },
        });

        if (!template) {
            throw new Error('Email template not found');
        }

        return template;
    } catch (error) {
        console.error('Error retrieving the email template:', error.message || error);
        throw new Error('Failed to retrieve the email template: ' + (error.message || 'Unknown error'));
    }
}


export async function deleteEmailTemplate(templateId) {
    try {
        if (!templateId) {
            throw new Error('Template ID is required');
        }

        const deletedTemplate = await prisma.emailTemplate.delete({
            where: { id: templateId },
        });

        if (!deletedTemplate) {
            throw new Error('Email template not found');
        }

        return deletedTemplate;
    } catch (error) {
        console.error('Error deleting email template:', error.message || error);
        throw new Error('Failed to delete email template: ' + (error.message || 'Unknown error'));
    }
}

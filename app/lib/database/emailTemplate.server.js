import { prisma } from '/app/db.server'; 



export async function createEmailTemplate(templateData) {
    try {
        // Validate required shopId
        if (!templateData.shopId) {
            throw new Error('Shop ID is required');
        }

        // Build template data with defaults
        const template = {
            name: templateData.name?.trim() || 'Untitled Template',
            subject: templateData.subject?.trim() || 'Abandoned Cart Recovery',
            content: templateData.content?.trim() || '',
            design: typeof templateData.design === 'string'
                ? templateData.design
                : JSON.stringify(templateData.design || {}),
            logo: templateData.logo || null,
            image: templateData.image || null,
            shopId: templateData.shopId
        };

        // Create template in database
        return await prisma.emailTemplate.create({
            data: template
        });
    } catch (error) {
        console.error('Error creating email template:', {
            error: error.message || error,
            templateData: {
                ...templateData,
                content: templateData.content?.substring(0, 100) + '...' // Log partial content
            }
        });

        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            throw new Error('A template with this name already exists');
        }
        if (error.code === 'P2025') {
            throw new Error('Shop not found');
        }

        // Re-throw other errors
        throw new Error(`Failed to create email template: ${error.message || 'Unknown error'}`);
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
            orderBy: { createdAt: 'desc' }
        });

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
            include: { shop: true }
        });

        if (!template) {
            throw new Error('Email template not found');
        }

        return template;
    } catch (error) {
        console.error('Error retrieving email template:', error.message || error);
        throw new Error('Failed to retrieve email template: ' + (error.message || 'Unknown error'));
    }
}

export async function deleteEmailTemplate(templateId) {
    try {
        if (!templateId) {
            throw new Error('Template ID is required');
        }

        const deletedTemplate = await prisma.emailTemplate.delete({
            where: { id: templateId }
        });

        return deletedTemplate;
    } catch (error) {
        console.error('Error deleting email template:', error.message || error);
        
        // Handle specific Prisma errors
        if (error.code === 'P2025') {
            throw new Error('Email template not found');
        }
        
        throw new Error('Failed to delete email template: ' + (error.message || 'Unknown error'));
    }
}

export async function updateEmailTemplate(templateId, templateData) {
    try {
        if (!templateId) {
            throw new Error('Template ID is required');
        }

        // Build update data
        const updateData = {
            name: templateData.name?.trim(),
            subject: templateData.subject?.trim(),
            content: templateData.content?.trim(),
            design: typeof templateData.design === 'string'
                ? templateData.design
                : JSON.stringify(templateData.design || {}),
            logo: templateData.logo,
            image: templateData.image
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        return await prisma.emailTemplate.update({
            where: { id: templateId },
            data: updateData
        });
    } catch (error) {
        console.error('Error updating email template:', error.message || error);
        
        if (error.code === 'P2025') {
            throw new Error('Email template not found');
        }
        
        throw new Error('Failed to update email template: ' + (error.message || 'Unknown error'));
    }
}
import {
    Page,
    Layout,
    Text,
    Card,
    BlockStack,
    InlineStack,
  } from '@shopify/polaris';

import { Link } from "@remix-run/react";

import { Info } from 'lucide-react';

const AbandonedCard = ({}) => { 
    // const navigate = useNavigate();

    return (
        <>
        <Card style = {{ width: '20%' }}>
            <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
                EMAIL 1
            </Text>

            <Link to="/templates" gap="300">
                <Info size={5} color="rgb(0, 128, 96)" />
                <Text as="p" variant="bodyMd">
                Customize template
                </Text>
            </Link>

           
            </BlockStack>
        </Card>
        
        </>
    )
}

export default AbandonedCard

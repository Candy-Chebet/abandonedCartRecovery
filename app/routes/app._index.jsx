import React from 'react';
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
} from '@shopify/polaris';
import { Info } from 'lucide-react';
import styles from "./global.css?url";


export const links = () => [{ rel: "stylesheet", href: styles }];


import AbandonedCard from '../components/abandonedCard'; 

export default function CartRecovery() {
  const steps = [
    { number: 1, text: "Action type", active: true },
    { number: 2, text: "Sending times", active: false },
    { number: 3, text: "Email templates", active: false }
  ];

  const timelineItems = [
    { icon: "🛒", label: "abandoned their cart", sublabel: "" },
    { icon: "✉️", label: "Email 1", sublabel: "Sent 1 Hour after" },
    { icon: "✉️", label: "Email 2", sublabel: "Sent 24 Hours later" },
    { icon: "✉️", label: "Email 3", sublabel: "Sent 72 Hours later" }
  ];

  return (
    <Page
      breadcrumbs={[{ content: "Actions", url: "/" }]}
      title="Recover abandoned carts"
    >
      <BlockStack gap="500">
    

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Review sending times
            </Text>

            <InlineStack gap="300">
              <Info size={20} color="rgb(0, 128, 96)" />
              <Text as="p" variant="bodyMd">
                Automatic sending is optimized to get your store the best results.
              </Text>
            </InlineStack>

            <BlockStack gap="400">
              <InlineStack gap="500" wrap={false}>
                {timelineItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <BlockStack gap="200" alignment="center">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          background: "var(--p-surface-subdued)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                          border: "1px solid var(--p-border)"
                        }}
                      >
                        {item.icon}
                      </div>
                      <Text variant="bodyMd" as="p" alignment="center">
                        {item.label}
                      </Text>
                      {item.sublabel && (
                        <Text variant="bodySm" as="p" color="subdued" alignment="center">
                          {item.sublabel}
                        </Text>
                      )}
                    </BlockStack>
                    {index < timelineItems.length - 1 && (
                      <Text variant="bodyMd" as="span" color="subdued">
                        →
                      </Text>
                    )}
                  </React.Fragment>
                ))}
              </InlineStack>
            </BlockStack>
          </BlockStack>
        </Card>
        <AbandonedCard/>
      </BlockStack>

    </Page>
    
  );
}
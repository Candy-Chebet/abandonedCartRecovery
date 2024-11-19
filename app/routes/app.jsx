import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate, MONTHLY_PLAN } from "../shopify.server";


export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { admin, billing } = await authenticate.admin(request);
  
  const result = await admin.graphql(`
  #graphql
    query Shop {
      app{
        installation{
          launchUrl
          activeSubscriptions {
            id
            name
            createdAt
            returnUrl
            status
            currentPeriodEnd
            trialDays
          }
        }
      }
    }`,
    { variables: {} }
  );

  const resultJson = await result.json();
  const { activeSubscriptions, launchUrl } = resultJson.data.app.installation

  if (activeSubscriptions < 1){
    await billing.require({
      plan:MONTHLY_PLAN,
      isTest: true,
      onFailure: async () => 
        billing.request({
          plan: MONTHLY_PLAN,
          returnUrl: launchUrl,
        }),      
    });
  };
  
  console.log('activesubs:', activeSubscriptions)

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/abandoned-carts">Abandoned-carts</Link>
     
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

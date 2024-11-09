import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, Page, Link } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getAbandonedCart } from "../models/abandonedCart.server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const cart = await getAbandonedCart(session.shop, params.id);
  return json({ cart });
};

export default function CartPage() {
  const { cart } = useLoaderData();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <div>
              <h2>Your Abandoned Cart</h2>
              <p>Here are the items you left in your cart:</p>
              <ul>
                {cart.items.map(item => (
                  <li key={item.id}>{item.title} - ${item.price}</li>
                ))}
              </ul>
              <Link url={`${process.env.APP_URL}/cart/${cart.id}`}>Complete your order</Link>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

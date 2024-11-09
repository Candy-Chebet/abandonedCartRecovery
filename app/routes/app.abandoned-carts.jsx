import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, DataTable, Button } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getAbandonedCarts, updateAbandonedCartReminder } from "../models/abandonedCart.server";
import { sendAbandonedCartReminder } from "../services/emailService.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const carts = await getAbandonedCarts(session.shop);
  return json({ carts });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const cartId = formData.get("cartId");

  if (formData.get("action") === "send-reminder") {
    const cart = await getAbandonedCart(session.shop, cartId);
    await sendAbandonedCartReminder(cart);
    await updateAbandonedCartReminder(cartId, true);
    return redirect("/app/abandoned-carts");
  }

  return null;
};

export default function AbandonedCartsPage() {
  const { carts } = useLoaderData();

  return (
    <Page title="Abandoned Carts">
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={["text", "text", "numeric", "text"]}
              headings={["Customer", "Email", "Items", "Reminder Sent"]}
              rows={carts.map(cart => [
                `${cart.customer.firstName} ${cart.customer.lastName}`,
                cart.email,
                cart.items.length.toString(),
                cart.reminderSent ? "Yes" : "No",
                <Button name="cartId" value={cart.id} onClick={() => submit({ action: "send-reminder" })}>
                  Send Reminder
                </Button>
              ])}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

import { Webhook } from "svix";
import { headers } from "next/headers";
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";

export async function POST(req) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt?.data;
  const eventType = evt?.type;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  console.log("Webhook payload:", body);

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, first_name, last_name, image_url, email_addresses, username } =
      evt?.data;
    // try {
    //   await createOrUpdateUser(
    //     id?.toString(),
    //     first_name.toString(),
    //     last_name.toString(),
    //     image_url.toString(),
    //     email_addresses.toString(),
    //     username.toString()
    //   );
    //   return new Response("User is Created or Updated", { status: 200 });
    // } catch (error) {
    //   console.log("Error Creating or Updating user", error);
    //   return new Response("Error Occured", {
    //     status: 400,
    //   });
    // }
    console.log("User Created", first_name);
  }
  if (eventType === "user.deleted") {
    const { id } = evt?.data;

    // try {
    //   await deleteUser(id);
    //   return new Response("User is Deleted", { status: 200 });
    // } catch (error) {
    //   console.log("Error Deleting User", error);
    //   return new Response("Error Occured", {
    //     status: 400,
    //   });
    // }

    console.log("User Deleted");
  }

  return new Response("Webhook received", { status: 200 });
}

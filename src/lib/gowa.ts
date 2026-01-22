import 'server-only';

export async function sendWhatsApp(phone: string, message: string) {
  const url = process.env.GOWA_API_URL!;
  const username = process.env.GOWA_USERNAME!;
  const password = process.env.GOWA_PASSWORD!;

  // Create Basic Auth Header (base64 encoded)
  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        phone: phone,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ GOWA API Error:", errorText);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    return { success: true, data };
    
  } catch (error) {
    console.error("❌ Failed to send WhatsApp:", error);
    return { success: false, error: "Network error" };
  }
}
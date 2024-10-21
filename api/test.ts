import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    console.log("API function called");
    return res.status(200).json({ message: "Test function is working!" });
  } catch (error) {
    console.error("Error in API function:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

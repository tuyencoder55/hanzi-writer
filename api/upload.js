export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const busboy = require("busboy");
  const bb = busboy({ headers: req.headers });

  let fileBuffer = null;

  bb.on("file", (name, file, info) => {
    const chunks = [];
    file.on("data", (data) => {
      chunks.push(data);
    });
    file.on("end", () => {
      fileBuffer = Buffer.concat(chunks);
    });
  });

  bb.on("finish", async () => {
    try {
      const formData = new FormData();
      formData.append("file", new Blob([fileBuffer]), "upload.pdf");

      const heyRes = await fetch("https://api.heyzine.com/v1/flipbooks", {
        method: "POST",
        headers: {
          Authorization:
            "5ed8e59caeca7140e2ef91106805922918d89451.f019775a16596720",
        },
        body: formData,
      });

      const result = await heyRes.json();
      res.status(200).json(result);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Upload to Heyzine failed", detail: err.message });
    }
  });

  req.pipe(bb);
}

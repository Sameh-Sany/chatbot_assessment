const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

async function loadProperties() {
  const properties = [];
  const filePath = path.join(__dirname, "../data/uae_real_estate_2024.csv");

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        properties.push({
          title: row.title,
          displayAddress: row.displayAddress,
          bathrooms: parseInt(row.bathrooms, 10),
          bedrooms: parseInt(row.bedrooms, 10),
          addedOn: new Date(row.addedOn),
          type: row.type,
          price: parseInt(row.price, 10),
          verified: row.verified === "true",
          priceDuration: row.priceDuration,
          sizeMin: parseInt(row.sizeMin, 10),
          furnishing: row.furnishing,
          description: row.description,
        });
      })
      .on("end", () => resolve(properties))
      .on("error", (error) => reject(error));
  });
}

module.exports = { loadProperties };

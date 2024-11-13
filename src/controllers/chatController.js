const azureOpenAi = require("../config/AzureOpenai");
const { loadProperties } = require("../helpers/csvLoader");

let propertiesData = [];

async function initializePropertiesData() {
  propertiesData = await loadProperties();
}
async function parseQuery(userQuery) {
  try {
    let result;
    const response = await azureOpenAi.post("", {
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant who provides responses based on structured data. Extract structured data (title, displayAddress, bathrooms, bedrooms, addedOn, type, price, verified, priceDuration, sizeMin, furnishing, description) from this userQuery: "${userQuery}". Return a JSON object with keys for "title, displayAddress, bathrooms, bedrooms, addedOn, type, price, verified, priceDuration, sizeMin, furnishing, description", even if some fields are missing.`,
        },
        {
          role: "user",
          content: `Extract structured data (title, displayAddress, bathrooms, bedrooms, addedOn, type, price, verified, priceDuration, sizeMin, furnishing, description) from this userQuery: "${userQuery}". Return a JSON object with keys for 'title, displayAddress, bathrooms, bedrooms, addedOn, type, price, verified, priceDuration, sizeMin, furnishing, description', even if some fields are missing.`,
        },
      ],
    });

    const responseText = response.data.choices[0].message.content.trim();
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Response text:", responseText);
      throw new Error("Failed to parse userQuery.");
    }

    result = {
      title: result.title || "",
      displayAddress: result.displayAddress || "",
      bathrooms: result.bathrooms || "",
      bedrooms: result.bedrooms || "",
      addedOn: result.addedOn || "",
      type: result.type || "",
      price: result.price || "",
      verified: result.verified || "",
      priceDuration: result.priceDuration || "",
      sizeMin: result.sizeMin || "",
      furnishing: result.furnishing || "",
      description: result.description || "",
    };

    return result;
  } catch (error) {
    console.error("Error parsing userQuery:", error);
    throw new Error("Failed to parse userQuery.");
  }
}

async function searchProperties(properties, userQuery) {
  const {
    title,
    displayAddress,
    bathrooms,
    bedrooms,
    addedOn,
    type,
    price,
    verified,
    priceDuration,
    sizeMin,
    furnishing,
    description,
  } = userQuery;

  return properties.filter((property) => {
    return (
      (title
        ? property.title.toLowerCase().includes(title.toLowerCase())
        : true) &&
      (displayAddress
        ? property.displayAddress
            .toLowerCase()
            .includes(displayAddress.toLowerCase())
        : true) &&
      (bathrooms ? property.bathrooms === parseInt(bathrooms, 10) : true) &&
      (bedrooms ? property.bedrooms === parseInt(bedrooms, 10) : true) &&
      (addedOn
        ? new Date(property.addedOn).toISOString() ===
          new Date(addedOn).toISOString()
        : true) &&
      (type
        ? property.type.toLowerCase().includes(type.toLowerCase())
        : true) &&
      (price ? property.price <= parseInt(price, 10) : true) &&
      (verified !== undefined
        ? property.verified === (verified === "true")
        : true) &&
      (priceDuration
        ? property.priceDuration
            .toLowerCase()
            .includes(priceDuration.toLowerCase())
        : true) &&
      (sizeMin ? property.sizeMin >= parseInt(sizeMin, 10) : true) &&
      (furnishing
        ? property.furnishing.toLowerCase().includes(furnishing.toLowerCase())
        : true) &&
      (description
        ? property.description.toLowerCase().includes(description.toLowerCase())
        : true)
    );
  });
}

async function findSearchResult(userQuery) {
  const parsedQuery = await parseQuery(userQuery);
  const results = await searchProperties(propertiesData, parsedQuery);
  return results;
}

async function chatbot(req, res) {
  const { userQuery } = req.body;

  if (!userQuery) {
    return res.status(400).json({ error: "userQuery is required" });
  }

  try {
    let searchResults = await findSearchResult(userQuery);

    if (searchResults.length > 1) {
      searchResults = [
        searchResults[Math.floor(Math.random() * searchResults.length)],
      ];
    }

    const context = searchResults.length
      ? `Here are some available properties that you might be interested in:\n\n${searchResults
          .map(
            (property) =>
              `- **Title**: ${property.title}\n` +
              `- **Address**: ${property.displayAddress}\n` +
              `- **Bedrooms**: ${property.bedrooms}\n` +
              `- **Bathrooms**: ${property.bathrooms}\n` +
              `- **Price**: AED ${property.price}\n` +
              `- **Type**: ${property.type}\n` +
              `- **Size**: ${property.sizeMin} sq. ft.\n` +
              `- **Furnishing**: ${property.furnishing || "Not Specified"}\n` +
              `- **Description**: ${property.description}\n\n`
          )
          .join("")}`
      : "No properties found matching your search criteria.";

    const chatResponse = await azureOpenAi.post("", {
      messages: [
        {
          role: "system",
          content:
            'You are a helpful assistant who provides responses based on structured data. The user asked: "${userQuery}". Here are some matching properties:\n${context}',
        },
        {
          role: "user",
          content: `The user asked: "${userQuery}". Here are some matching properties:\n${context}`,
        },
      ],
    });

    const responseText = chatResponse.data.choices[0].message.content.trim();
    res.json({ response: responseText });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
}

module.exports = { chatbot, initializePropertiesData };

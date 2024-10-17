const axios = require("axios");
const ShopifyBaseURL = "https://thoughtcast.myshopify.com/admin/api/2022-01/";
const shopify_accesstoken = "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";

const fullfillOrder = async (orderID, data) => {
  try {
    var config = {
      method: "post",
      url: ShopifyBaseURL + "orders/" + orderID + "/fulfillments.json",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopify_accesstoken,
      },
      data: data,
    };

    const fulfillment = await axios(config);
    console.log(fulfillment);
  } catch (e) {
    console.log(e.response.data);
  }
};

const addTagsShopify = async (custId, tags) => {
  try {
    const getCustomerConfig = {
      method: "get",
      url: ShopifyBaseURL + `customers/${custId}.json`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopify_accesstoken,
      },
    };
    const getCustomer = await axios(getCustomerConfig);
    let oldTags = getCustomer.data.customer.tags.split(",") || [];
    oldTags = oldTags.map((e) => {
      e = e.trim(" ");
      return e;
    });

    let newTags = tags.trim().split(",") || [];
    newTags = newTags.map((a) => {
      a = a.trim();
      if (!oldTags.includes(a)) {
        oldTags.push(a);
      }
    });
    oldTags = oldTags.join(",");
    const data = {
      customer: {
        id: custId,
        tags: oldTags,
      },
    };
    var config = {
      method: "put",
      url: ShopifyBaseURL + `customers/${custId}.json`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopify_accesstoken,
      },
      data: data,
    };

    const tagResponse = await axios(config);
  } catch (e) {
    console.log(e.response.data);
  }
};

module.exports = {
  fullfillOrder,
  addTagsShopify,
};

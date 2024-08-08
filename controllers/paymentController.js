const expressAsyncHandler = require("express-async-handler");
const { XMLParser, XMLValidator } = require("fast-xml-parser");
const { readFileSync } = require("fs");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

// @desc Pay money
// @route Post payment/:confirmation_no
// @access Private
const pay = expressAsyncHandler(async (req, res) => {
  const confirmationNo = req.params.confirmation_no;
  const filename = `booking_${confirmationNo}.xml`;

  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  };

  const xmlFile = readFileSync(process.cwd() + "/XML/" + filename).toString();

  const isValid = XMLValidator.validate(xmlFile);
  if (!isValid) {
    throw new Error("XML file is invalid");
  }

  const parser = new XMLParser(options);
  const json = parser.parse(xmlFile);

  const amount =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:ExpectedCharges"]?.[
      "@_TotalRoomRateAndPackages"
    ] ?? 0;
  const last_name =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:ResGuests"]?.["r:ResGuest"]?.["r:Profiles"]?.["Profile"]?.[
      "Customer"
    ]?.["PersonName"]?.["c:lastName"];
  const first_name =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:ResGuests"]?.["r:ResGuest"]?.["r:Profiles"]?.["Profile"]?.[
      "Customer"
    ]?.["PersonName"]?.["c:firstName"];
  const buyer_fullname = first_name + " " + last_name || "test_fullname";

  const merchant_site_code = "7";
  const order_code = uuidv4();
  const order_description = "";
  const currency = "VND";
  const buyer_email = "test@email.com";
  const buyer_mobile =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:ResGuests"]?.["r:ResGuest"]?.["r:Profiles"]?.["Profile"]?.[
      "Phones"
    ]?.["NamePhone"]?.["c:PhoneNumber"] ?? "test_mobile";
  const buyer_address = "Test Address";
  const return_url = "http://localhost:3000/payment-success";
  const cancel_url = "http://localhost:3000/payment-fail";
  const notify_url = "";
  const language = "vi";
  const merchant_passcode = "123456789";

  const checksum = crypto
    .createHash("md5")
    .update(
      merchant_site_code +
        "|" +
        order_code +
        "|" +
        order_description +
        "|" +
        amount +
        "|" +
        currency +
        "|" +
        buyer_fullname +
        "|" +
        buyer_email +
        "|" +
        buyer_mobile +
        "|" +
        buyer_address +
        "|" +
        return_url +
        "|" +
        cancel_url +
        "|" +
        notify_url +
        "|" +
        language +
        "|" +
        merchant_passcode
    )
    .digest("hex");

  const form = new FormData();
  form.append("function", "CreateOrder");
  form.append("merchant_site_code", merchant_site_code);
  form.append("order_code", order_code);
  form.append("amount", amount);
  form.append("currency", currency);
  form.append("buyer_fullname", buyer_fullname);
  form.append("buyer_email", buyer_email);
  form.append("buyer_mobile", buyer_mobile);
  form.append("buyer_address", buyer_address);
  form.append("return_url", return_url);
  form.append("cancel_url", cancel_url);
  form.append("language", language);
  form.append("checksum", checksum);

  const result = await axios.post(
    "https://sandbox2.nganluong.vn/vietcombank-checkout/vcb/api/web/checkout/version_1_0",
    form
  );

  res.status(200).redirect(result.data.result_data.checkout_url);
});

module.exports = {
  pay,
};

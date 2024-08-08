const expressAsyncHandler = require("express-async-handler");
const { XMLParser, XMLValidator } = require("fast-xml-parser");
const { readFileSync } = require("fs");
const { xmlToJson } = require("../helpers/xmlToJson");

// @desc Process XML file
// @route Get booking/:confirmation_no
// @access Private
const processXMLfile = expressAsyncHandler(async (req, res) => {
  const confirmationNo = req.params.confirmation_no;
  const filename = `booking_${confirmationNo}.xml`;

  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_", // you have assign this so use this to access the attribute
  };

  const xmlFile = readFileSync(process.cwd() + "/XML/" + filename).toString();

  const isValid = XMLValidator.validate(xmlFile);
  if (!isValid) {
    throw new Error("XML file is invalid");
  }

  const parser = new XMLParser(options);
  const json = parser.parse(xmlFile);

  const resv_name_id =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:UniqueIDList"]?.["c:UniqueID"]?.["1"]?.["#text"] ?? "";
  const arrival =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:TimeSpan"]?.[
      "hc:StartDate"
    ].split("T")[0] ?? "";
  const departure =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:TimeSpan"]?.["hc:EndDate"].split(
      "T"
    )[0] ?? "";
  const adults =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:GuestCounts"]?.[
      "hc:GuestCount"
    ]?.["0"]?.["@_count"] ?? "";
  const children =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:GuestCounts"]?.[
      "hc:GuestCount"
    ]?.["1"]?.["@_count"] ?? "";
  const roomtype =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:RoomTypes"]?.["hc:RoomType"]?.[
      "@_roomTypeCode"
    ] ?? "";
  const ratecode =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:RoomRates"]?.["hc:RoomRate"]?.[
      "@_roomTypeCode"
    ] ?? "";
  const amount =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:ExpectedCharges"]?.[
      "@_TotalRoomRateAndPackages"
    ] ?? 0;
  const guarantee =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:Guarantee"]?.[
      "@_guaranteeType"
    ] ?? "";
  const method_payment =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:Payment"]?.[
      "hc:PaymentsAccepted"
    ]?.["hc:PaymentType"]?.["hc:OtherPayment"]?.["@_type"] ?? "";
  const computed_resv_status =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["@_computedReservationStatus"] ?? "";
  const last_name =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:ResGuests"]?.["r:ResGuest"]?.["r:Profiles"]?.["Profile"]?.[
      "Customer"
    ]?.["PersonName"]?.["c:lastName"] ?? "";
  const first_name =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:ResGuests"]?.["r:ResGuest"]?.["r:Profiles"]?.["Profile"]?.[
      "Customer"
    ]?.["PersonName"]?.["c:firstName"] ?? "";

  const phone_number =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:ResGuests"]?.["r:ResGuest"]?.["r:Profiles"]?.["Profile"]?.[
      "Phones"
    ]?.["NamePhone"]?.["c:PhoneNumber"] ?? "";
  const booking_balance =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:CurrentBalance"]?.["#text"] ?? 0;
  const booking_created_date =
    json?.["soap:Envelope"]?.["soap:Body"]?.["FetchBookingResponse"]?.[
      "HotelReservation"
    ]?.["r:RoomStays"]?.["hc:RoomStay"]?.["hc:ExpectedCharges"]?.[
      "hc:ChargesForPostingDate"
    ]?.["@_PostingDate"] ?? "";

  const bookingInfo = {
    confirmation_no: confirmationNo,
    resv_name_id,
    arrival,
    departure,
    adults,
    children,
    roomtype,
    ratecode,
    rateamount: { amount, currency: "VND" },
    guarantee,
    method_payment,
    computed_resv_status,
    last_name,
    first_name,
    phone_number,
    email: "test@email.com",
    booking_balance,
    booking_created_date,
  };

  res.status(200).json(bookingInfo);
});

module.exports = {
  processXMLfile,
};

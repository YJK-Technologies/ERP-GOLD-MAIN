import React, { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import "./Template.css";
import { toWords } from "number-to-words";
import { ToWords } from "to-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const config = require("./Apiconfig");

const SalesTemplate = () => {
  const [headerData, setHeaderData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [taxData, setTaxData] = useState(null);
  const [TCPrintData, setTCPrintData] = useState(null);
  const componentRef = useRef("");
  const toWords = new ToWords();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Purchase data",
  });

  const handleDownload = async () => {
    try {
      const invoiceElement = componentRef.current;
      const canvas = await html2canvas(invoiceElement);
      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imageData, "PNG", 0, 0, imgWidth, imgHeight);

      const blob = pdf.output("blob");

      if ("showSaveFilePicker" in window) {
        const opts = {
          types: [
            {
              description: "PDF file",
              accept: { "application/pdf": [".pdf"] },
            },
          ],
        };

        const handle = await window.showSaveFilePicker(opts);
        const writableStream = await handle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();
      } else {
        const fileName = prompt("Enter file name:", "invoice.pdf");
        if (fileName) {
          saveAs(blob, fileName);
        }
      }
    } catch (error) {
      console.error("Error saving the file:", error);
    }
  };

  useEffect(() => {
    const header = sessionStorage.getItem("SheaderData");
    const detail = sessionStorage.getItem("SdetailData");
    const tax = sessionStorage.getItem("StaxData");
    const tcp = sessionStorage.getItem("STCPrintData");
    if (header && detail && tax) {
      setHeaderData(JSON.parse(header));
      setDetailData(JSON.parse(detail));
      setTaxData(JSON.parse(tax));
      setTCPrintData(JSON.parse(tcp));
      if (tcp) {
        setTCPrintData(JSON.parse(tcp));
      } else {
        setTCPrintData([]);
      }
    } else {
      console.error("Data not found in sessionStorage");
    }
  }, []);

  if (!headerData || !detailData || !taxData) {
    return <div>Loading...</div>;
  }

  const totalAmount = headerData[0].bill_amt;
  const totalAmountInWords = `${toWords.convert(totalAmount)} rupees only`;

  const total = parseFloat(headerData[0].bill_amt).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const tax = parseFloat(taxData[0].tax_amt).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sales = parseFloat(headerData[0].sale_amt).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // useEffect(() => {
  //     const fetchData = async () => {
  //         try {
  //             // Fetch header data
  //             const headerResponse = await fetch(`${config.apiBaseUrl}/refNumberToHeaderPrintData`, {
  //                 method: "POST",
  //                 headers: {
  //                     "Content-Type": "application/json"
  //                 },
  //                 body: JSON.stringify({ purch_autono: state.new_running_no })
  //             });
  //             const headerData = await headerResponse.json();
  //             // setHeaderData(headerData);
  //             // Fetch detail data
  //             const detailResponse = await fetch(`${config.apiBaseUrl}/refNumberToDetailPrintData`, {
  //                 method: "POST",
  //                 headers: {
  //                     "Content-Type": "application/json"
  //                 },
  //                 body: JSON.stringify({ purch_autono: state.new_running_no })
  //             });
  //             const detailData = await detailResponse.json();
  //             // setDetailData(detailData);

  //             // Fetch tax data
  //             const taxResponse = await fetch(`${config.apiBaseUrl}/refNumberToSumTax`, {
  //                 method: "POST",
  //                 headers: {
  //                     "Content-Type": "application/json"
  //                 },
  //                 body: JSON.stringify({ numberseries: state.new_running_no })
  //             });
  //             const taxData = await taxResponse.json();
  //             // setTaxData(taxData);
  //         } catch (error) {
  //             console.error("Error fetching data:", error);
  //         }
  //     };

  //     if (state && state.new_running_no) {
  //         fetchData();
  //     }
  // }, [state.new_running_no]);

  if (!headerData || !detailData || !taxData) {
    return <div>Loading...</div>;
  }

  // const convertToWords = (amount) => {
  //     let words = toWords(amount);
  //     // Capitalize the first letter and add currency
  //     words = words.charAt(0).toUpperCase() + words.slice(1) + ' rupees only';
  //     return words;
  // };

  const bufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";

    for (let i = 0; i < bytes.byteLength; i += 1024) {
      const chunk = bytes.subarray(i, i + 1024);
      binary += String.fromCharCode.apply(null, chunk);
    }

    return `data:image/jpeg;base64,${window.btoa(binary)}`;
  };

  const processItemImages = () => {
    if (headerData[0].company_logo && headerData[0].company_logo.data) {
      return bufferToBase64(headerData[0].company_logo.data);
    }
    return "";
  };

  const processSignatureImages = () => {
    if (
      headerData[0].authorisedSignatur &&
      headerData[0].authorisedSignatur.data
    ) {
      return bufferToBase64(headerData[0].authorisedSignatur.data);
    }
    return "";
  };

  return (
    <>
      <div
        className="invoice-container"
        ref={componentRef}
        style={{
          maxWidth: "900px",
          margin: "20px auto",
          padding: "24px",
          boxSizing: "border-box"
        }}
      >

        {/* Company Header */}
        {/* <div
        className="invoice-header"
        style={{
          marginBottom: "16px"
        }}
      >
        <div className="d-flex align-items-start"> */}

        {/* Company Logo */}
        {/* {headerData[0]?.company_logo && (
            <div className="ms-3 mt-1">
              <img
                className="rounded-0"
                src={processItemImages(headerData[0].company_logo)}
                width={100}
                height={100}
                alt="Company Logo"
              />
            </div>
          )} */}

        {/* Company Details */}
        {/* <div className="mt-3 p-1">
            <strong>{headerData[0]?.company_name}</strong>
            <br />

            {[
              headerData[0]?.address1,
              headerData[0]?.address2,
              headerData[0]?.address3,
            ]
              .filter((addr) => addr)
              .join(", ")}

            {headerData[0]?.city && `, ${headerData[0].city}`}
            {headerData[0]?.pincode && ` - ${headerData[0].pincode}`}

            <br />
          </div>

        </div>
      </div> */}

        {/* Company Header */}
        <h2 style={{ margin: 0 }}>
          {headerData[0]?.company_code}
        </h2>

        <h2 style={{ margin: 0 }}>
          {sessionStorage.getItem("selectedCompanyName")}
        </h2>

        {/* Top Line */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid currentColor",
            margin: "16px 0 10px 0"
          }}
        />

        {/* Title */}
        <h1
          className="invoice-title"
          style={{
            textAlign: "center",
            margin: "0",
            padding: "8px 0"
          }}
        >
          Sales
        </h1>

        {/* Bottom Line */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid currentColor",
            margin: "10px 0 20px 0"
          }}
        />

        {/* Sales Information */}
        <div
          className="invoice-info"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px"
          }}
        >

          {/* Party Information */}
          <div
            className="bill-to"
            style={{
              lineHeight: "1.6"
            }}
          >
            <p style={{ margin: "4px 0" }}>
              <strong>Party Code:</strong>{" "}
              {headerData[0].customer_code}
            </p>

            <p style={{ margin: "4px 0" }}>
              <strong>Party Name:</strong>{" "}
              {detailData[0].customer_name}
            </p>
          </div>

          {/* Transaction Information */}
          <div
            className="invoice-details"
            style={{
              lineHeight: "1.6",
              textAlign: "right"
            }}
          >
            <p style={{ margin: "4px 0" }}>
              <strong>Transaction No:</strong>{" "}
              {headerData[0].bill_no}
            </p>

            <p style={{ margin: "4px 0" }}>
              <strong>Transaction Date:</strong>{" "}
              {new Date(
                headerData[0].bill_date
              ).toLocaleDateString()}
            </p>

            <p style={{ margin: "4px 0" }}>
              <strong>Sales Type:</strong>{" "}
              {headerData[0].sales_type}
            </p>

            <p style={{ margin: "4px 0" }}>
              <strong>Pay Type:</strong>{" "}
              {headerData[0].pay_type}
            </p>
          </div>

        </div>

        {/* Sales Table */}
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            marginBottom: "32px"
          }}
        >
          <table
            className="invoice-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left"
            }}
          >
            <thead>
              <tr>

                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "center"
                  }}
                >
                  S.No
                </th>

                <th
                  style={{
                    padding: "8px 12px"
                  }}
                >
                  Item Name
                </th>

                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "right"
                  }}
                >
                  Unit Weight
                </th>

                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "right"
                  }}
                >
                  Qty
                </th>

                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "right"
                  }}
                >
                  Total Weight
                </th>

                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "right"
                  }}
                >
                  Unit Price
                </th>

                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "right"
                  }}
                >
                  Discount
                </th>

                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "right"
                  }}
                >
                  Tax
                </th>

                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "right"
                  }}
                >
                  Amount
                </th>

              </tr>
            </thead>

            <tbody>

              {detailData.map((row, index) => (
                <tr key={index}>

                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "center"
                    }}
                  >
                    {row.ItemSNo}
                  </td>

                  <td
                    style={{
                      padding: "8px 12px"
                    }}
                  >
                    {row.item_name}
                  </td>

                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right"
                    }}
                  >
                    {row.weight}
                  </td>

                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right"
                    }}
                  >
                    {row.bill_qty}
                  </td>

                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right"
                    }}
                  >
                    {row.total_weight}
                  </td>

                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right"
                    }}
                  >
                    {row.item_amt}
                  </td>

                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right"
                    }}
                  >
                    {row.discount_amount}
                  </td>

                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right"
                    }}
                  >
                    {row.tax_amt}
                  </td>

                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right"
                    }}
                  >
                    {parseFloat(row.bill_rate).toFixed(2)}
                  </td>

                </tr>
              ))}

              {/* Total Row */}
              <tr className="total">
                <td
                  colSpan="7"
                  style={{
                    padding: "8px 12px",
                    textAlign: "left"
                  }}
                >
                  Total
                </td>

                <td
                  colSpan="2"
                  style={{
                    padding: "8px 12px",
                    textAlign: "right"
                  }}
                >
                  ₹ {sales}
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div
          className="invoice-summary"
          style={{
            marginTop: "20px"
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse"
            }}
          >
            <tbody>

              <tr>
                <td>Sub Total</td>
                <td style={{ textAlign: "right" }}>
                  ₹ {sales}
                </td>
              </tr>

              {taxData.map((row, index) => (
                <tr key={index}>
                  <td>
                    {row.tax_name_details}
                    {row.tax_per}%
                  </td>

                  <td style={{ textAlign: "right" }}>
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(row.tax_amt)}
                  </td>
                </tr>
              ))}

              <tr>
                <td>Round off</td>
                <td style={{ textAlign: "right" }}>
                  ₹ {headerData[0].roff_amt}
                </td>
              </tr>

              <tr>
                <td>
                  <strong>Total</strong>
                </td>

                <td style={{ textAlign: "right" }}>
                  <strong>₹ {total}</strong>
                </td>
              </tr>

            </tbody>
          </table>

          {/* Amount In Words */}
          <p className="invoice-amount-words">
            Invoice Amount In Words:{" "}
            <span className="amount-in-words">
              {totalAmountInWords}
            </span>
          </p>

          {/* Terms and Conditions */}
          <div align="center" style={{ fontSize: "13px" }}>
            <strong>Terms and Conditions:</strong>

            {TCPrintData && TCPrintData.length > 0 ? (
              TCPrintData.map((row, index) => (
                <div key={index}>
                  {row.Terms_Conditions}
                </div>
              ))
            ) : (
              <div>Thanks for doing business with us!</div>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div
          className="invoice-footer"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            textAlign: "right",
            marginTop: "40px"
          }}
        >
          <div>
            <p style={{ margin: 0 }}>
              For: My Company
            </p>

            {/* <p style={{ marginTop: "40px" }}>
            Authorized Signatory
          </p> */}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          margin: "16px 0"
        }}
      >
        <button
          type="button"
          onClick={handleDownload}
          className="PrintButton"
        >
          <FontAwesomeIcon icon="fa-solid fa-download" />
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="PrintButton"
        >
          <FontAwesomeIcon icon="fa-solid fa-print" />
        </button>
      </div>
    </>
  );
};

export default SalesTemplate;

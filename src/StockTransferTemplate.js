import React, { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import './Template.css'
import { toWords } from 'number-to-words';
import {ToWords} from 'to-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'    
const config = require('./Apiconfig');

const Template = () => {
    const componentRef = useRef("");
    const toWords = new ToWords();
    // const [headerData, setHeaderData] = useState(null);
    // const [detailData, setDetailData] = useState([]);
    // const [taxData, setTaxData] = useState(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Purchase data'
    });

    const handleDownload = async () => {
        try {
          const invoiceElement = componentRef.current;
          const canvas = await html2canvas(invoiceElement);
          const imageData = canvas.toDataURL('image/png');
          const pdf = new jsPDF();
      
          const imgWidth = 210; // A4 width in mm
          const imgHeight = canvas.height * imgWidth / canvas.width;
          pdf.addImage(imageData, 'PNG', 0, 0, imgWidth, imgHeight);
      
          const blob = pdf.output('blob');
      
          if ('showSaveFilePicker' in window) {
            const opts = {
              types: [{
                description: 'PDF file',
                accept: { 'application/pdf': ['.pdf'] },
              }],
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
          console.error('Error saving the file:', error);
        }
      };

    const location = useLocation();
    const parseQueryParams = (query) => {
        return query
          .substring(1)
          .split("&")
          .reduce((acc, param) => {
            const [key, value] = param.split("=");
            acc[key] = decodeURIComponent(value);
            return acc;
          }, {});
      };
    
      const queryParams = parseQueryParams(location.search);
    
      const detailData = JSON.parse(queryParams.detailData);
    
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

    if ( !detailData) {
        return <div>Loading...</div>;
    }

    // const convertToWords = (amount) => {
    //     let words = toWords(amount);
    //     // Capitalize the first letter and add currency
    //     words = words.charAt(0).toUpperCase() + words.slice(1) + ' rupees only';
    //     return words;
    // };

  
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
                <div className="company-details"> */}
                    {/* <h2>{headerData[0].company_code}</h2> */}
                {/* </div>

                <div className="logo"> */}
                    {/* <img src="logo.png" alt="Company Logo" /> */}
                {/* </div>
            </div> */}

            <h2 style={{ margin: 0 }}>{sessionStorage.getItem('selectedCompanyCode')}</h2>
            <h2 style={{ margin: 0 }}>{sessionStorage.getItem('selectedCompanyName')}</h2>

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
                Stock Transfer Report
            </h1>

            {/* Bottom Line */}
            <hr
                style={{
                    border: "none",
                    borderTop: "1px solid currentColor",
                    margin: "10px 0 20px 0"
                }}
            />

            {/* Transaction Information */}
            <div
                className="invoice-info"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "24px"
                }}
            >
                <div
                    className="bill-to"
                    style={{
                        lineHeight: "1.6"
                    }}
                >
                </div>

                <div
                    className="invoice-details"
                    style={{
                        lineHeight: "1.6"
                    }}
                >
                    <p style={{ margin: "4px 0" }}>
                        <strong>Transaction Date:</strong>{" "}
                        {new Date(
                            detailData[0].transaction_date
                        ).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Table Section */}
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
                                Item Code
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
                                    padding: "8px 12px"
                                }}
                            >
                                From Warehouse
                            </th>

                            <th
                                style={{
                                    padding: "8px 12px"
                                }}
                            >
                                To Warehouse
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
                                Weight
                            </th>

                            <th
                                style={{
                                    padding: "8px 12px",
                                    textAlign: "right"
                                }}
                            >
                                Total Weight
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
                                    {index + 1}
                                </td>

                                <td
                                    style={{
                                        padding: "8px 12px"
                                    }}
                                >
                                    {row.item_code}
                                </td>

                                <td
                                    style={{
                                        padding: "8px 12px"
                                    }}
                                >
                                    {row.Item_name}
                                </td>

                                <td
                                    style={{
                                        padding: "8px 12px"
                                    }}
                                >
                                    {row.from_Warehouse}
                                </td>

                                <td
                                    style={{
                                        padding: "8px 12px"
                                    }}
                                >
                                    {row.to_Warehouse}
                                </td>

                                <td
                                    style={{
                                        padding: "8px 12px",
                                        textAlign: "right"
                                    }}
                                >
                                    {row.transfer_Qty}
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
                                    {row.total_weight}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
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
}

export default Template;

import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import '../Template.css';
import { ToWords } from 'to-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AdjustmnetPrint = () => {
  const componentRef = useRef();
  const [headerData, setHeaderData] = useState(null);
  const [detailData, setDetailData] = useState(null);

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

  const bufferToBase64 = (buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';

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
        return '';
    };

    const processSignatureImages = () => {
        if (headerData[0].authorisedSignatur && headerData[0].authorisedSignatur.data) {
            return bufferToBase64(headerData[0].authorisedSignatur.data);
        }
        return '';
    };

  useEffect(() => {
    const header = sessionStorage.getItem('ADheaderData');
    console.log (header)
    const detail = sessionStorage.getItem('ADdetailData');

    if (header && detail ) {
        setHeaderData(JSON.parse(header));
        setDetailData(JSON.parse(detail));
    } else {
        console.error('Data not found in sessionStorage');
    }
}, []);


if (!headerData || !detailData) {
    return <div>Loading...</div>;
}


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
              headerData[0]?.address3
            ]
              .filter((addr) => addr)
              .join(", ")}

            {headerData[0]?.city && `, ${headerData[0].city}`}
            {headerData[0]?.pincode && ` - ${headerData[0].pincode}`}

            <br />
          </div>

        </div>
      </div> */}

      <h2 style={{ margin: 0 }}>{headerData[0]?.company_code}</h2>
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
        Adjustment
      </h1>

      {/* Bottom Line */}
      <hr
        style={{
          border: "none",
          borderTop: "1px solid currentColor",
          margin: "10px 0 20px 0"
        }}
      />

      {/* Adjustment Information */}
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

          <p style={{ margin: "4px 0" }}>
            <strong>Transaction Number:</strong>{" "}
            {headerData[0].transaction_no}
          </p>

          <p style={{ margin: "4px 0" }}>
            <strong>Transaction Type:</strong>{" "}
            {headerData[0].transaction_type}
          </p>

          <p style={{ margin: "4px 0" }}>
            <strong>Transaction Date:</strong>{" "}
            {new Date(
              headerData[0].transaction_date
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
                  padding: "8px 12px",
                  textAlign: "right"
                }}
              >
                Quantity
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
                  {row.Item_SNo}
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
                    padding: "8px 12px",
                    textAlign: "right"
                  }}
                >
                  {row.qty}
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

export default AdjustmnetPrint;
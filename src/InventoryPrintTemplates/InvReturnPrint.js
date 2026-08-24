import React, { useRef,useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import '../Template.css';
import { ToWords } from 'to-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const InvReturnPrint = () => {
  const [headerData, setHeaderData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const componentRef = useRef();
  const toWords = new ToWords();

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

    useEffect(() => {
        const header = sessionStorage.getItem('IRheaderData');
        const detail = sessionStorage.getItem('IRdetailData');

        if (header && detail) {
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
        <div className="company-details">
          <h2 style={{ margin: 0 }}>
            {headerData[0].company_code}
          </h2> */}

          {/* <p>Phone no: 9790876453</p> */}
        {/* </div> */}

        {/* <div className="logo"> */}
          {/* <img src="logo.png" alt="Company Logo" /> */}
        {/* </div>
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
        Inventory Return
      </h1>

      {/* Bottom Line */}
      <hr
        style={{
          border: "none",
          borderTop: "1px solid currentColor",
          margin: "10px 0 20px 0"
        }}
      />

      {/* Return Information */}
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
            <strong>Return Id:</strong>{" "}
            {headerData[0].ReturnID}
          </p>

          <p style={{ margin: "4px 0" }}>
            <strong>Return Type:</strong>{" "}
            {headerData[0].Return_Type}
          </p>

          <p style={{ margin: "4px 0" }}>
            <strong>Transaction Date:</strong>{" "}
            {new Date(
              headerData[0].DateReturned
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
                Item Name
              </th>

              <th
                style={{
                  padding: "8px 12px"
                }}
              >
                Warehouse
              </th>

              <th
                style={{
                  padding: "8px 12px"
                }}
              >
                Supplier
              </th>

              <th
                style={{
                  padding: "8px 12px",
                  textAlign: "right"
                }}
              >
                Quantity Returned
              </th>

              <th
                style={{
                  padding: "8px 12px"
                }}
              >
                Reason For Return
              </th>

              <th
                style={{
                  padding: "8px 12px"
                }}
              >
                Condition
              </th>

              <th
                style={{
                  padding: "8px 12px"
                }}
              >
                Processed By
              </th>

              <th
                style={{
                  padding: "8px 12px"
                }}
              >
                Approval Status
              </th>

              <th
                style={{
                  padding: "8px 12px"
                }}
              >
                Action Taken
              </th>

              <th
                style={{
                  padding: "8px 12px"
                }}
              >
                Notes
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

                <td style={{ padding: "8px 12px" }}>
                  {row.ItemName}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  {row.Warehouse}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  {row.Supplier}
                </td>

                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "right"
                  }}
                >
                  {row.QuantityReturned}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  {row.ReasonForReturn}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  {row.Condition}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  {row.ProcessedBy}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  {row.ApprovalStatus}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  {row.ActionTaken}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  {row.Notes}
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
);}

export default InvReturnPrint;

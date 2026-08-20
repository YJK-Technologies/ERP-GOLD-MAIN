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
      <div className="invoice-container" ref={componentRef}>
        <div className="invoice-header">
                    <div className="d-flex align-items-start">
  {headerData[0]?.company_logo && (
    <div className="ms-3 mt-1">
      <img
        className="rounded-0"
        src={processItemImages(headerData[0].company_logo)}
        width={100}
        height={100}
        alt="Company Logo"
      />
    </div>
  )}

  <div className="mt-3 p-1">
    <strong>{headerData[0]?.company_name}</strong>
    <br />

    {[headerData[0]?.address1, headerData[0]?.address2, headerData[0]?.address3]
      .filter((addr) => addr)
      .join(", ")}

    {headerData[0]?.city && `, ${headerData[0].city}`}
    {headerData[0]?.pincode && ` - ${headerData[0].pincode}`}

    <br />
  </div>
</div>
                </div>
        <h1 className="invoice-title">Adjustment</h1>
        <div className="invoice-info">
          <div className="bill-to">
            <p>Transaction Number : {headerData[0].transaction_no}</p>
            <p>Transaction Type : {headerData[0].transaction_type}</p>
            <p>Transaction  Date : {new Date(headerData[0].transaction_date).toLocaleDateString()}</p>
          </div>
        </div>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Item Code</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {detailData.map((row, index) => (
              <tr key={index}>
                <td>{row.Item_SNo}</td>
                <td>{row.item_code}</td>
                <td>{row.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="invoice-footer">
          <p>For: My Company</p>
          {/* <p>Authorized Signatory</p> */}
        </div>
      </div>
      <div className="d-flex justify-content-between" style={{ marginLeft: "45%", marginTop: "5px" }}>
        <div align="left" className="d-flex justify-content-start">
          <button
            type="button"
            onClick={handleDownload}
            className='PrintButton'
          >
            <FontAwesomeIcon icon="fa-solid fa-download" />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className='PrintButton'
          >
            <FontAwesomeIcon icon="fa-solid fa-print" />
          </button>
        </div>
      </div>
    </>
  );
}

export default AdjustmnetPrint;

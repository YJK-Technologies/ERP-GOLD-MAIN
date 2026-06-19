import React from "react";
import { useLocation } from 'react-router-dom';
import "./TaxInvoice.css";
import PaymentQr from './Pictures/PaymentQr.png'
import { ToWords } from 'to-words';
import CompanyLogo from './Pictures/SMHF.png'

const Products= () => {

  const location = useLocation();
  const toWords = new ToWords();

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

  const headerData = JSON.parse(queryParams.headerData);
  const detailData = JSON.parse(queryParams.detailData)


  const total = parseFloat(headerData[0].total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 
  const purchase = parseFloat(headerData[0].purchase_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const totalAmount = headerData[0].total_amount;




  return (
    <div className="InvoiceContainer">
      <header>
      <div className="InvoiceHeader">
        <div className="CompanyDetails">
          <h1>SM Hospital Furniture & Homecare</h1>
          <p className="invoice-amount-words" style={{fontWeight:"bold"}}>Your Comfort Our Priority </p>
          <p>No.9A, New Century Nagar, Melayanambakkam, Chennai - 600095</p>
          <p>Mail id: info.smh2023@gmail.com | GSTIN: 33AFCFS7287L1ZF</p>
          <p> State: Tamil Nadu Code:33</p>
          <p>Contact no: 9597412436 / 8925858771 / 8925858773</p>
        </div>
        <div>
        <img src={CompanyLogo} alt="QR Code" />
        </div>
        </div>
      </header>

      <div className="InvoiceDetails">
        <h2>Product</h2>
        <p>Product Code: {headerData[0].Product_Code}</p>
        <p>Product Name: {headerData[0].Product_name}</p>
        <p>HSN code: {headerData[0].HSN_code}</p>
        <p>Description: {headerData[0].description}</p>
        {/* <p>Tax Type: {headerData[0].tax_type}</p> */}
      </div>

      {/* <section className="billing-details">
        <table className="bordered-table">
          <tbody>
            <tr>
              <td className="bill-to">
                <h3>SUPPLIER :</h3>
                <p>{detailData[0].vendor_name} </p>
                <p>{detailData[0].vendor_addr_1}, {detailData[0].vendor_addr_2}</p>
                <p>{detailData[0].vendor_addr_3}, {detailData[0].vendor_addr_4}</p>
                <p>CONTACT NAME - {detailData[0].contact_person} </p>
                <p>CONTACT NUMBER - {detailData[0].contact_number}</p>
              </td>
              <td className="ship-to">
                <h3>SHIP TO</h3>
                <p>{detailData[0].ShipTo_customer_name} </p>
                <p>{detailData[0].ShipTo_customer_addr_1}, {detailData[0].ShipTo_customer_addr_2}</p>
                <p>{detailData[0].ShipTo_customer_addr_3}, {detailData[0].ShipTo_customer_addr_4}</p>
                <p>CONTACT NAME - {detailData[0].ship_to_contact_person} </p>
                <p>CONTACT NUMBER - {detailData[0].ship_to_contact_number}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </section> */}

      <section className="product-details">
        <table className="bordered-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Item Code</th>
              <th>Item Name </th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
          {detailData.map((row, index) => (
            <tr key={index}>
             <td>{row.Item_SNo}</td>
              <td>{row.item_code}</td>
              <td>{row.item_name}</td>
              <td>{row.quantity}</td>
            
              
            </tr>
             ))}
          </tbody>
        </table>
      </section>

      {/* <section className="remarks">
        <p>Remarks:</p>
      </section> */}

      <section className="invoice-summary">
        <table className="bordered-table">
          <tfoot>
            {/* <tr>
              <td>SUBTOTAL</td>
              <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(headerData[0].Product_Code))}</td>
            </tr> */}
            {/* <tr>
              <td>DISCOUNT</td>
            </tr>
            <tr>
              <td>SUBTOTAL LESS DISCOUNT</td>
              <td>9500.00</td>
            </tr> */}
             {/* {taxData.map((row, index) => (
            <tr key={index}>
            <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(taxData[0].Product_name))}</td>
          </tr>
             ))} */}
            {/* <p style={{ fontSize: '0.8em' }}>Tax amount in words -THOUSAND SEVEN HUNDRED AND TEN ONLY</p> */}
            {/* <tr>
              <td>TOTAL TAX</td>
              <td>1710.00  </td>
            </tr> */}
            {/* <tr>
              <td>SHIPPING/HANDLING</td>
            </tr> */}
            {/* <tr>
              <td>TOTAL TAX</td>
              <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(headerData[0].HSN_code))}</td>
            </tr> */}
            <tr>
              <td>TOTAL</td>
              <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(headerData[0].Product_price))}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="footer">
      {/* <p className="invoice-amount-words">Tax Amount In Words: <span className="amount-in-words">{taxAmountInWords}</span></p>
      <p className="invoice-amount-words">Total Amount In Words: <span className="amount-in-words">{totalAmountInWords}</span></p> */}
        <table className="bordered-table">
          <tbody>
            <tr>
              <td className="terms-conditions">
                <h3>Terms and Conditions :</h3>
                <p>Transport - Your  scope</p>
               
                <h3 style={{ fontWeight: "bold", marginTop:"5px" }}>Payment Terms:</h3>
                <p>30 days</p>
                <h3 style={{ fontWeight: "bold", marginTop:"5px" }}>Delivery Terms:</h3>
                <p> 06.01.2024</p>
               
              </td>
              <td className="bank-details">
                <h3>Bank Details</h3>
                <p>Account Name: SM Hospital Furniture & Homecare</p>
                <p>Bank: Karur Vysya Bank</p>
                <p>Account No: 19421350000059</p>
                <p>Account Type: Current</p>
                <p>IFSC Code: KVBL0001280</p>
                <p>Branch: Ayyapakkam</p>
              </td>
              <td className="qr-code">
                <p>Payment QR Code</p>
                <img src={PaymentQr} alt="QR Code" />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

        {/* <p className="subject">
          SUBJECT TO CHENNAI JURISDICTION ONLY
        </p> */}

      <section className="signatures">
        <table className="bordered-table">
          <tbody>
            <tr>
              <td className="customer-signature">
                <p>Material Received in good condition</p>
                <p>Customer Signature</p>
              </td>
              <td className="company-signature">
                <p>For SM Hospital furniture & Homecare</p>
                <p>Authorised Signatory</p>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Products;

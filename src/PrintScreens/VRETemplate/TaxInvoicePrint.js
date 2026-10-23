import React, { useEffect, useState } from "react";
import "./InvoicePrint.css"; // Ensure it imports the scoped 3rd template CSS
import { ToWords } from 'to-words';
import { useLocation } from 'react-router-dom';
import LZString from "lz-string";

const Invoice = () => {
    const [headerData, setHeaderData] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [taxData, setTaxData] = useState(null);
    const [hsnTaxData, setHsnTaxData] = useState(null);
    const location = useLocation();
    const toWords = new ToWords();

    useEffect(() => {
        const header = sessionStorage.getItem('TaxInvoiceheaderData');
        const detail = sessionStorage.getItem('TaxInvoicedetailData');
        const tax = sessionStorage.getItem('TaxInvoicetaxData');
        const hsnTax = sessionStorage.getItem('TaxInvoiceHsnTaxData');

        if (header && detail && tax) {
            setHeaderData(JSON.parse(LZString.decompress(header)));
            setDetailData(JSON.parse(LZString.decompress(detail)));
            setTaxData(JSON.parse(LZString.decompress(tax)));
            if (hsnTax) {
                setHsnTaxData(JSON.parse(LZString.decompress(hsnTax)));
            }
        } else {
            console.error('Data not found in sessionStorage');
        }
    }, []);

    const bufferToBase64 = (buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i += 1024) {
            const chunk = bytes.subarray(i, i + 1024);
            binary += String.fromCharCode.apply(null, chunk);
        }
        return `data:image/jpeg;base64,${window.btoa(binary)}`;
    };

    const processSignatureImages = () => {
        if (headerData && headerData[0]?.authorisedSignatur && headerData[0].authorisedSignatur.data) {
            return bufferToBase64(headerData[0].authorisedSignatur.data);
        }
        return '';
    };

    if (!headerData || !detailData || !taxData) {
        return <div>Loading...</div>;
    }

    const authorizedSignature = processSignatureImages();

    const totalAmount = parseFloat(headerData[0]?.bill_amt || 0);
    const purchaseAmount = parseFloat(headerData[0]?.sale_amt || 0);
    const totalTaxAmount = parseFloat(headerData[0]?.tax_amount || 0);
    const roundOff = parseFloat(headerData[0]?.roff_amt || 0);

    const formatCurrency = (val) => {
        return parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const totalAmountFormatted = formatCurrency(totalAmount);
    const purchaseAmountFormatted = formatCurrency(purchaseAmount);
    const totalAmountInWords = `INR ${toWords.convert(totalAmount, { currency: true })}`;
    const taxAmountInWords = `INR ${toWords.convert(totalTaxAmount, { currency: true })} `;

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[d.getMonth()];
        const year = String(d.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    };

    const ITEMS_PER_PAGE = 6;
    const itemPages = [];
    for (let i = 0; i < detailData.length; i += ITEMS_PER_PAGE) {
        itemPages.push(detailData.slice(i, i + ITEMS_PER_PAGE));
    }

    const totalPages = itemPages.length + 1;

    const renderCompanyHeader = () => (
        <>
            <div className="text-center fw-bold fs-6 py-1 border border-bottom-0 border-dark">
                Tax Invoice
            </div>
            <table className="invoice-header-table border border-dark">
                <tbody>
                    <tr>
                        <td style={{ width: "50%", borderRight: "1px solid black" }}>
                            <div className="p-1 border-bottom border-dark">
                                <div className="fw-bold fs-6">{headerData[0].company_name}</div>
                                <div>
                                    {[headerData[0].address1, headerData[0].address2, headerData[0].address3]
                                        .filter(Boolean)
                                        .join(", ")}, {headerData[0].city} - {headerData[0].pincode}<br />
                                    <strong>GSTIN/UIN:</strong> {headerData[0].company_gst_no}<br />
                                    <strong>State Name:</strong> {detailData[0].state || "Tamil Nadu"},<br />
                                    <strong>Contact :</strong> {headerData[0].contact_no || "+91-99445 31549"}<br />
                                </div>
                            </div>
                            <div className="p-1 border-bottom border-dark">
                                <span style={{ fontSize: "9.5px" }}>Consignee (Ship to)</span>
                                <div className="fw-bold">{headerData[0].shipTo_customer_name}</div>
                                <div>
                                    {[headerData[0].shipTo_customer_addr_1, headerData[0].shipTo_customer_addr_2, headerData[0].shipTo_customer_addr_3].filter(Boolean).join(", ")}<br />
                                    <strong>GSTIN/UIN :</strong> {headerData[0].ShipTo_customer_gst_no}<br />
                                    <strong>State Name :</strong> {headerData[0].shipTo_customer_state}
                                </div>
                            </div>
                            <div className="p-1">
                                <span style={{ fontSize: "9.5px" }}>Buyer (Bill to)</span>
                                <div className="fw-bold">{headerData[0].billTo_customer_name}</div>
                                <div>
                                    {[headerData[0].billTo_customer_addr_1, headerData[0].billTo_customer_addr_2, headerData[0].billTo_customer_addr_3].filter(Boolean).join(", ")}<br />
                                    <strong>GSTIN/UIN :</strong> {headerData[0].billTo_customer_gst_no}<br />
                                    <strong>State Name :</strong> {headerData[0].billTo_customer_state}
                                </div>
                            </div>
                        </td>
                        <td style={{ width: "50%", padding: 0 }}>
                            <div className="d-flex border-bottom border-dark">
                                <div className="p-1 border-end border-dark w-50">
                                    <span style={{ fontSize: "9.5px" }}>Invoice No.</span><br />
                                    <strong>{headerData[0].bill_no}</strong>
                                </div>
                                <div className="p-1 w-50">
                                    <span style={{ fontSize: "9.5px" }}>Dated</span><br />
                                    <strong>{formatDate(headerData[0].bill_date)}</strong>
                                </div>
                            </div>
                            <div className="d-flex border-bottom border-dark">
                                <div className="p-1 border-end border-dark w-50" style={{ minHeight: "22px" }}>
                                    <span style={{ fontSize: "9.5px" }}>Delivery Note</span>
                                </div>
                                <div className="p-1 w-50" style={{ minHeight: "22px" }}>
                                    <span style={{ fontSize: "9.5px" }}>Mode/Terms of Payment</span>
                                </div>
                            </div>
                            <div className="d-flex border-bottom border-dark">
                                <div className="p-1 border-end border-dark w-50" style={{ minHeight: "22px" }}>
                                    <span style={{ fontSize: "9.5px" }}>Reference No. & Date.</span>
                                </div>
                                <div className="p-1 w-50" style={{ minHeight: "22px" }}>
                                    <span style={{ fontSize: "9.5px" }}>Other References</span>
                                </div>
                            </div>
                            <div className="d-flex border-bottom border-dark">
                                <div className="p-1 border-end border-dark w-50" style={{ minHeight: "22px" }}>
                                    <span style={{ fontSize: "9.5px" }}>Buyer's Order No.</span>
                                </div>
                                <div className="p-1 w-50" style={{ minHeight: "22px" }}>
                                    <span style={{ fontSize: "9.5px" }}>Dated</span>
                                </div>
                            </div>
                            <div className="d-flex border-bottom border-dark">
                                <div className="p-1 border-end border-dark w-50" style={{ minHeight: "22px" }}>
                                    <span style={{ fontSize: "9.5px" }}>Dispatch Doc No.</span>
                                </div>
                                <div className="p-1 w-50" style={{ minHeight: "22px" }}>
                                    <span style={{ fontSize: "9.5px" }}>Delivery Note Date</span>
                                </div>
                            </div>
                            <div className="d-flex border-bottom border-dark">
                                <div className="p-1 border-end border-dark w-50" style={{ minHeight: "22px" }}>
                                    <span style={{ fontSize: "9.5px" }}>Dispatched through</span>
                                </div>
                                <div className="p-1 w-50" style={{ minHeight: "22px" }}>
                                    <span style={{ fontSize: "9.5px" }}>Destination</span>
                                </div>
                            </div>
                            <div className="p-1" style={{ minHeight: "24px" }}>
                                <span style={{ fontSize: "9.5px" }}>Terms of Delivery</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );

    return (
        <div className="template3-container">
            {itemPages.map((pageItems, pageIndex) => {
                const isLastItemPage = pageIndex === itemPages.length - 1;

                return (
                    <div key={`item-page-${pageIndex}`} className="invoice-page custom-text">
                        <div className="invoice-body-wrapper">
                            {renderCompanyHeader()}

                            <table className="invoiceTable w-100 border-top-0">
                                <thead>
                                    <tr>
                                        <th style={{ width: "5%" }}>SI<br />No.</th>
                                        <th style={{ width: "32%" }}>Description of Goods</th>
                                        <th style={{ width: "10%" }}>HSN/SAC</th>
                                        <th style={{ width: "7%" }}>GST<br />Rate</th>
                                        <th style={{ width: "8%" }}>Quantity</th>
                                        <th style={{ width: "10%" }}>Rate</th>
                                        <th style={{ width: "7%" }}>Per</th>
                                        <th style={{ width: "7%" }}>Disc. %</th>
                                        <th style={{ width: "14%" }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.map((row, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: "center" }}>{row.SNo || (pageIndex * ITEMS_PER_PAGE + idx + 1)}</td>
                                            <td>
                                                <strong>{row.name}</strong><br />
                                                <span style={{ fontSize: "9.5px" }}>Unit UOM : {row.Item_BaseUOM || "Pcs"}</span>
                                            </td>
                                            <td style={{ textAlign: "center" }}>{row.hsn_code}</td>
                                            <td style={{ textAlign: "center" }}>{row.tax_percentage}%</td>
                                            <td style={{ textAlign: "center" }}>{row.bill_qty}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurrency(row.unit_price)}</td>
                                            <td style={{ textAlign: "center" }}>{row.Item_BaseUOM || "Pcs"}</td>
                                            <td style={{ textAlign: "center" }}>{row.Discount_Value}%</td>
                                            <td style={{ textAlign: "right" }}>{formatCurrency(row.bill_rate)}</td>
                                        </tr>
                                    ))}

                                    {isLastItemPage && taxData && taxData.map((tRow, tIdx) => (
                                        <tr key={`tax-row-${tIdx}`}>
                                            <td></td>
                                            <td style={{ textAlign: "right" }}><strong>Output {tRow.tax_name_details}</strong></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td style={{ textAlign: "right" }}><strong>{tRow.tax_name_details.replace(/[^0-9.]/g, '')}%</strong></td>
                                            <td></td>
                                            <td></td>
                                            <td style={{ textAlign: "right" }}><strong>{formatCurrency(tRow.tax_amt)}</strong></td>
                                        </tr>
                                    ))}

                                    {isLastItemPage && roundOff !== 0 && (
                                        <tr>
                                            <td></td>
                                            <td style={{ textAlign: "right" }}><strong>Round Off</strong></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td style={{ textAlign: "right" }}><strong>{roundOff < 0 ? `(-)${formatCurrency(Math.abs(roundOff))}` : formatCurrency(roundOff)}</strong></td>
                                        </tr>
                                    )}

                                    {isLastItemPage && (
                                        <tr>
                                            <td></td>
                                            <td style={{ textAlign: "right" }}><strong>Sub Total / Sale Amount</strong></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td style={{ textAlign: "right" }}><strong>{purchaseAmountFormatted}</strong></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {isLastItemPage ? (
                                <>
                                    <div className="d-flex justify-content-between border border-top-0 border-dark px-2 py-1 fw-bold">
                                        <span>Total</span>
                                        <span>₹ {totalAmountFormatted}</span>
                                    </div>
                                    <div className="border border-top-0 border-dark p-1" style={{ fontSize: "10.5px" }}>
                                        <span>Amount Chargeable (in words)</span><br />
                                        <strong>{totalAmountInWords}</strong>
                                        <span className="float-end font-italic">E. & O.E</span>
                                    </div>
                                </>
                            ) : (
                                <div className="invoice-continued-area">
                                    continued ...
                                </div>
                            )}
                        </div>

                        <div className="invoice-page-footer">
                            This is a Computer Generated Invoice &nbsp;|&nbsp; Page {pageIndex + 1} of {totalPages}
                        </div>
                    </div>
                );
            })}

            {/* Dedicated HSN Tax Details & Declaration Page */}
            <div className="invoice-page custom-text">
                <div className="invoice-body-wrapper">
                    {renderCompanyHeader()}

                    <table className="invoiceTable w-100 border-top-0" style={{ tableLayout: "fixed" }}>
                        <thead>
                            <tr>
                                <th rowSpan="2" style={{ width: "9%", verticalAlign: "middle" }}>HSN/SAC</th>
                                <th rowSpan="2" style={{ width: "15%", verticalAlign: "middle" }}>Taxable Value</th>
                                <th colSpan="2" style={{ width: "18%" }}>CGST</th>
                                <th colSpan="2" style={{ width: "18%" }}>SGST / UTGST</th>
                                <th colSpan="2" style={{ width: "16%" }}>IGST</th>
                                <th rowSpan="2" style={{ width: "24%", verticalAlign: "middle" }}>Total Tax Amount</th>
                            </tr>
                            <tr>
                                <th style={{ width: "3%" }}>Rate</th>
                                <th style={{ width: "15%" }}>Amount</th>
                                <th style={{ width: "3%" }}>Rate</th>
                                <th style={{ width: "15%" }}>Amount</th>
                                <th style={{ width: "3%" }}>Rate</th>
                                <th style={{ width: "13%" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hsnTaxData && hsnTaxData.map((hsnRow, hIdx) => (
                                <tr key={hIdx}>
                                    <td style={{ textAlign: "center" }}>{hsnRow["HSN/SAC"]}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurrency(hsnRow["Taxable Value"])}</td>
                                    <td style={{ textAlign: "center" }}>{hsnRow["CGST Rate (%)"] > 0 ? `${hsnRow["CGST Rate (%)"]}%` : "-"}</td>
                                    <td style={{ textAlign: "right" }}>{hsnRow["CGST Amount"] > 0 ? formatCurrency(hsnRow["CGST Amount"]) : "-"}</td>
                                    <td style={{ textAlign: "center" }}>{hsnRow["SGST/UTGST Rate (%)"] > 0 ? `${hsnRow["SGST/UTGST Rate (%)"]}%` : "-"}</td>
                                    <td style={{ textAlign: "right" }}>{hsnRow["SGST/UTGST Amount"] > 0 ? formatCurrency(hsnRow["SGST/UTGST Amount"]) : "-"}</td>
                                    <td style={{ textAlign: "center" }}>{hsnRow["IGST Rate (%)"] > 0 ? `${hsnRow["IGST Rate (%)"]}%` : "-"}</td>
                                    <td style={{ textAlign: "right" }}>{hsnRow["IGST Amount"] > 0 ? formatCurrency(hsnRow["IGST Amount"]) : "-"}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurrency(hsnRow["Total Tax Amount"])}</td>
                                </tr>
                            ))}

                            <tr>
                                <td><strong>Total</strong></td>
                                <td style={{ textAlign: "right" }}>
                                    <strong>{formatCurrency(hsnTaxData ? hsnTaxData.reduce((acc, c) => acc + parseFloat(c["Taxable Value"] || 0), 0) : 0)}</strong>
                                </td>
                                <td></td>
                                <td style={{ textAlign: "right" }}>
                                    <strong>{formatCurrency(hsnTaxData ? hsnTaxData.reduce((acc, c) => acc + parseFloat(c["CGST Amount"] || 0), 0) : 0)}</strong>
                                </td>
                                <td></td>
                                <td style={{ textAlign: "right" }}>
                                    <strong>{formatCurrency(hsnTaxData ? hsnTaxData.reduce((acc, c) => acc + parseFloat(c["SGST/UTGST Amount"] || 0), 0) : 0)}</strong>
                                </td>
                                <td></td>
                                <td style={{ textAlign: "right" }}>
                                    <strong>{formatCurrency(hsnTaxData ? hsnTaxData.reduce((acc, c) => acc + parseFloat(c["IGST Amount"] || 0), 0) : 0)}</strong>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <strong>{formatCurrency(hsnTaxData ? hsnTaxData.reduce((acc, c) => acc + parseFloat(c["Total Tax Amount"] || 0), 0) : 0)}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="border border-top-0 border-dark p-1" style={{ fontSize: "10.5px" }}>
                        Tax Amount (in words) : <strong>{taxAmountInWords}</strong>
                    </div>

                    <div className="row m-0 border border-top-0 border-dark">
                        <div className="col-6 border-end border-dark p-2" style={{ fontSize: "10.5px" }}>
                            <strong>Declaration</strong><br />
                            We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                        </div>
                        <div className="col-6 p-2 d-flex flex-column justify-content-between text-end" style={{ fontSize: "10.5px", minHeight: "75px" }}>
                            <div>for <strong>{headerData[0].company_name}</strong></div>
                            {authorizedSignature && (
                                <div className="text-center my-1">
                                    <img src={authorizedSignature} alt="Signature" style={{ maxHeight: "28px", objectFit: "contain" }} />
                                </div>
                            )}
                            <div>Authorised Signatory</div>
                        </div>
                    </div>
                </div>

                <div className="invoice-page-footer">
                    This is a Computer Generated Invoice &nbsp;|&nbsp; Page {totalPages} of {totalPages}
                </div>
            </div>
        </div>
    );
};

export default Invoice;
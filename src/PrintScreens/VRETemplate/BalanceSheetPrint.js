import React, { useEffect, useState } from "react";
import "./InvoicePrint.css"; // Uses .template3-container, .invoice-page, .invoiceTable from your CSS
import LZString from "lz-string";

const BalanceSheetPrint = () => {
    const [filterData, setFilterData] = useState(null);
    const [gridData, setGridData] = useState({ liabilities: [], assets: [] });

    // Date formatter helper (DD/MM/YYYY)
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        try {
            const getStoredData = (key) => {
                const raw = localStorage.getItem(key);
                if (!raw) return null;
                try {
                    const decompressed = LZString.decompressFromUTF16(raw); 
                    if (decompressed) {
                        return JSON.parse(decompressed);
                    }
                } catch (err) {
                    console.warn(`Decompression failed for ${key}, trying raw JSON parse.`);
                }
                try {
                    return JSON.parse(raw);
                } catch (err) {
                    return null;
                }
            };

            const filters = getStoredData("BalanceSheetFilters");
            const data = getStoredData("BalanceSheetData");

            if (filters) {
                setFilterData(filters);
            } else {
                setFilterData({
                    companyName: sessionStorage.getItem("selectedCompanyName") || "YJK Technologies",
                    branch: "All Branches",
                    financialYear: "2025-2026",
                    asOnDate: "2026-03-31",
                    currency: "INR",
                    reportBasis: "Consolidated"
                });
            }

            if (data) {
                setGridData(data);
            }
        } catch (err) {
            console.error("Error reading balance sheet print data:", err);
        }
    }, []);

    if (!filterData) {
        return <div className="p-4 text-center">Loading Balance Sheet Statement...</div>;
    }

    // Header rendering matching CustomerLedgerPrint format perfectly
    const renderHeader = () => (
        <>
            <div className="text-center fw-bold fs-6 py-1 border border-bottom-0 border-dark text-uppercase bg-light">
                Balance Sheet
            </div>
            <table className="invoice-header-table border border-dark w-100" style={{ tableLayout: 'fixed' }}>
                <tbody>
                    {/* ROW 1: Company Details Centered */}
                    <tr>
                        <td className="px-2 py-2 text-center" style={{ verticalAlign: "top" }}>
                            <div className="fw-bold text-uppercase mb-1" style={{ fontSize: "16px" }}>
                                {filterData.companyName}
                            </div>
                            {/* <div className="fw-bold mt-1" style={{ fontSize: "13px" }}>
                                As on {formatDate(filterData.asOnDate)}
                            </div> */}
                        </td>
                    </tr>

                    {/* ROW 2: Filter Input Details horizontally aligned (Search inputs displayed just about the grid) */}
                    <tr className="border-top border-dark">
                        <td className="p-0">
                            <div className="d-flex w-100 text-center" style={{ fontSize: "11px" }}>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>As on Date</div>
                                    <div className="fw-bold">{filterData.asOnDate || "-"}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Fin. Year</div>
                                    <div className="fw-bold">{filterData.financialYear || "-"}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Currency</div>
                                    <div className="fw-bold">{filterData.currency || "INR"}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Report Basis</div>
                                    <div className="fw-bold">{filterData.reportBasis || "Consolidated"}</div>
                                </div>
                                <div className="flex-fill px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Print Date</div>
                                    <div className="fw-bold">{formatDate(new Date())}</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );

    // Helper to convert comma-separated strings/brackets into numbers for calculation
    const parseAmount = (val) => {
        if (!val || val === "-") return 0;
        let str = val.toString().replace(/,/g, '');
        if (str.startsWith('(') && str.endsWith(')')) {
            return -parseFloat(str.slice(1, -1));
        }
        return parseFloat(str) || 0;
    };

    // Helper to convert numbers back into Indian currency format
    const formatAmount = (num) => {
        if (num === 0) return "-";
        if (num < 0) return `(${Math.abs(num).toLocaleString('en-IN')})`;
        return num.toLocaleString('en-IN');
    };

    // Updated renderTable with dynamic totals
    const renderTable = (title, data, totalLabel) => {
        // Dynamically calculate the sum of all "subtotal" rows
        const totalCurrent = data
            .filter(r => r.type === 'subtotal')
            .reduce((acc, row) => acc + parseAmount(row.current), 0);
            
        const totalPrev = data
            .filter(r => r.type === 'subtotal')
            .reduce((acc, row) => acc + parseAmount(row.prev), 0);

        return (
            <div className="mb-4">
                <h6 className="fw-bold bg-light p-2 mb-0 border border-dark border-bottom-0 border-top-0 text-primary text-uppercase" style={{fontSize: '13px'}}>
                    {title}
                </h6>
                <table className="invoiceTable w-100 border-top-0" style={{ tableLayout: "fixed" }}>
                    <thead>
                        <tr>
                            <th style={{ width: "50%", textAlign: "left" }}>Particulars</th>
                            <th style={{ width: "15%", textAlign: "center" }}>Note No.</th>
                            <th style={{ width: "17.5%", textAlign: "right" }}>As on {formatDate(filterData.asOnDate)} (₹)</th>
                            <th style={{ width: "17.5%", textAlign: "right" }}>Previous Year (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            <>
                                {data.map((row, idx) => (
                                    <tr key={idx} style={
                                        row.type === 'header' ? { backgroundColor: '#f8f9fa', fontWeight: 'bold' } :
                                        row.type === 'subtotal' ? { backgroundColor: '#e9ecef', fontWeight: 'bold' } : {}
                                    }>
                                        <td style={{ borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px", paddingLeft: row.type ? "5px" : "20px", fontWeight: row.type ? "600" : "400" }}>
                                            {row.name}
                                        </td>
                                        <td style={{ textAlign: "center", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                            {row.note || "-"}
                                        </td>
                                        <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px", fontWeight: row.type ? "600" : "400" }}>
                                            {row.current || "-"}
                                        </td>
                                        <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px", fontWeight: row.type ? "600" : "400" }}>
                                            {row.prev || "-"}
                                        </td>
                                    </tr>
                                ))}
                                
                                {/* Dynamically Calculated Grand Total Row */}
<tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', borderTop: '2px solid #000' }}>
    <td style={{ borderBottom: "2px solid #000", borderTop: "none", paddingTop: "4px", paddingBottom: "4px", paddingLeft: "5px" }}>
        {totalLabel}
    </td>
    <td style={{ textAlign: "center", borderBottom: "2px solid #000", borderTop: "none", paddingTop: "4px", paddingBottom: "4px" }}>
        -
    </td>
    <td style={{ textAlign: "right", borderBottom: "2px solid #000", borderTop: "none", paddingTop: "4px", paddingBottom: "4px" }}>
        {formatAmount(totalCurrent)}
    </td>
    <td style={{ textAlign: "right", borderBottom: "2px solid #000", borderTop: "none", paddingTop: "4px", paddingBottom: "4px" }}>
        {formatAmount(totalPrev)}
    </td>
</tr>
                            </>
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-muted">No data available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="template3-container">
            <div className="invoice-page custom-text mb-4">
                <div className="invoice-body-wrapper">
                    
                    {renderHeader()}

                    {/* Renders tables one by one inside print screen */}
{renderTable("A. EQUITY AND LIABILITIES", gridData.liabilities, "TOTAL EQUITY AND LIABILITIES")}
                    
{renderTable("B. ASSETS", gridData.assets, "TOTAL ASSETS")}

                    {/* Signature and Note footer */}
                    {/* <div className="row m-0 border border-dark mt-4 page-break-inside-avoid">
                        <div className="col-7 border-end border-dark p-2" style={{ fontSize: "10px" }}>
                            <strong>Note:</strong><br />
                            This is a system-generated balance sheet and does not require a signature.<br/>
                        </div>
                        <div className="col-5 p-2 d-flex justify-content-between text-center" style={{ fontSize: "10.5px", minHeight: "65px" }}>
                            <div className="d-flex flex-column justify-content-end" style={{width: '45%'}}>
                                <hr className="border-dark w-100 mb-1"/>
                                <div>Prepared By<br/><strong>Admin</strong></div>
                            </div>
                            <div className="d-flex flex-column justify-content-end" style={{width: '45%'}}>
                                <hr className="border-dark w-100 mb-1"/>
                                <div>Approved By<br/><strong>Finance Manager</strong></div>
                            </div>
                        </div>
                    </div> */}

                </div>

                {/* Page Number Footer */}
                <div className="invoice-page-footer text-center border-top pt-1 mt-2" style={{ fontSize: "10px", color: "#666" }}>
                    Computer Generated Balance Sheet Statement &nbsp;|&nbsp; Page 1 of 1
                </div>
            </div>
        </div>
    );
};

export default BalanceSheetPrint;
import React, { useEffect, useState } from "react";
import "./InvoicePrint.css"; // Uses .template3-container, .invoice-page, .invoiceTable from your CSS
import LZString from "lz-string";

const CustomerLedgerPrint = () => {
    const [filterData, setFilterData] = useState(null);
    const [ledgerRows, setLedgerRows] = useState([]);
    const [summaryMetrics, setSummaryMetrics] = useState(null);

    // Date formatter helper (DD/MM/YYYY)
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; // Fallback if already formatted
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Currency formatter (en-IN 2 decimals)
    const formatCurrency = (val) => {
        if (val === null || val === undefined || val === "") return "-";
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        return num.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    useEffect(() => {
        try {
            const getStoredData = (key) => {
                const raw = sessionStorage.getItem(key);
                if (!raw) return null;

                // Try LZString decompress first; fallback to raw JSON
                try {
                    const decompressed = LZString.decompress(raw);
                    if (decompressed) {
                        return JSON.parse(decompressed);
                    }
                } catch {
                    // ignore and try raw
                }

                try {
                    return JSON.parse(raw);
                } catch {
                    return null;
                }
            };

            const filters = getStoredData("CustomerLedgerFilters");
            const rows = getStoredData("CustomerLedgerRows");
            const metrics = getStoredData("CustomerLedgerMetrics");

            if (filters) {
                setFilterData(filters);
            } else {
                // Fallback default values if opened directly
                setFilterData({
                    companyName: sessionStorage.getItem("selectedCompanyName") || "YJK Technologies",
                    companyAddress: sessionStorage.getItem("selectedCompanyAddress") || "Thadaperumbakkam, Ponneri High Road",
                    companyCity: sessionStorage.getItem("selectedCompanyCity") || "Tiruvallur",
                    companyPincode: sessionStorage.getItem("selectedCompanyPincode") || "601204",
                    companyGst: sessionStorage.getItem("selectedCompanyGst") || "33AAAAA0000A1Z5",
                    companyContact: sessionStorage.getItem("selectedCompanyContact") || "+91-99445 31549",
                    financialYear: "2026 - 2027",
                    customerCode: "CUST-0001",
                    customerName: "ABC Industries",
                    currency: "INR",
                    fromDate: "2026-04-01",
                    toDate: "2027-03-31",
                    branch: "All Branches",
                    voucherType: "All Types",
                    status: "Posted",
                });
            }

            if (rows && Array.isArray(rows)) {
                // Filter out any virtual AG Grid total row that was added dynamically
                const sanitizedRows = rows.filter((r) => !r.isTotalRow);
                setLedgerRows(sanitizedRows);
            } else {
                // Default fallback transactions for preview
                setLedgerRows([
                    { s_no: 1, date: "01-04-2026", voucher_no: "OPEN-001", type: "Opening", reference_no: "B/F", description: "Opening Balance", debit: 50000.0, credit: 0.0, balance: "50,000.00 Dr" },
                    { s_no: 2, date: "05-04-2026", voucher_no: "SI-001", type: "Sales Invoice", reference_no: "INV-001", description: "Sales Invoice - INV-001", debit: 100000.0, credit: 0.0, balance: "1,50,000.00 Dr" },
                    { s_no: 3, date: "10-04-2026", voucher_no: "RC-001", type: "Receipt", reference_no: "BANK-001", description: "Receipt via Bank", debit: 0.0, credit: 60000.0, balance: "90,000.00 Dr" },
                    { s_no: 4, date: "15-04-2026", voucher_no: "SI-002", type: "Sales Invoice", reference_no: "INV-002", description: "Sales Invoice - INV-002", debit: 100000.0, credit: 0.0, balance: "1,90,000.00 Dr" },
                    { s_no: 5, date: "20-04-2026", voucher_no: "CN-001", type: "Credit Note", reference_no: "CN-001", description: "Sales Credit Note", debit: 0.0, credit: 5000.0, balance: "1,85,000.00 Dr" },
                    { s_no: 6, date: "25-04-2026", voucher_no: "DN-001", type: "Debit Note", reference_no: "DN-001", description: "Debit Note for Additional Charges", debit: 10000.0, credit: 0.0, balance: "1,95,000.00 Dr" },
                    { s_no: 7, date: "30-04-2026", voucher_no: "RC-002", type: "Receipt", reference_no: "BANK-002", description: "Receipt via Bank", debit: 0.0, credit: 60000.0, balance: "1,35,000.00 Dr" }
                ]);
            }

            if (metrics) {
                setSummaryMetrics(metrics);
            }
        } catch (err) {
            console.error("Error reading customer ledger print data:", err);
        }
    }, []);

    if (!filterData) {
        return <div className="p-4 text-center">Loading Customer Ledger Statement...</div>;
    }

    // Calculate Totals
    const totalDebit = ledgerRows.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
    const totalCredit = ledgerRows.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
    const closingBalance = ledgerRows.length > 0 ? ledgerRows[ledgerRows.length - 1].balance : "0.00";

    // Multi-page pagination calculation (ledger rows per page)
    const ITEMS_PER_PAGE = 18;
    const itemPages = [];
    if (ledgerRows.length === 0) {
        itemPages.push([]);
    } else {
        for (let i = 0; i < ledgerRows.length; i += ITEMS_PER_PAGE) {
            itemPages.push(ledgerRows.slice(i, i + ITEMS_PER_PAGE));
        }
    }

    const totalPages = itemPages.length;

    // Header rendering matching PurchaseOrderPrint.js layout
    const renderHeader = () => (
        <>
            <div className="text-center fw-bold fs-6 py-1 border border-bottom-0 border-dark text-uppercase bg-light">
                Customer Ledger Statement
            </div>
            <table className="invoice-header-table border border-dark w-100">
                <tbody>
                    <tr>
                        {/* Company & Customer Details (Left Box) */}
                        <td style={{ width: "52%", borderRight: "1px solid black", verticalAlign: "top" }}>
                            <div className="p-2 border-bottom border-dark">
                                <div className="fw-bold fs-6 text-uppercase">{filterData.companyName}</div>
                                <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
                                    {[filterData.companyAddress, filterData.companyCity].filter(Boolean).join(", ")}
                                    {filterData.companyPincode ? ` - ${filterData.companyPincode}` : ""}<br />
                                    <strong>GSTIN/UIN:</strong> {filterData.companyGst || "N/A"}<br />
                                    <strong>Contact:</strong> {filterData.companyContact || "-"}
                                </div>
                            </div>
                            <div className="p-2">
                                <span style={{ fontSize: "9.5px", textTransform: "uppercase", color: "#555" }}>Customer Details</span>
                                <div className="fw-bold fs-6">{filterData.customerName || "All Customers"}</div>
                                <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
                                    <strong>Customer Code:</strong> {filterData.customerCode || "N/A"}<br />
                                    <strong>Branch:</strong> {filterData.branch || "All Branches"}
                                </div>
                            </div>
                        </td>

                        {/* Filter Input Details (Right Box) */}
                        <td style={{ width: "48%", padding: 0, verticalAlign: "top" }}>
                            <div className="row m-0 border-bottom border-dark" style={{ minHeight: "44px" }}>
                                <div className="col-6 p-2 border-end border-dark">
                                    <div className="fw-bold" style={{ fontSize: "10.5px" }}>Financial Year:</div>
                                    <div style={{ fontSize: "11px" }}>{filterData.financialYear || "-"}</div>
                                </div>
                                <div className="col-6 p-2">
                                    <div className="fw-bold" style={{ fontSize: "10.5px" }}>Currency:</div>
                                    <div style={{ fontSize: "11px" }}>{filterData.currency || "INR"}</div>
                                </div>
                            </div>

                            <div className="row m-0 border-bottom border-dark" style={{ minHeight: "44px" }}>
                                <div className="col-6 p-2 border-end border-dark">
                                    <div className="fw-bold" style={{ fontSize: "10.5px" }}>From Date:</div>
                                    <div style={{ fontSize: "11px" }}>{formatDate(filterData.fromDate)}</div>
                                </div>
                                <div className="col-6 p-2">
                                    <div className="fw-bold" style={{ fontSize: "10.5px" }}>To Date:</div>
                                    <div style={{ fontSize: "11px" }}>{formatDate(filterData.toDate)}</div>
                                </div>
                            </div>

                            <div className="row m-0 border-bottom border-dark" style={{ minHeight: "44px" }}>
                                <div className="col-6 p-2 border-end border-dark">
                                    <div className="fw-bold" style={{ fontSize: "10.5px" }}>Voucher Type:</div>
                                    <div style={{ fontSize: "11px" }}>{filterData.voucherType || "All"}</div>
                                </div>
                                <div className="col-6 p-2">
                                    <div className="fw-bold" style={{ fontSize: "10.5px" }}>Status:</div>
                                    <div style={{ fontSize: "11px" }}>{filterData.status || "Posted"}</div>
                                </div>
                            </div>

                            <div className="p-2" style={{ minHeight: "36px" }}>
                                <div className="fw-bold" style={{ fontSize: "10.5px" }}>Statement Print Date:</div>
                                <div style={{ fontSize: "11px" }}>{formatDate(new Date())}</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );

    return (
        <div className="template3-container">
            {/* Top Toolbar (Hidden automatically when printing) */}
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light border rounded d-print-none">
                <div>
                    <h5 className="mb-0 fw-bold">Customer Ledger Print Preview</h5>
                    <small className="text-muted">Review statement pages before printing or exporting to PDF</small>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary px-3 py-1"
                        onClick={() => window.print()}
                    >
                        <i className="fa-solid fa-print me-1"></i> Print / Save as PDF
                    </button>
                    <button
                        className="btn btn-outline-secondary px-3 py-1"
                        onClick={() => window.close()}
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Printable Document Pages */}
            {itemPages.map((pageRows, pageIndex) => {
                const isLastPage = pageIndex === itemPages.length - 1;

                return (
                    <div key={`ledger-page-${pageIndex}`} className="invoice-page custom-text mb-4">
                        <div className="invoice-body-wrapper">
                            {/* Filter and Company Header Box */}
                            {renderHeader()}

                            {/* Transactions Table (Mirroring AG Grid) */}
                            <table className="invoiceTable w-100 border-top-0" style={{ tableLayout: "fixed" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "6%", textAlign: "center" }}>S.No</th>
                                        <th style={{ width: "11%", textAlign: "center" }}>Date</th>
                                        <th style={{ width: "14%", textAlign: "center" }}>Voucher No.</th>
                                        <th style={{ width: "13%" }}>Type</th>
                                        <th style={{ width: "13%" }}>Ref No.</th>
                                        <th style={{ width: "21%" }}>Description</th>
                                        <th style={{ width: "11%", textAlign: "right" }}>Debit (₹)</th>
                                        <th style={{ width: "11%", textAlign: "right" }}>Credit (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.length > 0 ? (
                                        pageRows.map((row, idx) => (
                                            <tr key={idx}>
                                                <td style={{ textAlign: "center" }}>
                                                    {row.s_no || pageIndex * ITEMS_PER_PAGE + idx + 1}
                                                </td>
                                                <td style={{ textAlign: "center" }}>{formatDate(row.date)}</td>
                                                <td style={{ textAlign: "center", fontWeight: "600" }}>{row.voucher_no || "-"}</td>
                                                <td>{row.type || "-"}</td>
                                                <td>{row.reference_no || "-"}</td>
                                                <td style={{ wordBreak: "break-word" }}>{row.description || "-"}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    {row.debit > 0 ? formatCurrency(row.debit) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    {row.credit > 0 ? formatCurrency(row.credit) : "-"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4 text-muted">
                                                No ledger transactions found for this period.
                                            </td>
                                        </tr>
                                    )}

                                    {/* Subtotal / Grand Total row on the final page */}
                                    {isLastPage && (
                                        <tr style={{ backgroundColor: "#f8f9fa", borderTop: "2px solid #000" }}>
                                            <td colSpan="6" style={{ textAlign: "right", fontWeight: "bold" }}>
                                                Total
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: "bold" }}>
                                                {formatCurrency(totalDebit)}
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: "bold" }}>
                                                {formatCurrency(totalCredit)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Summary Footer on the last page */}
                            {isLastPage ? (
                                <>
                                    <div className="d-flex justify-content-between border border-top-0 border-dark px-3 py-2 fw-bold bg-light">
                                        <span>Closing Balance</span>
                                        <span className="fs-6">₹ {closingBalance}</span>
                                    </div>

                                    {/* Metrics / KPI Bar if available */}
                                    {summaryMetrics && (
                                        <div className="row m-0 border border-top-0 border-dark p-2" style={{ fontSize: "10.5px" }}>
                                            <div className="col-4 border-end border-dark">
                                                <strong>Opening Balance:</strong> ₹ {summaryMetrics.openingBalance || "0.00"}
                                            </div>
                                            <div className="col-4 border-end border-dark">
                                                <strong>Total Invoiced:</strong> ₹ {summaryMetrics.totalInvoiced || formatCurrency(totalDebit)}
                                            </div>
                                            <div className="col-4">
                                                <strong>Total Receipts:</strong> ₹ {summaryMetrics.totalReceipts || formatCurrency(totalCredit)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sign-off and Verification Footer */}
                                    <div className="row m-0 border border-top-0 border-dark">
                                        <div className="col-7 border-end border-dark p-2" style={{ fontSize: "10px" }}>
                                            <strong>Note:</strong><br />
                                            1. Please examine this ledger statement immediately upon receipt.<br />
                                            2. If no discrepancies are reported within 15 days, the balance will be considered confirmed.
                                        </div>
                                        <div className="col-5 p-2 d-flex flex-column justify-content-between text-end" style={{ fontSize: "10.5px", minHeight: "65px" }}>
                                            <div>for <strong>{filterData.companyName}</strong></div>
                                            <div className="mt-4">Authorised Signatory</div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="invoice-continued-area border border-top-0 border-dark p-1 text-center text-muted fst-italic" style={{ fontSize: "10px" }}>
                                    continued on next page ...
                                </div>
                            )}
                        </div>

                        {/* Page Number Footer */}
                        <div className="invoice-page-footer text-center border-top pt-1 mt-2" style={{ fontSize: "10px", color: "#666" }}>
                            This is a Computer Generated Customer Ledger Statement &nbsp;|&nbsp; Page {pageIndex + 1} of {totalPages}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CustomerLedgerPrint;
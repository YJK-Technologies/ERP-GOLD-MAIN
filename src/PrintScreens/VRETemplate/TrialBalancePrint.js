import React, { useEffect, useState } from "react";
import "./InvoicePrint.css"; 
import LZString from "lz-string";

const TrialBalancePrint = () => {
    const [filterData, setFilterData] = useState(null);
    const [tbRows, setTbRows] = useState([]);
    const [summaryMetrics, setSummaryMetrics] = useState(null);

    // Date formatter helper (DD/MM/YYYY)[cite: 4]
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; 
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Currency formatter (en-IN 2 decimals)[cite: 4]
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
                const raw = localStorage.getItem(key);
                if (!raw) return null;

                try {
                    // Must match the UTF16 compression format used during save[cite: 4]
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

            const filters = getStoredData("TrialBalanceFilters");
            const rows = getStoredData("TrialBalanceRows");
            const metrics = getStoredData("TrialBalanceMetrics");

            if (filters) {
                setFilterData(filters);
            } else {
                // Fallback default values if opened directly[cite: 4]
                setFilterData({
                    companyName: sessionStorage.getItem("selectedCompanyName") || "YJK Technologies",
                    companyAddress: sessionStorage.getItem("selectedCompanyAddress") || "Thadaperumbakkam, Ponneri High Road",
                    companyCity: sessionStorage.getItem("selectedCompanyCity") || "Tiruvallur",
                    companyPincode: sessionStorage.getItem("selectedCompanyPincode") || "601204",
                    companyGst: sessionStorage.getItem("selectedCompanyGst") || "33AAAAA0000A1Z5",
                    companyContact: sessionStorage.getItem("selectedCompanyContact") || "+91-99445 31549",
                    financialYear: "2026 - 2027",
                    currency: "INR",
                    fromDate: "2026-04-01",
                    toDate: "2026-10-31",
                    branch: "All Branches",
                    ledgerType: "All Ledgers",
                    accountGroup: "All Groups",
                    costCentre: "All Cost Centres"
                });
            }

            if (rows && Array.isArray(rows)) {
                // Filter out any virtual AG Grid total row that was added dynamically[cite: 4]
                const sanitizedRows = rows.filter((r) => !r.isTotalRow);
                setTbRows(sanitizedRows);
            } else {
                setTbRows([]);
            }

            if (metrics) {
                setSummaryMetrics(metrics);
            }
        } catch (err) {
            console.error("Error reading trial balance print data:", err);
        }
    }, []);

    if (!filterData) {
        return <div className="p-4 text-center">Loading Trial Balance Statement...</div>;
    }

    // Calculate Totals[cite: 4]
    const totalOpDebit = tbRows.reduce((sum, item) => sum + (parseFloat(item.op_debit) || 0), 0);
    const totalOpCredit = tbRows.reduce((sum, item) => sum + (parseFloat(item.op_credit) || 0), 0);
    const totalPerDebit = tbRows.reduce((sum, item) => sum + (parseFloat(item.per_debit) || 0), 0);
    const totalPerCredit = tbRows.reduce((sum, item) => sum + (parseFloat(item.per_credit) || 0), 0);
    const totalClDebit = tbRows.reduce((sum, item) => sum + (parseFloat(item.cl_debit) || 0), 0);
    const totalClCredit = tbRows.reduce((sum, item) => sum + (parseFloat(item.cl_credit) || 0), 0);
    const difference = totalClDebit - totalClCredit;

    // Multi-page pagination calculation (rows per page)[cite: 4]
    const ITEMS_PER_PAGE = 25; // Increased slightly as TB rows are generally single-line
    const itemPages = [];
    if (tbRows.length === 0) {
        itemPages.push([]);
    } else {
        for (let i = 0; i < tbRows.length; i += ITEMS_PER_PAGE) {
            itemPages.push(tbRows.slice(i, i + ITEMS_PER_PAGE));
        }
    }

    const totalPages = itemPages.length;

    // Header rendering
    const renderHeader = () => (
        <>
            <div className="text-center fw-bold fs-6 py-1 border border-bottom-0 border-dark text-uppercase bg-light">
                Trial Balance Report
            </div>
            <table className="invoice-header-table border border-dark w-100" style={{ tableLayout: 'fixed' }}>
                <tbody>
                    {/* ROW 1: Company & Report Details Side-by-Side */}
                    <tr>
                        {/* Company Details (Left) */}
                        <td style={{ width: "50%", borderRight: "1px solid black", verticalAlign: "top" }} className="px-2 py-1">
                            <div className="fw-bold text-uppercase mb-1" style={{ fontSize: "14px" }}>
                                {filterData.companyName}
                            </div>
                        </td>

                        {/* Report Details (Right) */}
                        <td style={{ width: "50%", verticalAlign: "top" }} className="px-2 py-1">
                            <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#555", fontWeight: "bold" }}>
                                Report Details
                            </span>
                            <div style={{ fontSize: "11px", lineHeight: "1.3", marginTop: "4px" }}>
                                <strong>Branch:</strong> {filterData.branch || "All Branches"}<br />
                                <strong>Ledger Type:</strong> {filterData.ledgerType || "All Ledgers"}<br />
                                <strong>Group:</strong> {filterData.accountGroup || "All Groups"}<br />
                                <strong>Cost Centre:</strong> {filterData.costCentre || "All Cost Centres"}
                            </div>
                        </td>
                    </tr>

                    {/* ROW 2: Primary Filters */}
                    <tr className="border-top border-dark">
                        <td colSpan="2" className="p-0">
                            <div className="d-flex w-100 text-center" style={{ fontSize: "11px" }}>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Fin. Year</div>
                                    <div className="fw-bold">{filterData.financialYear || "-"}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Ledger Type</div>
                                    <div className="fw-bold">{filterData.ledgerType || "All"}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>From Date</div>
                                    <div className="fw-bold">{formatDate(filterData.fromDate)}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>To Date</div>
                                    <div className="fw-bold">{formatDate(filterData.toDate)}</div>
                                </div>
                                {/* <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Currency</div>
                                    <div className="fw-bold">{filterData.currency || "INR"}</div>
                                </div> */}
                                <div className="flex-fill px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Print Date</div>
                                    <div className="fw-bold">{formatDate(new Date())}</div>
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* ROW 3: Secondary Filters & Account Details */}
                    <tr className="border-top border-dark">
                        <td colSpan="2" className="p-0">
                            <div className="d-flex w-100 text-center" style={{ fontSize: "11px" }}>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Acct From</div>
                                    <div className="fw-bold">{filterData.accountFrom || "All"}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Acct To</div>
                                    <div className="fw-bold">{filterData.accountTo || "All"}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Account Group</div>
                                    <div className="fw-bold">{filterData.accountGroup || "All Groups"}</div>
                                </div>
                                <div className="flex-fill px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Cost Centre</div>
                                    <div className="fw-bold">{filterData.costCentre || "All Cost Centres"}</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );

    return (
        <div className="template3-container">
            {/* Printable Document Pages[cite: 4] */}
            {itemPages.map((pageRows, pageIndex) => {
                const isLastPage = pageIndex === itemPages.length - 1;

                return (
                    <div key={`tb-page-${pageIndex}`} className="invoice-page custom-text mb-4">
                        <div className="invoice-body-wrapper">
                            {/* Filter and Company Header Box[cite: 4] */}
                            {renderHeader()}

                            {/* Transactions Table[cite: 4] */}
                            <table className="invoiceTable w-100 border-top-0" style={{ tableLayout: "fixed", fontSize: "10px" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "4%", textAlign: "center" }}>S.No</th>
                                        <th style={{ width: "8%", textAlign: "center" }}>Code</th>
                                        <th style={{ width: "18%" }}>Account Name</th>
                                        <th style={{ width: "10%" }}>Group</th>
                                        <th style={{ width: "10%", textAlign: "center" }}>Op. Debit</th>
                                        <th style={{ width: "10%", textAlign: "center" }}>Op. Credit</th>
                                        <th style={{ width: "10%", textAlign: "center" }}>Per. Debit</th>
                                        <th style={{ width: "10%", textAlign: "center" }}>Per. Credit</th>
                                        <th style={{ width: "10%", textAlign: "center" }}>Cl. Debit</th>
                                        <th style={{ width: "10%", textAlign: "center" }}>Cl. Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.length > 0 ? (
                                        pageRows.map((row, idx) => (
                                            <tr key={idx}>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "3px", paddingBottom: "3px" }}>
                                                    {row.s_no || pageIndex * ITEMS_PER_PAGE + idx + 1}
                                                </td>
                                                <td style={{ textAlign: "center", borderBottom: "none", borderTop: "none", paddingTop: "3px", paddingBottom: "3px" }}>
                                                    {row.account_code || "-"}
                                                </td>
                                                <td style={{ fontWeight: "600", wordBreak: "break-word", borderBottom: "none", borderTop: "none", paddingTop: "3px", paddingBottom: "3px" }}>
                                                    {row.account_name || "-"}
                                                </td>
                                                <td style={{ borderBottom: "none", borderTop: "none", paddingTop: "3px", paddingBottom: "3px" }}>
                                                    {row.account_group || "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "3px", paddingBottom: "3px" }}>
                                                    {row.op_debit > 0 ? formatCurrency(row.op_debit) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "3px", paddingBottom: "3px" }}>
                                                    {row.op_credit > 0 ? formatCurrency(row.op_credit) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "3px", paddingBottom: "3px" }}>
                                                    {row.per_debit > 0 ? formatCurrency(row.per_debit) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "3px", paddingBottom: "3px" }}>
                                                    {row.per_credit > 0 ? formatCurrency(row.per_credit) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "3px", paddingBottom: "3px" }}>
                                                    {row.cl_debit > 0 ? formatCurrency(row.cl_debit) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "3px", paddingBottom: "3px" }}>
                                                    {row.cl_credit > 0 ? formatCurrency(row.cl_credit) : "-"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="text-center py-4 text-muted">
                                                No ledger accounts found for this period.
                                            </td>
                                        </tr>
                                    )}

                                    {/* Subtotal / Grand Total row on the final page[cite: 4] */}
                                    {isLastPage && (
                                        <tr style={{ backgroundColor: "#f8f9fa", borderTop: "2px solid #000" }}>
                                            <td colSpan="4" style={{ textAlign: "right", fontWeight: "bold" }}>
                                                Total (₹)
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: "bold" }}>{formatCurrency(totalOpDebit)}</td>
                                            <td style={{ textAlign: "right", fontWeight: "bold" }}>{formatCurrency(totalOpCredit)}</td>
                                            <td style={{ textAlign: "right", fontWeight: "bold" }}>{formatCurrency(totalPerDebit)}</td>
                                            <td style={{ textAlign: "right", fontWeight: "bold" }}>{formatCurrency(totalPerCredit)}</td>
                                            <td style={{ textAlign: "right", fontWeight: "bold" }}>{formatCurrency(totalClDebit)}</td>
                                            <td style={{ textAlign: "right", fontWeight: "bold" }}>{formatCurrency(totalClCredit)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Summary Footer on the last page[cite: 4] */}
                            {isLastPage ? (
                                <div className={`d-flex justify-content-between border border-top-0 border-dark px-3 py-2 fw-bold ${difference === 0 ? 'bg-light text-success' : 'bg-light text-danger'}`}>
                                    <span>
                                        {difference === 0 ? (
                                            <><i className="fa-solid fa-circle-check me-2"></i> Balanced</>
                                        ) : (
                                            <><i className="fa-solid fa-triangle-exclamation me-2"></i> Difference Found</>
                                        )}
                                    </span>
                                    <span className="fs-6">Difference: ₹ {formatCurrency(Math.abs(difference))}</span>
                                </div>
                            ) : (
                                <div className="invoice-continued-area border border-top-0 border-dark p-1 text-center text-muted fst-italic" style={{ fontSize: "10px" }}>
                                    continued on next page ...
                                </div>
                            )}
                        </div>

                        {/* Page Number Footer[cite: 4] */}
                        <div className="invoice-page-footer text-center border-top pt-1 mt-2" style={{ fontSize: "10px", color: "#666" }}>
                            This is a Computer Generated Trial Balance Statement &nbsp;|&nbsp; Page {pageIndex + 1} of {totalPages}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TrialBalancePrint;
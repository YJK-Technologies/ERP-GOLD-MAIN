import React, { useEffect, useState } from "react";
import "./InvoicePrint.css";
import LZString from "lz-string";

const VendorLedgerPrint = () => {
    const [filterData, setFilterData] = useState(null);
    const [ledgerRows, setLedgerRows] = useState([]);
    const [summaryMetrics, setSummaryMetrics] = useState(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

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

            const filters = getStoredData("VendorLedgerFilters");
            const rows = getStoredData("VendorLedgerRows");
            const metrics = getStoredData("VendorLedgerMetrics");

            if (filters) {
                setFilterData(filters);
            } else {
                setFilterData({
                    companyName: sessionStorage.getItem("selectedCompanyName"),
                    companyAddress: sessionStorage.getItem("selectedCompanyAddress"),
                    companyCity: sessionStorage.getItem("selectedCompanyCity"),
                    companyPincode: sessionStorage.getItem("selectedCompanyPincode"),
                    companyGst: sessionStorage.getItem("selectedCompanyGst"),
                    companyContact: sessionStorage.getItem("selectedCompanyContact"),
                    financialYear: "",
                    vendorCode: "",
                    vendorName: "",
                    currency: "",
                    fromDate: "",
                    toDate: "",
                    branch: "",
                    voucherType: "",
                    status: "",
                });
            }

            if (rows && Array.isArray(rows)) {
                const sanitizedRows = rows.filter((r) => !r.isTotalRow);
                setLedgerRows(sanitizedRows);
            } else {
                setLedgerRows([]);
            }

            if (metrics) {
                setSummaryMetrics(metrics);
            }
        } catch (err) {
            console.error("Error reading vendor ledger print data:", err);
        }
    }, []);

    if (!filterData) {
        return <div className="p-4 text-center">Loading Vendor Ledger Statement...</div>;
    }

    const totalDebit = ledgerRows.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
    const totalCredit = ledgerRows.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
    const closingBalance = ledgerRows.length > 0 ? ledgerRows[ledgerRows.length - 1].balance : "0.00";

    const ITEMS_PER_PAGE = 20;
    const itemPages = [];
    if (ledgerRows.length === 0) {
        itemPages.push([]);
    } else {
        for (let i = 0; i < ledgerRows.length; i += ITEMS_PER_PAGE) {
            itemPages.push(ledgerRows.slice(i, i + ITEMS_PER_PAGE));
        }
    }

    const totalPages = itemPages.length;

    const renderHeader = () => (
        <>
            <div className="text-center fw-bold fs-6 py-1 border border-bottom-0 border-dark text-uppercase bg-light">
                Vendor Ledger Statement
            </div>
            <table className="invoice-header-table border border-dark w-100" style={{ tableLayout: 'fixed' }}>
                <tbody>
                    <tr>
                        <td style={{ width: "50%", borderRight: "1px solid black", verticalAlign: "top" }} className="px-2 py-1">
                            <div className="fw-bold text-uppercase mb-1" style={{ fontSize: "14px" }}>
                                {filterData.companyName}
                            </div>
                        </td>

                        <td style={{ width: "50%", verticalAlign: "top" }} className="px-2 py-1">
                            <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#555", fontWeight: "bold" }}>
                                Vendor Details
                            </span>
                            <div className="fw-bold" style={{ fontSize: "13px", margin: "2px 0" }}>
                                {filterData.vendorName || "All Vendors"}
                            </div>
                            <div style={{ fontSize: "11px", lineHeight: "1.2" }}>
                                <strong>Code:</strong> {filterData.vendorCode || "N/A"}<br />
                                <strong>Branch:</strong> {filterData.branch || "All Branches"}
                            </div>
                        </td>
                    </tr>

                    <tr className="border-top border-dark">
                        <td colSpan="2" className="p-0">
                            <div className="d-flex w-100 text-center" style={{ fontSize: "11px" }}>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Fin. Year</div>
                                    <div className="fw-bold">{filterData.financialYear || "-"}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Currency</div>
                                    <div className="fw-bold">{filterData.currency || "INR"}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>From Date</div>
                                    <div className="fw-bold">{formatDate(filterData.fromDate)}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>To Date</div>
                                    <div className="fw-bold">{formatDate(filterData.toDate)}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Type</div>
                                    <div className="fw-bold">{filterData.voucherType || "All"}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Status</div>
                                    <div className="fw-bold">{filterData.status || "Posted"}</div>
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

    return (
        <div className="template3-container">
            {itemPages.map((pageRows, pageIndex) => {
                const isLastPage = pageIndex === itemPages.length - 1;

                return (
                    <div key={`ledger-page-${pageIndex}`} className="invoice-page custom-text mb-4">
                        <div className="invoice-body-wrapper">
                            {renderHeader()}

                            <table className="invoiceTable w-100 border-top-0" style={{ tableLayout: "fixed" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "5%", textAlign: "center" }}>S.No</th>
                                        <th style={{ width: "11%", textAlign: "center" }}>Date</th>
                                        <th style={{ width: "15%", textAlign: "center" }}>Voucher No.</th>
                                        <th style={{ width: "13%" }}>Type</th>
                                        <th style={{ width: "13%" }}>Ref No.</th>
                                        <th style={{ width: "21%" }}>Description</th>
                                        <th style={{ width: "11%", textAlign: "center" }}>Debit Amount</th>
                                        <th style={{ width: "11%", textAlign: "center" }}>Credit Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.length > 0 ? (
                                        pageRows.map((row, idx) => (
                                            <tr key={idx}>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.s_no || pageIndex * ITEMS_PER_PAGE + idx + 1}
                                                </td>
                                                <td style={{ textAlign: "center", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {formatDate(row.date)}
                                                </td>
                                                <td style={{ textAlign: "left", fontWeight: "600", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.voucher_no || "-"}
                                                </td>
                                                <td style={{ borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.type || "-"}
                                                </td>
                                                <td style={{ borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.reference_no || "-"}
                                                </td>
                                                <td style={{ wordBreak: "break-word", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.description || "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.debit > 0 ? formatCurrency(row.debit) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
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

                            {isLastPage ? (
                                <>
                                    <div className="d-flex justify-content-between border border-top-0 border-dark px-3 py-2 fw-bold bg-light">
                                        <span>Closing Balance</span>
                                        <span className="fs-6">{closingBalance}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="invoice-continued-area border border-top-0 border-dark p-1 text-center text-muted fst-italic" style={{ fontSize: "10px" }}>
                                    continued on next page ...
                                </div>
                            )}
                        </div>

                        <div className="invoice-page-footer text-center border-top pt-1 mt-2" style={{ fontSize: "10px", color: "#666" }}>
                            This is a Computer Generated Vendor Ledger Statement &nbsp;|&nbsp; Page {pageIndex + 1} of {totalPages}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default VendorLedgerPrint;
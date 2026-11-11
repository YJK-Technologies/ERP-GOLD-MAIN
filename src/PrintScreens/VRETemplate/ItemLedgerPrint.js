import React, { useEffect, useState } from "react";
import "./InvoicePrint.css"; 
import LZString from "lz-string";

const ItemLedgerPrint = () => {
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
        return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatQty = (val) => {
        if (val === null || val === undefined || val === "") return "-";
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        return num.toFixed(3);
    };

    useEffect(() => {
        try {
            const getStoredData = (key) => {
                const raw = localStorage.getItem(key);
                if (!raw) return null;
                try {
                    const decompressed = LZString.decompressFromUTF16(raw);
                    return decompressed ? JSON.parse(decompressed) : JSON.parse(raw);
                } catch (err) {
                    return null;
                }
            };

            const filters = getStoredData("ItemLedgerFilters");
            const rows = getStoredData("ItemLedgerRows");
            const metrics = getStoredData("ItemLedgerMetrics");

            if (filters) {
                setFilterData(filters);
            } else {
                setFilterData({
                    companyName: sessionStorage.getItem("selectedCompanyName") || "Company Name",
                    warehouse: "All",
                    itemCode: "All",
                    category: "All",
                    group: "All",
                    batchNo: "All",
                    serialNo: "All",
                    documentNo: "All",
                    fromDate: "",
                    toDate: "",
                    transactionType: "All",
                    status: "Posted",
                    showZeroQty: "No"
                });
            }

            if (rows && Array.isArray(rows)) {
                setLedgerRows(rows.filter((r) => !r.isTotalRow));
            } else {
                setLedgerRows([]);
            }

            if (metrics) {
                setSummaryMetrics(metrics);
            }
        } catch (err) {
            console.error("Error reading item ledger print data:", err);
        }
    }, []);

    if (!filterData) {
        return <div className="p-4 text-center">Loading Item Ledger Statement...</div>;
    }

    // --- CALCULATE BOTTOM TOTALS ---
    const totalInQty = ledgerRows.reduce((sum, item) => sum + (parseFloat(item.inQty) || 0), 0);
    const totalOutQty = ledgerRows.reduce((sum, item) => sum + (parseFloat(item.outQty) || 0), 0);
    const totalInValue = ledgerRows.reduce((sum, item) => sum + (parseFloat(item.inValue) || 0), 0);
    const totalOutValue = ledgerRows.reduce((sum, item) => sum + (parseFloat(item.outValue) || 0), 0);
    
    // Closing balances are derived from the very last transaction row
    const closingBalQty = ledgerRows.length > 0 ? ledgerRows[ledgerRows.length - 1].balanceQty : 0;
    const closingBalValue = ledgerRows.length > 0 ? ledgerRows[ledgerRows.length - 1].balanceValue : 0;

    // Pagination logic
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
                Item Ledger Analysis
            </div>
            <table className="invoice-header-table border border-dark w-100" style={{ tableLayout: 'fixed' }}>
                <tbody>
                    {/* --- TOP ROW: Company Name & Item Details (Height Reduced) --- */}
                    <tr>
                        <td className="px-2 py-1" style={{ width: "50%", borderRight: "1px solid black", verticalAlign: "middle" }}>
                            <div style={{ fontSize: "9px", textTransform: "uppercase", color: "#555", fontWeight: "bold", lineHeight: "1" }}>Company Details</div>
                            <div className="fw-bold text-uppercase mt-1" style={{ fontSize: "13px", lineHeight: "1" }}>{filterData.companyName}</div>
                        </td>
                        <td className="px-2 py-1 text-end" style={{ width: "50%", verticalAlign: "middle" }}>
                            <div style={{ fontSize: "9px", textTransform: "uppercase", color: "#555", fontWeight: "bold", lineHeight: "1" }}>Item Details</div>
                            <div className="fw-bold mt-1" style={{ fontSize: "11px", lineHeight: "1" }}>
                                Code: {filterData.itemCode} &nbsp;|&nbsp; Category: {filterData.category}
                            </div>
                        </td>
                    </tr>

                    {/* --- BOX ROW 1: Warehouse, Item Code, Category, Group, Batch, Serial --- */}
                    <tr className="border-top border-dark">
                        <td colSpan="2" className="p-0">
                            <div className="d-flex w-100 text-center" style={{ fontSize: "11px" }}>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Warehouse</div>
                                    <div className="fw-bold text-truncate">{filterData.warehouse}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Item Code</div>
                                    <div className="fw-bold text-truncate">{filterData.itemCode}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Category</div>
                                    <div className="fw-bold text-truncate">{filterData.category}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Group</div>
                                    <div className="fw-bold text-truncate">{filterData.group}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Batch No.</div>
                                    <div className="fw-bold text-truncate">{filterData.batchNo}</div>
                                </div>
                                <div className="flex-fill px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Serial No.</div>
                                    <div className="fw-bold text-truncate">{filterData.serialNo}</div>
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* --- BOX ROW 2: Document No, From Date, To Date, Txn Type, Status, Print Date --- */}
                    <tr className="border-top border-dark">
                        <td colSpan="2" className="p-0">
                            <div className="d-flex w-100 text-center" style={{ fontSize: "11px" }}>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Document No.</div>
                                    <div className="fw-bold text-truncate">{filterData.documentNo}</div>
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
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Txn Type</div>
                                    <div className="fw-bold text-truncate">{filterData.transactionType}</div>
                                </div>
                                <div className="flex-fill border-end border-dark px-2 py-1">
                                    <div style={{ fontSize: "9px", color: "#555", fontWeight: "bold", textTransform: "uppercase" }}>Status</div>
                                    <div className="fw-bold text-truncate">{filterData.status}</div>
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

                            <table className="invoiceTable w-100 border-top-0" style={{ tableLayout: "fixed", fontSize: "10px" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "3%", textAlign: "center" }}>S.No</th>
                                        <th style={{ width: "7%", textAlign: "center" }}>Date</th>
                                        <th style={{ width: "8%", textAlign: "left" }}>Voucher No.</th>
                                        <th style={{ width: "8%", textAlign: "left" }}>Type</th>
                                        <th style={{ width: "7%", textAlign: "left" }}>Ref</th>
                                        <th style={{ width: "7%", textAlign: "left" }}>Whse</th>
                                        <th style={{ width: "7%", textAlign: "left" }}>Batch</th>
                                        <th style={{ width: "7%", textAlign: "left" }}>Serial</th>
                                        <th style={{ width: "6%", textAlign: "right" }}>In Qty</th>
                                        <th style={{ width: "6%", textAlign: "right" }}>Out Qty</th>
                                        <th style={{ width: "6%", textAlign: "right" }}>Bal Qty</th>
                                        <th style={{ width: "6%", textAlign: "right" }}>Cost (₹)</th>
                                        <th style={{ width: "8%", textAlign: "right" }}>In Val (₹)</th>
                                        <th style={{ width: "8%", textAlign: "right" }}>Out Val (₹)</th>
                                        <th style={{ width: "8%", textAlign: "right" }}>Bal Val (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.length > 0 ? (
                                        pageRows.map((row, idx) => (
                                            <tr key={idx}>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.sno || pageIndex * ITEMS_PER_PAGE + idx + 1}
                                                </td>
                                                <td style={{ textAlign: "center", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {formatDate(row.date)}
                                                </td>
                                                <td style={{ textAlign: "left", fontWeight: "600", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.voucherNo || "-"}
                                                </td>
                                                <td style={{ borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {row.transactionType || "-"}
                                                </td>
                                                <td style={{ textAlign: "left", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {row.reference || "-"}
                                                </td>
                                                <td style={{ textAlign: "left", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {row.warehouse || "-"}
                                                </td>
                                                <td style={{ textAlign: "left", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.batchNo || "-"}
                                                </td>
                                                <td style={{ textAlign: "left", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.serialNo || "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.inQty > 0 ? formatQty(row.inQty) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.outQty > 0 ? formatQty(row.outQty) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px", fontWeight: "600" }}>
                                                    {formatQty(row.balanceQty)}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.unitCost > 0 ? formatCurrency(row.unitCost) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.inValue > 0 ? formatCurrency(row.inValue) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px" }}>
                                                    {row.outValue > 0 ? formatCurrency(row.outValue) : "-"}
                                                </td>
                                                <td style={{ textAlign: "right", borderBottom: "none", borderTop: "none", paddingTop: "2px", paddingBottom: "2px", fontWeight: "600" }}>
                                                    {formatCurrency(row.balanceValue)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="15" className="text-center py-4 text-muted">
                                                No ledger transactions found for this period.
                                            </td>
                                        </tr>
                                    )}

                                    {/* --- BOTTOM ALIGNMENT: Grand Total Row --- */}
                                    {isLastPage && (
                                        <tr style={{ backgroundColor: "#f8f9fa", borderTop: "2px solid #000" }}>
                                            <td colSpan="8" style={{ textAlign: "right", fontWeight: "bold", padding: "4px 8px" }}>
                                                Grand Total
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: "bold", padding: "4px 8px" }}>
                                                {formatQty(totalInQty)}
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: "bold", padding: "4px 8px" }}>
                                                {formatQty(totalOutQty)}
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: "bold", padding: "4px 8px" }}>
                                                {formatQty(closingBalQty)}
                                            </td>
                                            <td style={{ textAlign: "right", padding: "4px 8px" }}>
                                                -
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: "bold", padding: "4px 8px" }}>
                                                {formatCurrency(totalInValue)}
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: "bold", padding: "4px 8px" }}>
                                                {formatCurrency(totalOutValue)}
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: "bold", padding: "4px 8px" }}>
                                                {formatCurrency(closingBalValue)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            
                            {/* --- BOTTOM ALIGNMENT: Closing Balance Footer --- */}
                            {isLastPage ? (
                                <div className="d-flex justify-content-between border border-top-0 border-dark px-3 py-2 fw-bold bg-light">
                                    <span>Closing Stock Balance</span>
                                    <span className="fs-6">
                                        Qty: {formatQty(closingBalQty)} &nbsp;|&nbsp; Value: ₹ {formatCurrency(closingBalValue)}
                                    </span>
                                </div>
                            ) : (
                                <div className="invoice-continued-area border border-top-0 border-dark p-1 text-center text-muted fst-italic" style={{ fontSize: "10px" }}>
                                    continued on next page ...
                                </div>
                            )}
                        </div>

                        <div className="invoice-page-footer text-center border-top pt-1 mt-2" style={{ fontSize: "10px", color: "#666" }}>
                            This is a Computer Generated Item Ledger Statement &nbsp;|&nbsp; Page {pageIndex + 1} of {totalPages}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ItemLedgerPrint;
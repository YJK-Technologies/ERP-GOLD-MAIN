import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css"; // Using alpine to match lighter aesthetic
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BankReconciliation = () => {
    const [gridApi, setGridApi] = useState(null);

    // Mock Data based on the provided snapshot
    const [rowData] = useState([
        {
            date: "2024-10-02", valueDate: "2024-10-02", bankRef: "UTR241002008819", refType: "Automatic",
            narrationTitle: "NEFT CR - WIPRO ENTERPRISES LTD - Q3 S...", party: "Wipro Enterprises Ltd",
            debit: null, credit: "+₹24,50,000.00", balance: "₹1,67,00,000.00",
            erpRef: "INV-REC-2024-8891", status: "Matched"
        },
        {
            date: "2024-10-04", valueDate: "2024-10-04", bankRef: "ACH-DEBIT-99410", refType: "Rule-based",
            narrationTitle: "ACH DR - AIRTEL BROADBAND ENTERPRIS...", party: "Bharti Airtel Ltd",
            debit: "-₹64,900.00", credit: null, balance: "₹1,66,35,100.00",
            erpRef: "PV-2024-44109", status: "Matched"
        },
        {
            date: "2024-10-07", valueDate: "2024-10-08", bankRef: "CHQ-CLG-400912", refType: "Pending",
            narrationTitle: "CHEQUE CLG - ACCENTURE CONSULTING ...", party: "Accenture Solutions Pvt Ltd",
            debit: "-₹8,50,000.00", credit: null, balance: "₹1,57,85,100.00",
            erpRef: "UNASSIGNED", status: "Unmatched"
        },
        {
            date: "2024-10-10", valueDate: "2024-10-10", bankRef: "RTGS2410100984", refType: "Automatic",
            narrationTitle: "RTGS CR - LARSEN & TOUBRO INFRASTRU...", party: "Larsen & Toubro Ltd",
            debit: null, credit: "+₹65,00,000.00", balance: "₹2,22,85,100.00",
            erpRef: "REC-2024-1102", status: "Matched"
        },
        {
            date: "2024-10-13", valueDate: "2024-10-13", bankRef: "TXN-MISMATCH-88", refType: "Manual",
            narrationTitle: "NEFT DR - GODREJ PROPERTIES LEASE RE...", party: "Godrej Properties Ltd",
            debit: "-₹5,43,200.00", credit: null, balance: "₹2,17,41,900.00",
            erpRef: "PV-2024-33891", status: "Exception"
        },
        {
            date: "2024-10-16", valueDate: "2024-10-16", bankRef: "CMS-COLL-77124", refType: "Pending",
            narrationTitle: "CMS CR - UNKNOWN CLIENT CASH / CHEQ...", party: "Unidentified Depositor",
            debit: null, credit: "+₹1,85,000.00", balance: "₹2,19,26,900.00",
            erpRef: "UNASSIGNED", status: "Unmatched"
        }
    ]);

    // Custom Cell Renderers for Ag-Grid to match UI complexity
    const bankRefRenderer = (params) => (
        <div className="lh-sm py-1">
            <div className="fw-bold" style={{ fontSize: "0.75rem" }}><span className="badge bg-light text-dark border">{params.data.bankRef}</span></div>
            <div className="text-muted" style={{ fontSize: "0.65rem" }}>{params.data.refType}</div>
        </div>
    );

    const narrationRenderer = (params) => (
        <div className="lh-sm py-1 text-truncate">
            <div className="fw-bold text-dark" style={{ fontSize: "0.8rem" }}>{params.data.narrationTitle}</div>
            <div className="text-muted" style={{ fontSize: "0.7rem" }}>Party: {params.data.party}</div>
        </div>
    );

    const debitRenderer = (params) => (
        <span className="text-danger fw-semibold">{params.value || "-"}</span>
    );

    const creditRenderer = (params) => (
        <span className="text-success fw-semibold">{params.value || "-"}</span>
    );

    const erpRefRenderer = (params) => {
        if (params.value === "UNASSIGNED") {
            return <span className="badge bg-secondary text-white" style={{ fontSize: "0.65rem" }}>UNASSIGNED</span>;
        }
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: "0.65rem" }}>{params.value}</span>;
    };

    const statusRenderer = (params) => {
        let badgeClass = "";
        if (params.value === "Matched") badgeClass = "bg-success-subtle text-success border border-success";
        else if (params.value === "Unmatched") badgeClass = "bg-warning-subtle text-warning border border-warning";
        else if (params.value === "Exception") badgeClass = "bg-danger-subtle text-danger border border-danger";
        
        return <span className={`badge px-2 py-1 ${badgeClass}`} style={{ fontSize: "0.65rem" }}>{params.value}</span>;
    };

    const actionRenderer = () => (
        <div className="d-flex gap-1 align-items-center justify-content-center pt-1">
            <button className="btn btn-outline-primary btn-sm px-2 py-0" style={{ fontSize: "0.7rem" }}><i className="fa-regular fa-eye"></i> View</button>
            <button className="btn btn-outline-danger btn-sm px-2 py-0" style={{ fontSize: "0.7rem" }}><i className="fa-solid fa-xmark"></i></button>
            <button className="btn btn-light border btn-sm px-1 py-0 text-muted"><i className="fa-solid fa-ellipsis-vertical"></i></button>
        </div>
    );

    const columnDefs = [
        { headerName: "DATE", field: "date", width: 100 },
        { headerName: "VALUE DATE", field: "valueDate", width: 110 },
        { headerName: "BANK REFERENCE", field: "bankRef", width: 160, cellRenderer: bankRefRenderer },
        { headerName: "NARRATION", field: "narrationTitle", flex: 1, cellRenderer: narrationRenderer, minWidth: 250 },
        { headerName: "DEBIT (₹)", field: "debit", width: 120, cellStyle: { textAlign: "right" }, cellRenderer: debitRenderer },
        { headerName: "CREDIT (₹)", field: "credit", width: 130, cellStyle: { textAlign: "right" }, cellRenderer: creditRenderer },
        { headerName: "BALANCE (₹)", field: "balance", width: 140, cellStyle: { textAlign: "right", fontWeight: "600" } },
        { headerName: "ERP REFERENCE", field: "erpRef", width: 150, cellStyle: { textAlign: "center" }, cellRenderer: erpRefRenderer },
        { headerName: "STATUS", field: "status", width: 110, cellStyle: { textAlign: "center" }, cellRenderer: statusRenderer },
        { headerName: "ACTION", field: "action", width: 130, cellStyle: { textAlign: "center" }, cellRenderer: actionRenderer, sortable: false, filter: false },
    ];

    const defaultColDef = { resizable: true, sortable: true };

    const onGridReady = (params) => setGridApi(params.api);

    return (
        <div className="container-fluid Topnav-screen" style={{ backgroundColor: "#f4f7f6", minHeight: "100vh", paddingBottom: "20px" }}>
            <ToastContainer position="top-right" className="toast-design" theme="colored" />

            {/* TOP HEADER */}
            <div className="shadow-sm p-3 bg-white rounded mb-3 mt-2 border">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <h4 align="left" className="purbut m-0 fw-bold text-dark">Bank Reconciliation</h4>
                            <span className="badge bg-primary fs-8">#BR-2024-10-HDFC-01</span>
                            <span className="badge bg-warning-subtle text-warning border border-warning fs-8">In Progress</span>
                        </div>
                        <small className="text-muted d-block">Match bank transactions with General Ledger entries, resolve timing differences & audit variances.</small>
                    </div>
                    <div className="d-flex justify-content-end align-items-center gap-2 purbut">
                        <button className="btn btn-outline-secondary btn-sm me-2">
                            &larr; Upload Another Statement
                        </button>
                    </div>
                </div>
            </div>

            {/* BANK INFO & PROGRESS BAR */}
            <div className="shadow-sm p-3 bg-white rounded mb-3 border">
                <div className="row align-items-center">
                    <div className="col-md-6 d-flex align-items-start gap-3 border-end">
                        <div className="bg-primary text-white p-3 rounded shadow-sm d-flex align-items-center justify-content-center">
                            <i className="fa-solid fa-building-columns fs-4"></i>
                        </div>
                        <div>
                            <h6 className="fw-bold mb-1">HDFC Bank - Corporate Current Account</h6>
                            <p className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                                A/C: <span className="fw-semibold text-dark">50200049219821</span> &bull; IFSC: HDFC0000060 &bull; Nariman Point Branch, Mumbai
                            </p>
                            <div className="d-flex gap-2">
                                <span className="badge bg-light text-dark border"><i className="fa-regular fa-calendar me-1"></i>Period: 01 Oct 2024 to 31 Oct 2024</span>
                                <span className="badge bg-success-subtle text-success border border-success">INR Currency</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 px-4">
                        <div className="d-flex justify-content-between mb-1">
                            <span className="fw-bold" style={{ fontSize: "0.8rem" }}>Reconciliation Progress <span className="badge bg-primary ms-1">85% Completed</span></span>
                            <div className="d-flex gap-3" style={{ fontSize: "0.75rem" }}>
                                <span className="text-success fw-semibold"><i className="fa-regular fa-circle-check"></i> 8 Reconciled</span>
                                <span className="text-warning fw-semibold"><i className="fa-regular fa-clock"></i> 3 Unmatched</span>
                                <span className="text-danger fw-semibold"><i className="fa-solid fa-circle-exclamation"></i> 2 Exceptions</span>
                            </div>
                        </div>
                        <div className="progress" style={{ height: "10px" }}>
                            <div className="progress-bar bg-success" role="progressbar" style={{ width: "85%" }} aria-valuenow="85" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI METRIC CARDS */}
            <div className="row g-3 mb-3">
                {[
                    { label: "OPENING BALANCE", value: "₹1,42,50,000.00", sub: "As of 01 Oct 2024", color: "text-dark", border: "border-secondary-subtle" },
                    { label: "TOTAL CREDITS", value: "+₹2,48,50,000.50", sub: "Inward Remittances & Collections", color: "text-success", border: "border-success-subtle", icon: "fa-arrow-trend-up text-success bg-success-subtle" },
                    { label: "TOTAL DEBITS", value: "-₹2,06,67,500.00", sub: "Disbursements & Vendor Payments", color: "text-danger", border: "border-danger-subtle", icon: "fa-arrow-trend-down text-danger bg-danger-subtle" },
                    { label: "CLOSING BALANCE (BANK)", value: "₹1,84,32,500.50", sub: "Per Bank Passbook / Feed", color: "text-primary", border: "border-primary-subtle" },
                    { label: "RECONCILED BALANCE (ERP)", value: "₹1,84,32,500.50", sub: "Net Variance: ₹0.00", color: "text-dark", border: "border-success-subtle", badge: "Exact Match" }
                ].map((kpi, index) => (
                    <div className="col" key={index}>
                        <div className={`p-3 bg-white rounded shadow-sm border ${kpi.border} h-100 position-relative`}>
                            {kpi.icon && <div className={`position-absolute top-0 end-0 m-2 p-1 rounded-circle d-flex align-items-center justify-content-center ${kpi.icon}`} style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}><i className={`fa-solid ${kpi.icon.split(' ')[0]}`}></i></div>}
                            {kpi.badge && <span className="position-absolute top-0 end-0 m-2 badge bg-success">{kpi.badge}</span>}
                            
                            <h6 className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: "0.65rem" }}>{kpi.label}</h6>
                            <h4 className={`fw-bold mb-1 ${kpi.color}`}>{kpi.value}</h4>
                            <small className="text-muted" style={{ fontSize: "0.7rem" }}>{kpi.sub}</small>
                        </div>
                    </div>
                ))}
            </div>

            {/* TRANSACTIONS GRID SECTION */}
            <div className="shadow-sm p-3 bg-white rounded border">
                
                {/* Tabs & Top Actions */}
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                    <ul className="nav nav-pills gap-3" style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                        <li className="nav-item border-bottom border-primary border-3 pb-1 text-primary cursor-pointer">Transactions <span className="badge bg-primary rounded-pill ms-1">12</span></li>
                        <li className="nav-item pb-1 text-muted cursor-pointer">Unmatched <span className="badge bg-warning-subtle text-dark border rounded-pill ms-1">3</span></li>
                        <li className="nav-item pb-1 text-muted cursor-pointer">Exceptions <span className="badge bg-light text-dark border rounded-pill ms-1">2</span></li>
                        <li className="nav-item pb-1 text-muted cursor-pointer">Reconciled <span className="badge bg-success-subtle text-success border border-success rounded-pill ms-1">8</span></li>
                    </ul>
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary btn-sm fw-bold"><i className="fa-solid fa-wand-magic-sparkles"></i> Auto Match</button>
                        <button className="btn btn-outline-secondary btn-sm"><i className="fa-solid fa-download"></i> Download</button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="row g-2 mb-3 align-items-center">
                    <div className="col-md-3">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" className="form-control" placeholder="Search reference, narration, counterparty..." />
                        </div>
                    </div>
                    <div className="col-md-2">
                        <select className="form-select form-select-sm text-muted">
                            <option>All Statuses</option>
                            <option>Matched</option>
                            <option>Unmatched</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <select className="form-select form-select-sm text-muted">
                            <option>All Transaction Types</option>
                            <option>NEFT</option>
                            <option>RTGS</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <div className="input-group input-group-sm">
                            <input type="date" className="form-control text-muted" placeholder="mm/dd/yyyy" />
                        </div>
                    </div>
                    <div className="col-md-2 text-end">
                        <button className="btn btn-light border btn-sm text-muted w-100"><i className="fa-solid fa-rotate-right"></i> Reset Filters</button>
                    </div>
                </div>

                {/* Ag-Grid Container */}
                <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onGridReady={onGridReady}
                        headerHeight={35}
                        rowHeight={45}
                        suppressCellFocus={true}
                    />
                </div>
                
                {/* Bottom Pagination Info */}
                <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
                    <small className="text-muted">Showing 1 to 6 of 12 items</small>
                    <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary">&lt;</button>
                        <button className="btn btn-primary">1</button>
                        <button className="btn btn-outline-secondary">2</button>
                        <button className="btn btn-outline-secondary">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankReconciliation;
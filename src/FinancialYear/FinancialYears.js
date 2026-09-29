import React from "react";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Financial_YearScreen = () => {
  const rowData = [];

  const columnDefs = [
    { headerName: "Financial_Year_ID", field: "Financial_Year_ID" },
    { headerName: "company_code", field: "company_code" },
    { headerName: "Location_Code", field: "Location_Code" },
    { headerName: "Financial_Year_Code", field: "Financial_Year_Code" },
    { headerName: "Financial_Year_Name", field: "Financial_Year_Name" },
    { headerName: "Start_Date", field: "Start_Date" },
    { headerName: "End_Date", field: "End_Date" },
    { headerName: "Status", field: "Status" },
    { headerName: "Keyfield", field: "Keyfield" }
  ];

  return (
    <div className="container-fluid p-3">
      {/* Header Bar */}
      <div className="d-flex p-3 rounded-2 border border-black justify-content-between align-items-center mb-3 shadow-sm">
        <h2 className="mb-0">Financial_Year</h2>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-success"><i className="bi bi-plus"></i></button>
          <button type="button" className="btn btn-outline-danger"><i className="bi bi-trash"></i></button>
          <button type="button" className="btn btn-outline-primary"><i className="bi bi-pencil"></i></button>
          <button type="button" className="btn btn-outline-dark"><i className="bi bi-printer"></i></button>
        </div>
      </div>

      {/* Filter / Search Controls Section */}
      <div className="card p-3 mb-3 shadow-sm">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Financial_Year_Code</label>
            <input className="form-control" placeholder="Enter Financial_Year_Code" />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Financial_Year_Name</label>
            <input className="form-control" placeholder="Enter Financial_Year_Name" />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Start_Date</label>
            <input type="date" className="form-control" />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">End_Date</label>
            <input type="date" className="form-control" />
          </div>
          <div className="col-md-3 d-flex align-items-end gap-2">
            <button type="button" className="btn btn-outline-primary"><i className="bi bi-search"></i></button>
            <button type="button" className="btn btn-outline-secondary"><i className="bi bi-arrow-clockwise"></i></button>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="card p-2 shadow-sm">
        <div className="ag-theme-alpine" style={{ height: 300 }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      </div>
    </div>
  );
};

export default Financial_YearScreen;
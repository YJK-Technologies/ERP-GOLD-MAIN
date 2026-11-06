// CustomerReceiptPopup.js
import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import LoadingScreen from "./Loading";

const config = require("./Apiconfig");

const columnDefs = [
  {
    headerName: "Receipt No",
    field: "receipt_no",
    minWidth: 190,
    checkboxSelection: true,
  },
  {
    headerName: "Receipt Date",
    field: "receipt_date",
    minWidth: 130,
  },
  {
    headerName: "Customer Code",
    field: "customer_code",
    minWidth: 130,
  },
  {
    headerName: "Receipt Type",
    field: "receipt_type",
    minWidth: 140,
  },
  {
    headerName: "Payment Mode",
    field: "payment_mode",
    minWidth: 130,
  },
  {
    headerName: "Received Amount",
    field: "received_amount",
    minWidth: 150,
    type: "rightAligned",
  },
  {
    headerName: "Status",
    field: "status",
    minWidth: 110,
  },
];

export default function CustomerReceiptPopup({
  open,
  handleClose,
  handleReceiptSelect,
}) {
  const [rowData, setRowData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [receiptNo, setReceiptNo] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [receiptDate, setReceiptDate] = useState("");

  const handleSearch = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/getCustomerReceiptSearchdata`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receipt_no: receiptNo,
            customer_code: customerCode,
            receipt_date: receiptDate,
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            location_code: sessionStorage.getItem("selectedLocationCode"),
          }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();

        setRowData(Array.isArray(searchData) ? searchData : []);
        setSelectedRows([]);

        if (!searchData || searchData.length === 0) {
          toast.warning("Receipt data not found");
        }
      } else if (response.status === 404) {
        setRowData([]);
        setSelectedRows([]);
        toast.warning("Receipt data not found");
      } else {
        const errorResponse = await response.json();
        toast.warning(
          errorResponse.message || "Failed to fetch receipt data"
        );
        setRowData([]);
      }
    } catch (error) {
      console.error("Error fetching receipt data:", error);
      toast.error("Error fetching receipt data");
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    setReceiptNo("");
    setCustomerCode("");
    setReceiptDate("");
    setRowData([]);
    setSelectedRows([]);
  };

  const handleRowSelected = (event) => {
    setSelectedRows(event.api.getSelectedRows());
  };

  const handleConfirm = () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select a Receipt No");
      return;
    }

    handleReceiptSelect(selectedRows[0].receipt_no);
    handleClose();
    handleReload();
  };

  const handleRowDoubleClick = (params) => {
    if (!params.data) return;

    handleReceiptSelect(params.data.receipt_no);
    handleClose();
    handleReload();
  };

  useEffect(() => {
    if (open) {
      handleReload();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div>
      {loading && <LoadingScreen />}

      <div
        className="modal mt-5 Topnav-screen popup popupadj"
        tabIndex="-1"
        role="dialog"
        style={{
          display: "block",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div className="modal-dialog modal-xl ps-5 p-1 pe-5">
          <div className="modal-content">
            <div className="purbut mb-0 d-flex justify-content-between">
              <h1 align="left" className="purbut">
                Customer Receipt Help
              </h1>

              <button
                onClick={handleClose}
                className="purbut btn btn-danger shadow-none rounded-0 h-70 fs-5"
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="row ms-3 me-3">

                <div className="col-md-3 mb-2">
                  <input
                    type="text"
                    className="exp-input-field form-control"
                    placeholder="Receipt No"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearch()
                    }
                    autoComplete="off"
                  />
                </div>

                <div className="col-md-3 mb-2">
                  <input
                    type="text"
                    className="exp-input-field form-control"
                    placeholder="Customer Code"
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearch()
                    }
                    autoComplete="off"
                  />
                </div>

                <div className="col-md-3 mb-2">
                  <input
                    type="date"
                    className="exp-input-field form-control"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                  />
                </div>

                <div className="col-md-3 mb-2 d-flex justify-content-end">
                  <icon
                    className="icon popups-btn"
                    title="Search"
                    onClick={handleSearch}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </icon>

                  <icon
                    className="icon popups-btn"
                    title="Reload"
                    onClick={handleReload}
                  >
                    <i className="fa-solid fa-arrow-rotate-right"></i>
                  </icon>

                  <icon
                    className="icon popups-btn"
                    title="Confirm"
                    onClick={handleConfirm}
                  >
                    <i className="fa-solid fa-check"></i>
                  </icon>
                </div>

              </div>

              <div
                className="ag-theme-alpine"
                style={{ height: "400px", width: "100%" }}
              >
                <AgGridReact
                  rowData={rowData}
                  columnDefs={columnDefs}
                  defaultColDef={{ resizable: true, sortable: true, filter: true }}
                  rowSelection="multiple"
                  pagination={true}
                  onSelectionChanged={handleRowSelected}
                  onRowDoubleClicked={handleRowDoubleClick}
                  headerHeight={28}
                  rowHeight={25}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
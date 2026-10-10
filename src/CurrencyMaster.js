import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import "./App.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import labels from "./Labels"; // Assuming you have this
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showConfirmationToast } from "./ToastConfirmation";
import "./test.css";
import LoadingScreen from "./Loading";

const config = require("./Apiconfig");

function CurrencyMaster() {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Dropdown states
  const [statusdrop, setStatusdrop] = useState([]);
  const [statusgriddrop, setStatusGriddrop] = useState([]);
  
  // Field states for search criteria
  const [Currency_Code, setCurrencyCode] = useState("");
  const [Currency_Name, setCurrencyName] = useState("");
  const [Currency_Symbol, setCurrencySymbol] = useState("");
  const [Decimal_Places, setDecimalPlaces] = useState("");
  const [Currency_Type, setCurrencyType] = useState("");
  const [typeDrop, setTypeDrop] = useState([]);
  const [selectedCurrencyType, setSelectedCurrencyType] = useState("");
  const [Status, setStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  // Footer tracking
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const location = useLocation();

  // Permissions logic
  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || {};
  const currencyPermissions = permissions
    .filter((permission) => permission.screen_type === "Currency")
    .map((permission) => permission.permission_type.toLowerCase());

  useEffect(() => {
    if (location.state?.preservedRowData) {
      setRowData(location.state.preservedRowData);
    }

    if (location.state?.preservedInputs) {
      setCurrencyCode(location.state.preservedInputs.Currency_Code || "");
      setCurrencyName(location.state.preservedInputs.Currency_Name || "");
      setCurrencySymbol(location.state.preservedInputs.Currency_Symbol || "");
      setCurrencyType(location.state.preservedInputs.Currency_Type || "");
      setStatus(location.state.preservedInputs.Status || "");

      if (location.state.preservedInputs.Status) {
        setSelectedStatus({
          label: location.state.preservedInputs.Status,
          value: location.state.preservedInputs.Status,
        });
      }
    }
  }, [location.state]);

    useEffect(() => {
      const company_code = sessionStorage.getItem("selectedCompanyCode");
  
      fetch(`${config.apiBaseUrl}/CurrencyType`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_code }),
      })
        .then((response) => response.json())
        .then((data) => setTypeDrop(Array.isArray(data) ? data : []))
        .catch((error) =>
          console.error("Error fetching Currency Type:", error)
        );
    }, []);
  
    const filteredOptionCurrencyType = typeDrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }));
    
    const handleChangeCurrencyType = (selectedOption) => {
      setSelectedCurrencyType(selectedOption);
      setCurrencyType(selectedOption ? selectedOption.value : "");
    };
  

  // Fetch Status Dropdown
  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((response) => response.json())
      .then((data) => {
        const statusOption = data.map((option) => option.attributedetails_name);
        setStatusGriddrop(statusOption);
        setStatusdrop(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const filteredOptionStatus = [
    { value: "All", label: "All" },
    ...statusdrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    })),
  ];

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : "");
    setHasValueChanged(true);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/Currencysearch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Currency_Code,
          Currency_Name,
          Currency_Symbol,
          Currency_Type,
          Decimal_Places: Decimal_Places !== "" && Decimal_Places !== null ? parseInt(Decimal_Places, 10) : null,
          Status,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          location_code: sessionStorage.getItem("selectedLocationCode"),
        }),
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
      } else if (response.status === 404) {
        toast.warning("Data not found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to search data");
      }
    } catch (error) {
      toast.error("Error fetching search data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearInputFields = () => {
    setCurrencyCode("");
    setCurrencyName("");
    setCurrencySymbol("");
    setCurrencyType("");
    setSelectedStatus("");
    setStatus("");
    setCurrencyType("");
    setSelectedCurrencyType("");
    setDecimalPlaces("");
    setRowData([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return ""; 
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
    }).format(date);
  };

  const handleRowClick = (rowData) => {
    setCreatedBy(rowData.created_by);
    setModifiedBy(rowData.modified_by);
    setCreatedDate(formatDate(rowData.created_date));
    setModifiedDate(formatDate(rowData.modified_date));
  };

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      headerName: "Currency Code",
      field: "Currency_Code",
      cellClass: "ag-link-cell",
      cellStyle: { textAlign: "left" },
      checkboxSelection: true,
      cellEditorParams: { maxLength: 10 },
      cellRenderer: (params) => {
        const handleClick = () => {
          handleNavigateWithRowData(params.data);
        };
        return (
          <span style={{ cursor: "pointer" }} onClick={handleClick}>
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: "Currency Name",
      field: "Currency_Name",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: { maxLength: 150 },
    },
    {
      headerName: "Currency Symbol",
      field: "Currency_Symbol",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: { maxLength: 5 },
    },
    {
      headerName: "Decimal Places",
      field: "Decimal_Places",
      editable: true,
      cellStyle: { textAlign: "right" },
      cellEditorParams: { maxLength: 2 },
      // valueSetter: (params) => {
      //   const newValue = params.newValue?.toString().trim();
      //   const isValid = /^\d*$/.test(newValue);
      //   if (isValid) {
      //     params.data.Decimal_Places = newValue;
      //     return true;
      //   }
      //   return false;
      // }
    },
    {
      headerName: "Currency Type",
      field: "Currency_Type",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: { maxLength: 50 },
    },
    {
      headerName: "Status",
      field: "Status",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: statusgriddrop,
      },
    },
      {
      headerName: "Keyfield",
      field: "Keyfield",
      editable: false,
      hide: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: { maxLength: 150 },
    },
  ];

  const defaultColDef = { resizable: true, wrapText: true };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return;
    }

    const reportData = selectedRows.map((row) => {
      const formatValue = (val) => (val !== undefined && val !== null ? val : "");
      return {
        "Currency Code": formatValue(row.Currency_Code),
        "Currency Name": formatValue(row.Currency_Name),
        "Symbol": formatValue(row.Currency_Symbol),
        "Decimal Places": formatValue(row.Decimal_Places),
        "Type": formatValue(row.Currency_Type),
        "Status": formatValue(row.Status),
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Currency Report</title>");
    reportWindow.document.write("<style>");
    reportWindow.document.write(`
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { color: maroon; text-align: center; font-size: 24px; margin-bottom: 30px; text-decoration: underline; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { padding: 10px; text-align: left; border: 1px solid #ddd; vertical-align: top; }
      th { background-color: maroon; color: white; font-weight: bold; }
      td { background-color: #fdd9b5; }
      tr:nth-child(even) td { background-color: #fff0e1; }
      .report-button { display: block; width: 150px; margin: 20px auto; padding: 10px; background-color: maroon; color: white; border: none; cursor: pointer; font-size: 16px; text-align: center; border-radius: 5px; }
      .report-button:hover { background-color: darkred; }
      @media print { .report-button { display: none; } body { margin: 0; padding: 0; } }
    `);
    reportWindow.document.write("</style></head><body>");
    reportWindow.document.write("<h1><u>Currency Master Information</u></h1>");
    reportWindow.document.write("<table><thead><tr>");
    Object.keys(reportData[0]).forEach((key) => reportWindow.document.write(`<th>${key}</th>`));
    reportWindow.document.write("</tr></thead><tbody>");
    reportData.forEach((row) => {
      reportWindow.document.write("<tr>");
      Object.values(row).forEach((value) => reportWindow.document.write(`<td>${value || ""}</td>`));
      reportWindow.document.write("</tr>");
    });
    reportWindow.document.write("</tbody></table>");
    reportWindow.document.write('<button class="report-button" title="Print" onclick="window.print()">Print</button>');
    reportWindow.document.write("</body></html>");
    reportWindow.document.close();
  };

  const handleNavigateToForm = () => {
    navigate("/CurrencyInput", { state: { mode: "create" } }); 
  };

  const handleNavigateWithRowData = (selectedRow) => {
    navigate("/CurrencyInput", {
      state: {
        mode: "update",
        selectedRow,
        preservedRowData: rowData,
        preservedInputs: { Currency_Code, Currency_Name, Currency_Symbol, Currency_Type, Status },
      },
    });
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.Currency_ID === params.data.Currency_ID
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);
      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  const saveEditedData = async () => {
    const selectedRowsData = editedData.filter((row) =>
      selectedRows.some((selectedRow) => selectedRow.Currency_ID === row.Currency_ID)
    );

    if (selectedRowsData.length === 0) {
      toast.warning("Please select and modify at least one row to update its data");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        try {
          const modified_by = sessionStorage.getItem("selectedUserCode");
          const response = await fetch(`${config.apiBaseUrl}/CurrencyLoopUpdate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": modified_by,
            },
            body: JSON.stringify({ editedData: selectedRowsData }),
          });

          if (response.status === 200) {
            toast.success("Data Updated Successfully", { onClose: () => handleSearch(), autoClose: 1000 });
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to update data");
          }
        } catch (error) {
          toast.error("Error updating data: " + error.message);
        }
      },
      () => toast.info("Data update cancelled.")
    );
  };

  const deleteSelectedRows = async () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select atleast One Row to Delete");
      return;
    }

    const modified_by = sessionStorage.getItem("selectedUserCode");
    const Currency_IDsToDelete = selectedRows.map((row) => row.Currency_ID);

    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/CurrencydeleteData`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Modified-By": modified_by },
            body: JSON.stringify({ Currency_IDs: Currency_IDsToDelete }),
          });

          if (response.ok) {
            toast.success("Data Deleted successfully", { onClose: () => handleSearch(), autoClose: 1000 });
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to delete data");
          }
        } catch (error) {
          toast.error("Error Deleting Data: " + error.message);
        }
      },
      () => toast.info("Data Delete cancelled.")
    );
  };

  const handleKeyDownStatus = async (e) => {
    if (e.key === "Enter" && hasValueChanged) {
      await handleSearch(); 
      setHasValueChanged(false); 
    }
  };

  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      handleRowClick(event.data);
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      <div>
        {loading && <LoadingScreen />}
        <ToastContainer position="top-right" className="toast-design" theme="colored" />
        
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
          <div className=" d-flex justify-content-between ">
            <div class="d-flex justify-content-start">
              <h1 align="left" className="purbut">Currency Master</h1>
            </div>
            
            <div className="d-flex justify-content-end purbut me-3">
              <addbutton className="purbut" onClick={handleNavigateToForm} title="Add">
                <i class="fa-solid fa-user-plus"></i>
              </addbutton>
              <delbutton className="purbut" onClick={deleteSelectedRows} required title="Delete">
                <i class="fa-solid fa-user-minus"></i>
              </delbutton>
              <savebutton className="purbut" onClick={saveEditedData} required title="Update">
                <i class="fa-solid fa-floppy-disk"></i>
              </savebutton>
              <printbutton className="purbut" onClick={generateReport} required title="Generate Report">
                <i class="fa-solid fa-print"></i>
              </printbutton>
            </div>
          </div>
          
          <div class="mobileview">
            <div class="d-flex justify-content-between">
              <div className="d-flex justify-content-start ms-3">
                <h1 align="left" className="h1">Currency Master</h1>
              </div>
              <div class="dropdown mt-1">
                <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fa-solid fa-list"></i>
                </button>
                <ul class="dropdown-menu">
                  <li class="iconbutton d-flex justify-content-center text-success">
                      <icon class="icon" onClick={handleNavigateToForm}><i class="fa-solid fa-user-plus"></i></icon>
                  </li>
                  <li class="iconbutton d-flex justify-content-center text-danger">
                      <icon class="icon" onClick={deleteSelectedRows}><i class="fa-solid fa-user-minus"></i></icon>
                  </li>
                  <li class="iconbutton d-flex justify-content-center text-primary">
                      <icon class="icon" onClick={saveEditedData}><i class="fa-solid fa-floppy-disk"></i></icon>
                  </li>
                  <li class="iconbutton d-flex justify-content-center">
                      <icon class="icon" onClick={generateReport}><i class="fa-solid fa-print"></i></icon>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
        <div className="row ms-4 mb-3 me-4 mt-3">
          
          <div className="col-md-3 form-group">
            <div class="exp-form-floating">
              <label class="exp-form-labels">Currency Code</label>
              <input
                className="exp-input-field form-control"
                type="text"
                placeholder=""
                title="Please fill the Currency Code here"
                value={Currency_Code}
                onChange={(e) => setCurrencyCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                maxLength={10}
              />
            </div>
          </div>
          
          <div className="col-md-3 form-group">
            <div class="exp-form-floating">
              <label class="exp-form-labels">Currency Symbol</label>
              <input
                className="exp-input-field form-control"
                type="text"
                placeholder=""
                title="Please fill the Currency Symbol here"
                value={Currency_Symbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                maxLength={150}
              />
            </div>
          </div>

          <div className="col-md-3 form-group mb-2">
            <div class="exp-form-floating">
              <div class="d-flex justify-content-start">
                <div>
                  <label class="exp-form-labels">Decimal Places</label>
                </div>
              </div>
              <input
                class="exp-input-field form-control"
                type="number"
                title="Please fill the Decimal Places here"
                value={Decimal_Places}
                onChange={(e) => setDecimalPlaces(e.target.value.replace(/\D/g, "").slice(0, 2))}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="col-md-3 form-group mb-2">
            <div class="exp-form-floating">
              <div class="d-flex justify-content-start">
                  <label class="exp-form-labels" >Currency Type</label>
              </div>
              <div title="Select the Currency Type">
              <Select
                value={selectedCurrencyType}
                onChange={handleChangeCurrencyType}
                options={filteredOptionCurrencyType}
                className="exp-input-field"
                placeholder=""
                onKeyDown={handleKeyDownStatus}
                classNamePrefix="react-select"
                isClearable
                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
              />
              </div>
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div class="exp-form-floating">
              <label class="exp-form-labels">Status</label>
              <div title="Select the Status">
                <Select
                  value={selectedStatus}
                  onChange={handleChangeStatus}
                  onKeyDown={handleKeyDownStatus}
                  options={filteredOptionStatus}
                  className="exp-input-field"
                  placeholder=""
                  classNamePrefix="react-select"
                  isClearable
                  styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                />
              </div>
            </div>
          </div>

          <div className="col-md-3 form-group mt-4">
            <div class="exp-form-floating">
              <div class=" d-flex justify-content-center">
                <div class="">
                  <icon className=" text-dark popups-btn fs-6" onClick={handleSearch} required title="Search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </icon>
                </div>
                <div>
                  <icon className=" popups-btn text-dark fs-6" onClick={clearInputFields} required title="Reload">
                    <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                  </icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="ag-theme-alpine" style={{ height: 455, width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            rowSelection="multiple"
            onSelectionChanged={onSelectionChanged}
            pagination={true}
            paginationAutoPageSize={true}
            onRowSelected={onRowSelected}
          />
        </div>
      </div>

      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6">{labels.createdBy}: {createdBy}</p>
            <p className="col-md-6">{labels.createdDate}: {createdDate}</p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6">{labels.modifiedBy}: {modifiedBy}</p>
            <p className="col-md-6">{labels.modifiedDate}: {modifiedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrencyMaster;
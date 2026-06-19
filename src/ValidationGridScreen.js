import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import labels from "./Labels";
import { showConfirmationToast } from './ToastConfirmation';
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

function RoleInfoGrid() {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [validationStatusDrop, setValidationStatusDrop] = useState([]);
  const [companyCode, setCompanyCode] = useState("");
  const [validationStatus, setValidationStatus] = useState("");
  const [screens, setScreens] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");
  const [loading, setLoading] = useState(false);

  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const ValidationGridPermission = permissions
    .filter(permission => permission.screen_type === 'ValidationGrid')
    .map(permission => permission.permission_type.toLowerCase());

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/getKids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((response) => response.json())
      .then((data) => {
        const cityNames = data.map(option => option.attributedetails_name);
        setValidationStatusDrop(cityNames);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/StockSC`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: companyCode,
          Validation_status: validationStatus,
          Screens: screens
        })
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("data fetched successfully")

      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to get data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error updating data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const reloadGridData = () => {
    window.location.reload();
  };

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Company Code",
      field: "company_code",
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 18,
      },
      cellRenderer: (params) => {
        const handleClick = () => {
          handleNavigateWithRowData(params.data);
        };

        return (
          <span
            style={{ cursor: "pointer" }}
            onClick={handleClick}
          >
            {params.value}
          </span>
        );
      },
      valueFormatter: (params) => {
        return params.value ? params.value.toUpperCase() : '';
      },
    },
    {
      headerName: "Validation Status",
      field: "Validation_status",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 50,
      },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: validationStatusDrop,
      },
    },
    {
      headerName: "Screens",
      field: "Screens",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 255,
      },
      valueFormatter: (params) => {
        return params.value ? params.value.toUpperCase() : '';
      },

    },
  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
    flex: 1,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };


  const generateReport = () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return
    };
    const reportData = selectedRows.map((row) => {
      const safeValue = (val) => (val !== undefined && val !== null ? val : '');

      return {
        "Company Code": safeValue(row.company_code),
        "Validation Status": safeValue(row.Validation_status),
        "Screens": safeValue(row.Screens),
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Validation</title>");
    reportWindow.document.write("<style>");
    reportWindow.document.write(`
      body {
          font-family: Arial, sans-serif;
          margin: 20px;
      }
      h1 {
          color: maroon;
          text-align: center;
          font-size: 24px;
          margin-bottom: 30px;
          text-decoration: underline;
      }
      table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
      }
      th, td {
          padding: 10px;
          text-align: left;
          border: 1px solid #ddd;
          vertical-align: top;
      }
      th {
          background-color: maroon;
          color: white;
          font-weight: bold;
      }
      td {
          background-color: #fdd9b5;
      }
      tr:nth-child(even) td {
          background-color: #fff0e1;
      }
      .report-button {
          display: block;
          width: 150px;
          margin: 20px auto;
          padding: 10px;
          background-color: maroon;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 16px;
          text-align: center;
          border-radius: 5px;
      }
      .report-button:hover {
          background-color: darkred;
      }
      @media print {
          .report-button {
              display: none;
          }
          body {
              margin: 0;
              padding: 0;
          }
      }
    `);
    reportWindow.document.write("</style></head><body>");
    reportWindow.document.write("<h1><u>Validation Information</u></h1>");

    // Create table with headers
    reportWindow.document.write("<table><thead><tr>");
    Object.keys(reportData[0]).forEach((key) => {
      reportWindow.document.write(`<th>${key}</th>`);
    });
    reportWindow.document.write("</tr></thead><tbody>");

    // Populate the rows
    reportData.forEach((row) => {
      reportWindow.document.write("<tr>");
      Object.values(row).forEach((value) => {
        reportWindow.document.write(`<td>${value}</td>`);
      });
      reportWindow.document.write("</tr>");
    });

    reportWindow.document.write("</tbody></table>");

    reportWindow.document.write(
      '<button class="report-button" onclick="window.print()">Print</button>'
    );
    reportWindow.document.write("</body></html>");
    reportWindow.document.close();
  };
  const handleNavigateToForm = () => {
    navigate("/Validation", { state: { mode: "create" } }); // Pass selectedRows as props to the Input component
  };
  const handleNavigateWithRowData = (selectedRow) => {
    navigate("/Validation", { state: { mode: "update", selectedRow } })
  }

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  // const onCellValueChanged = (params) => {
  //   const updatedRowData = [...rowData];
  //   const rowIndex = updatedRowData.findIndex(
  //     (row) => row.company_code === params.data.company_code
  //   );
  //   if (rowIndex !== -1) {
  //     updatedRowData[rowIndex][params.colDef.field] = params.newValue;
  //     setRowData(updatedRowData);

  //     setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
  //   }
  // };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.company_code === params.data.company_code
    );

    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      setEditedData((prevData) => {
        const existingIndex = prevData.findIndex(
          (item) => item.company_code === params.data.company_code
        );

        if (existingIndex !== -1) {
          const updatedEdited = [...prevData];
          updatedEdited[existingIndex] = updatedRowData[rowIndex];
          return updatedEdited;
        } else {
          return [...prevData, updatedRowData[rowIndex]];
        }
      });
    }
  };

  const saveEditedData = async () => {
    const selectedRowsData = editedData.filter(row => selectedRows.some(selectedRow => selectedRow.company_code === row.company_code));
    if (selectedRowsData.length === 0) {
      toast.warning("Please select a row to update its data");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {

        try {
          const modified_by = sessionStorage.getItem('selectedUserCode');

          const response = await fetch(`${config.apiBaseUrl}/updateStockVal`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "modified-by": modified_by
            },
            body: JSON.stringify({ editedData: selectedRowsData }),
          });

          if (response.ok) {
            console.log("Data saved successfully!");
            toast.success("Data Updated Successfully!", {
              onClose: () => handleSearch()
            });
            return;

          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert sales data");
          }
        } catch (error) {
          console.error("Error saving data:", error);
          toast.error("Error Updating Data: " + error.message);
        }
      },
      () => {
        toast.info("Data updated cancelled.");
      }
    );
  };

  const deleteSelectedRows = async () => {
    const selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length === 0) {
      toast.warning("Please select atleast One Row to Delete");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {

        try {
          const response = await fetch(`${config.apiBaseUrl}/deleteStockValue`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ StockValueToDelete: selectedRows }),
          });

          if (response.ok) {
            setTimeout(() => {
              toast.success("Data Deleted Successfully")
              handleSearch();
            }, 1000);
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert sales data");
          }
        } catch (error) {
          console.error("Error saving data:", error);
          toast.error("Error Deleting Data: " + error.message);
        }
      },
      () => {
        toast.info("Data Delete cancelled.");
      }
    );
  };


  const formatDate = (dateString) => {
    if (!dateString) return ""; // Return 'N/A' if the date is missing
    const date = new Date(dateString);

    // Format as DD/MM/YYYY
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const handleRowClick = (rowData) => {
    setCreatedBy(rowData.created_by);
    setModifiedBy(rowData.modified_by);
    const formattedCreatedDate = formatDate(rowData.created_date);
    const formattedModifiedDate = formatDate(rowData.modified_date);
    setCreatedDate(formattedCreatedDate);
    setModifiedDate(formattedModifiedDate);
  };

  // Handler for when a row is selected
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
          <div className=" d-flex justify-content-between  ">
            <div class="d-flex justify-content-start">
              <h1 align="left" className="purbut">Validation</h1>
            </div>
            <div className="d-flex justify-content-end purbut me-3">
              {['add', 'all permission'].some(permission => ValidationGridPermission.includes(permission)) && (
                <addbutton className="purbut" onClick={handleNavigateToForm} required title="Add Role">
                  <i class="fa-solid fa-user-plus"></i>
                </addbutton>
              )}
              {['delete', 'all permission'].some(permission => ValidationGridPermission.includes(permission)) && (
                <delbutton className="purbut" onClick={deleteSelectedRows} required title="Delete">
                  <i class="fa-solid fa-user-minus"></i>
                </delbutton>
              )}
              {['update', 'all permission'].some(permission => ValidationGridPermission.includes(permission)) && (
                <savebutton className="purbut" onClick={saveEditedData} required title="Update" >
                  <i class="fa-solid fa-floppy-disk"></i>
                </savebutton>
              )}
              {['all permission', 'view'].some(permission => ValidationGridPermission.includes(permission)) && (
                <printbutton className="purbut" onClick={generateReport} required title="Generate Report" >
                  <i class="fa-solid fa-print"></i>
                </printbutton>
              )}
            </div>
            <div class="mobileview">
              <div class="d-flex justify-content-between ms-0 me-5">
                <div className="">
                  <h1 align="left" className="h1 ms-0 d-flex justify-content-start">Validation</h1>
                </div>
                <div class="dropdown me-5 ms-5" >
                  <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-list"></i>
                  </button>
                  <ul class="dropdown-menu ">
                    <li class="iconbutton d-flex justify-content-center text-success">
                      {['add', 'all permission'].some(permission => ValidationGridPermission.includes(permission)) && (
                        <icon class="icon" onClick={handleNavigateToForm}>
                          <i class="fa-solid fa-user-plus"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-danger">
                      {['delete', 'all permission'].some(permission => ValidationGridPermission.includes(permission)) && (
                        <icon class="icon" onClick={deleteSelectedRows}>
                          <i class="fa-solid fa-user-minus"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-primary ">
                      {['update', 'all permission'].some(permission => ValidationGridPermission.includes(permission)) && (
                        <icon class="icon" onClick={saveEditedData}>
                          <i class="fa-solid fa-floppy-disk"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center ">
                      {['all permission', 'view'].some(permission => ValidationGridPermission.includes(permission)) && (
                        <icon class="icon" onClick={generateReport}>
                          <i class="fa-solid fa-print"></i>
                        </icon>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div className="row ms-4 mt-3 mb-3 me-4">
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="rolid" class="exp-form-labels">Company Code</label>
                <input
                  id="rolid"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the company code here"
                  value={companyCode}
                  maxLength={18}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="rolname" class="exp-form-labels">Validation Status</label>
                <input
                  id="rolname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the validation status here"
                  value={validationStatus}
                  maxLength={50}
                  onChange={(e) => setValidationStatus(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="rolname" class="exp-form-labels">Screens</label>
                <input
                  id="rolname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the screens here"
                  value={screens}
                  maxLength={50}
                  onChange={(e) => setScreens(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="col-md-3 form-group mt-4">
              <div class="exp-form-floating">
                <div class=" d-flex  justify-content-center">
                  <div class=''>
                    <icon className="popups-btn fs-6 p-3" onClick={handleSearch} required title="Search"><i className="fas fa-search"></i></icon>
                  </div>
                  <div>
                    <icon className="popups-btn fs-6 p-3" onClick={reloadGridData} required title="Reload"><FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" /></icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ag-theme-alpine" style={{ height: 520, width: "100%", }}>
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
      </div>
      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6">{labels.createdBy}: {createdBy}</p>
            <p className="col-md-">
              {labels.createdDate}: {createdDate}
            </p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6">
              {labels.modifiedBy}: {modifiedBy}
            </p>
            <p className="col-md-6">
              {labels.modifiedDate}: {modifiedDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleInfoGrid;

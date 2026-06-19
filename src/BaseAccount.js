
import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import "./mobile.css";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import Select from "react-select";
import { showConfirmationToast } from './ToastConfirmation';
import labels from "./Labels";
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

const BaseAccount = () => {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [statusgriddrop, setStatusGriddrop] = useState([]);
  const [status, setStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [base_accgroup_code, setbase_accgroup_code] = useState("");
  const [base_accgroup_name, setbase_accgroup_name] = useState("");
  const [loading, setLoading] = useState(false);

  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");


  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const BAPermissions = permissions
    .filter(permission => permission.screen_type === 'BaseAccount')
    .map(permission => permission.permission_type.toLowerCase());

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((response) => response.json())
      .then((data) => {
        const statusOption = data.map(option => option.attributedetails_name);
        setStatusGriddrop(statusOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : '');
  };

  const handleCompanyNoChange = (event) => {
    setbase_accgroup_code(event.target.value);
  };

  const handleCompanyNameChange = (event) => {
    setbase_accgroup_name(event.target.value);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getsearchdataBase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ base_accgroup_code, base_accgroup_name, status }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log(searchData)
        console.log("data fetched successfully")

      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found")
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
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
      headerName: "Account Code",
      field: "base_accgroup_code",
      cellStyle: { textAlign: "left" },
      checkboxSelection: true,
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

    },
    {
      headerName: "Account Name",
      field: "base_accgroup_name",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Status",
      field: "status",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: statusgriddrop
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
    setGridColumnApi(params.columnApi);
  };


  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      alert("Please select at least one row to generate a report");
      return;
    }

    const reportData = selectedRows.map((row) => {
      const safeValue = (val) => (val !== undefined && val !== null ? val : '');

      return {
        "Account Code": safeValue(row.base_accgroup_code),
        "Account Name": safeValue(row.base_accgroup_name),
        "Status": safeValue(row.status),
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Base Account</title>");
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
    reportWindow.document.write("<h1><u>Base Account Report</u></h1>");

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
    navigate("/AddBaseAccount", { state: { mode: "create" } });
  };
  const handleNavigateWithRowData = (selectedRow) => {
    navigate("/AddBaseAccount", { state: { mode: "update", selectedRow } });
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };


  // Assuming you have a unique identifier for each row, such as 'id'
  // const onCellValueChanged = (params) => {
  //   const updatedRowData = [...rowData];
  //   const rowIndex = updatedRowData.findIndex(
  //     (row) => row.base_accgroup_code === params.data.base_accgroup_code // Use the unique identifier 
  //   );
  //   if (rowIndex !== -1) {
  //     updatedRowData[rowIndex][params.colDef.field] = params.newValue;
  //     setRowData(updatedRowData);

  //     // Add the edited row data to the state
  //     setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
  //   }
  // };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.base_accgroup_code === params.data.base_accgroup_code
    );

    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      setEditedData((prevData) => {
        const existingIndex = prevData.findIndex(
          (item) => item.base_accgroup_code === params.data.base_accgroup_code
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
    const selectedRowsData = editedData.filter(row => selectedRows.some((selectedRow) => selectedRow.base_accgroup_code === row.base_accgroup_code));
    if (selectedRowsData.length === 0) {
      toast.warning("Please select and modify at least one row to update its data")
      return;
    }

    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        try {
          const modified_by = sessionStorage.getItem('selectedUserCode');
          const response = await fetch(`${config.apiBaseUrl}/updateBase`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": modified_by
            },
            body: JSON.stringify({ editedData: selectedRowsData }), // Send only the selected rows for saving
            "modified_by": modified_by
          });
          if (response.status === 200) {
            setTimeout(() => {
              toast.success("Data Updated Successfully")
              handleSearch();
            }, 1000);
            return;
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to update data");
          }
        } catch (error) {
          console.error("Error saving data:", error);
          toast.error("Error Updating Data: " + error.message);
        }
      },
      () => {
        toast.info("Data update cancelled.");
      }
    );
  };



  const deleteSelectedRows = async () => {
    const selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length === 0) {
      toast.warning("Please select atleast One Row to Delete");
      return;
    }

    const modified_by = sessionStorage.getItem('selectedUserCode');
    const company_nosToDelete = selectedRows.map((row) => row.base_accgroup_code);

    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/deleteBaseData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": modified_by
            },
            body: JSON.stringify({ company_nos: company_nosToDelete }),
            "modified_by": modified_by
          });

          if (response.ok) {
            console.log("Rows deleted successfully:", company_nosToDelete);
            setTimeout(() => {
              toast.success("Data Deleted successfully")
              handleSearch();
            }, 1000);
          } else {
            const error = await response.json();
            toast.warning("Failed to delete data" + error.message);
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
    if (!dateString) return " "; // Return 'N/A' if the date is missing
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
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />

      <div >
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div class="d-flex justify-content-between " >
            <div className="d-flex justify-content-start">
              <h1 align="left" class="purbut" >
                Base Account
              </h1>
            </div>
            <div class="d-flex justify-content-end me-3 purbut">
              {['add', 'all permission'].some(permission => BAPermissions.includes(permission)) && (
                <addbutton className="purbut" onClick={handleNavigateToForm}
                  required title="Add Base Account"> <i class="fa-solid fa-user-plus"></i>
                </addbutton>
              )}
              {['delete', 'all permission'].some(permission => BAPermissions.includes(permission)) && (
                <delbutton className="purbut" onClick={deleteSelectedRows} required title="Delete">
                  <i class="fa-solid fa-user-minus"></i>
                </delbutton>
              )}
              {['update', 'all permission'].some(permission => BAPermissions.includes(permission)) && (
                <savebutton className="purbut" onClick={saveEditedData} required title="Update">
                  <i class="fa-solid fa-floppy-disk"></i>
                </savebutton>
              )}
              {['all permission', 'view'].some(permission => BAPermissions.includes(permission)) && (
                <printbutton className="purbut" onClick={generateReport} required title="Generate Report">
                  <i class="fa-solid fa-print"></i>
                </printbutton>
              )}
            </div>
          </div>
          <div className="mobileview">
            <div class="d-flex justify-content-between">
              <div className="">
                <h1 className="h1">
                  Base Account
                </h1>
              </div>
              <div class="dropdown mt-2 me-5">
                <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fa-solid fa-list"></i>
                </button>
                <ul class="dropdown-menu menu">
                  <li class="iconbutton d-flex justify-content-center text-success">
                    {['add', 'all permission'].some(permission => BAPermissions.includes(permission)) && (
                      <icon
                        class="icon"
                        onClick={handleNavigateToForm}
                      >
                        <i class="fa-solid fa-user-plus"></i>
                      </icon>
                    )}
                  </li>
                  <li class="iconbutton  d-flex justify-content-center text-danger">
                    {['delete', 'all permission'].some(permission => BAPermissions.includes(permission)) && (
                      <icon
                        class="icon"
                        onClick={deleteSelectedRows}
                      >
                        <i class="fa-solid fa-user-minus"></i>
                      </icon>
                    )}
                  </li>
                  <li class="iconbutton  d-flex justify-content-center text-primary ">                  {['update', 'all permission'].some(permission => BAPermissions.includes(permission)) && (
                    <icon
                      class="icon"
                      onClick={saveEditedData}
                    >
                      <i class="fa-solid fa-floppy-disk"></i>
                    </icon>
                  )}
                  </li>
                  <li class="iconbutton  d-flex justify-content-center ">
                    {['all permission', 'view'].some(permission => BAPermissions.includes(permission)) && (
                      <icon
                        class="icon"
                        onClick={generateReport}
                      >
                        <i class="fa-solid fa-print"></i>
                      </icon>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="shadow-lg p-1 pt-3 bg-body-tertiary rounded  mb-2 mt-2">
          <div className="row ms-4 mt-3 mb-3 me-4">
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cname" class="exp-form-labels">
                  Account code
                </label>
                <input
                  id="cno"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the account code here"
                  value={base_accgroup_code}
                  onChange={handleCompanyNoChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={18}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cname" class="exp-form-labels">
                  Account Name
                </label>
                <input
                  id="cname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the account name here"
                  value={base_accgroup_name}
                  onChange={handleCompanyNameChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label class="exp-form-labels">
                  Status
                </label>
                <div title="Select the Status">        
                <Select
                  id="status"
                  value={selectedStatus}
                  onChange={handleChangeStatus}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  options={filteredOptionStatus}
                  className="exp-input-field"
                  placeholder=""
                />
              </div>
              </div>
            </div> 
            <div className="col-md-3 form-group mt-4">
              <div class="exp-form-floating">
                <div class=" d-flex  justify-content-center">
                  <div class=''>
                    <icon className="popups-btn fs-6 p-3" onClick={handleSearch} required title="Search">
                      <i className="fas fa-search"></i>
                    </icon>
                  </div>
                  <div>
                    <icon className="popups-btn fs-6 p-3" onClick={reloadGridData} required title="Refresh">
                      <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                    </icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="">
            <div class="ag-theme-alpine" style={{ height: 550, width: "100%" }}>
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


export default BaseAccount
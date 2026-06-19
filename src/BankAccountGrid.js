import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, DropdownButton } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import labels from "./Labels";
import LoadingScreen from './Loading';
import { showConfirmationToast } from './ToastConfirmation';


function BankAccGrid() {
  const [editedData, setEditedData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [account_code, setaccount_code] = useState("");
  const [account_name, setaccount_name] = useState("");
  const [account_type, setaccount_type] = useState("");
  const [acc_addr_1, setacc_addr_1] = useState("");
  const [acc_area_code, setacc_area_code] = useState("");
  const [acc_state_code, setacc_state_code] = useState("");
  const [acc_country_code, setacc_country_code] = useState("");
  const [loading, setLoading] = useState(false);
  const [branch, setbranch] = useState("");
  const [selectedAcctype, setselectedAcctype] = useState('');
  const [accdrop, setaccdrop] = useState([]);
  const [accGriddrop, setaccGriddrop] = useState([]);
  const [drop, setDrop] = useState([]);
  const [condrop, setCondrop] = useState([]);
  const [statedrop, setStatedrop] = useState([]);
  const config = require('./Apiconfig');
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const location = useLocation();

  //code added by Harish purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const AccNamePermission = permissions
    .filter(permission => permission.screen_type === 'AccountName')
    .map(permission => permission.permission_type.toLowerCase());

  useEffect(() => {
    if (location.state?.preservedRowData) {
      setRowData(location.state.preservedRowData);
    }

    if (location.state?.preservedInputs) {
      setaccount_code(location.state.preservedInputs.account_code || "");
      setaccount_name(location.state.preservedInputs.account_name || "");
      setacc_addr_1(location.state.preservedInputs.acc_addr_1 || "");
      setacc_area_code(location.state.preservedInputs.acc_area_code || "");
      setacc_state_code(location.state.preservedInputs.acc_state_code || "");
      setacc_country_code(location.state.preservedInputs.acc_country_code || "");
      setbranch(location.state.preservedInputs.branch || "");
      setaccount_type(location.state.preservedInputs.account_type || "");

      if (location.state.preservedInputs.account_type) {
        setselectedAcctype({
          label: location.state.preservedInputs.account_type,
          value: location.state.preservedInputs.account_type,
        });
      }
    }
  }, [location.state]);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/getacctype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    }).then((response) => response.json())
      .then((data) => {
        const Accounts = data.map(option => option.attributedetails_name);
        setaccGriddrop(Accounts);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/city`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((response) => response.json())
      .then((data) => {
        const cityNames = data.map(option => option.attributedetails_name);
        setDrop(cityNames);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/country`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map(option => option.attributedetails_name);
        setCondrop(countries);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((response) => response.json())
      .then((data) => {
        const States = data.map(option => option.attributedetails_name);
        setStatedrop(States);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/getacctype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setaccdrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const filteredOptionAccountype = accdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeacc = (selectedAcctype) => {
    setselectedAcctype(selectedAcctype);
    setaccount_type(selectedAcctype ? selectedAcctype.value : '');
  };

  const reloadGridData = () => {
    window.location.reload();
  };

  const clearInputFields = () => {
    setaccount_code("");
    setaccount_name("");
    setacc_addr_1("");
    setacc_area_code("");
    setacc_state_code("");
    setacc_country_code("");
    setbranch("");
    setaccount_type("");
    setselectedAcctype("");
    setRowData([]);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getbankaccSearch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'), account_code, account_name, acc_addr_1, acc_area_code, acc_state_code, acc_country_code, account_type, branch
        })
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("Data fetched successfully");
      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error updating data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Accountant Code",
      field: "account_code",
      cellClass: "ag-link-cell",
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
      }
    },
    {
      headerName: "Bank Name",
      field: "account_name",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "User Account Code",
      field: "user_accgroup_code",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: "Standard Account Code",
      field: "standard_accgroup_code",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: "Base Account Code",
      field: "base_accgroup_code",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: "Address 1",
      field: "acc_addr_1",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address 2",
      field: "acc_addr_2",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address 3",
      field: "acc_addr_3",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address 4",
      field: "acc_addr_4",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "City",
      field: "acc_area_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: drop,
      },
    },
    {
      headerName: "State",
      field: "acc_state_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: statedrop,
      },
    },
    {
      headerName: "Country",
      field: "acc_country_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: condrop,
      },
    },
    {
      headerName: "Account No",
      field: "account_number",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "IFSC Code",
      field: "IFSC_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Branch ",
      field: "branch",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Account Type",
      field: "Account_type",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: accGriddrop,
      },
    },
  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
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
      return {
        "Accountant Code": row.account_code,
        "Accountant Name": row.account_name,
        Address: `
        ${row.acc_addr_1 || ''},
            ${row.acc_addr_2 || ''},  
            ${row.acc_addr_3 || ''},<br>
            ${row.acc_addr_4 || ''},<br>
            ${row.acc_area_code || ''},<br>
            ${row.acc_state_code || ''},<br>
            ${row.acc_country_code || ''}`,
        "Base Account Code": row.base_accgroup_code,
        "Standard Account Code": row.standard_accgroup_code,
        "Account No": row.account_number,
        "IFSC Code": row.IFSC_code,
        "Account Type": row.account_type,
        "Branch": row.branch,
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Bank Account</title>");
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
    reportWindow.document.write("<h1><u>BankAccount  Information</u></h1>");

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

  const handleNavigatesToForm = () => {
    navigate("/AddBankAccount", { state: { mode: "create" } }); // Pass selectedRows as props to the Input component
  };

  const handleNavigateWithRowData = (selectedRow) => {
    navigate("/AddBankAccount", {
      state: {
        mode: "update",
        selectedRow,

        preservedRowData: rowData,

        preservedInputs: {
          account_code,
          account_name,
          acc_addr_1,
          acc_area_code,
          acc_state_code,
          acc_country_code,
          branch,
          account_type
        },
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
      (row) => row.account_code === params.data.account_code
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  const saveEditedData = async () => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    const modified_by = sessionStorage.getItem('selectedUserCode');

    const selectedRowsData = editedData.filter(row => selectedRows.some(selectedRow => selectedRow.account_code === row.account_code));

    if (selectedRowsData.length === 0) {
      toast.warning("Please select and modify at least one row to update its data");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${config.apiBaseUrl}/updatebankAcc`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "modified-by": modified_by,
              "company_code": company_code
            },
            body: JSON.stringify({ editedData: selectedRowsData }), // Send only the selected rows for saving
          });

          if (response.status === 200) {
            setTimeout(() => {
              toast.success("Data Updated Successfully")
              handleSearch();
            }, 1000);
            return;
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert sales data");
          }
        } catch (error) {
          console.error("Error saving data:", error);
          toast.error("Error Updating Data: " + error.message);
        }
        finally {
          setLoading(false);
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
      toast.warning("No Rows Selected");
      return;
    }

    const modified_by = sessionStorage.getItem('selectedUserCode');
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    const account_codesToDelete = selectedRows.map((row) => row.account_code);

    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${config.apiBaseUrl}/AccNameDelete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": modified_by,
              "company_code": company_code
            },
            body: JSON.stringify({ account_codes: account_codesToDelete }),
            "modified_by": modified_by,
            "company_code": company_code,
          });

          if (response.ok) {
            console.log("Rows deleted successfully:", account_codesToDelete);
            setTimeout(() => {
              toast.success("Data Deleted successfully")
              handleSearch();
            }, 1000);
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert sales data");
          }
        } catch (error) {
          console.error("Error deleting rows:", error);
          toast.error('Error Deleting Data: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data Delete cancelled.");
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

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
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div className=" d-flex justify-content-between  ">
            <div class="d-flex justify-content-start">
              <h1 align="left" className="purbut">Bank Accounts</h1>
            </div>
            <div className="d-flex justify-content-end purbut me-3">
              {['add', 'all permission'].some(permission => AccNamePermission.includes(permission)) && (
                <addbutton className="purbut" onClick={handleNavigatesToForm} required title="Add Bank Accounts">
                  <i class="fa-solid fa-user-plus"></i>
                </addbutton>
              )}
              {['delete', 'all permission'].some(permission => AccNamePermission.includes(permission)) && (
                <delbutton className="purbut" onClick={deleteSelectedRows} required title="Delete">
                  <i class="fa-solid fa-user-minus"></i>
                </delbutton>
              )}
              {['update', 'all permission'].some(permission => AccNamePermission.includes(permission)) && (
                <savebutton className="purbut" onClick={saveEditedData} required title="Update">
                  <i class="fa-solid fa-floppy-disk"></i>
                </savebutton>
              )}
              {['all permission', 'view'].some(permission => AccNamePermission.includes(permission)) && (
                <printbutton class="purbut" onClick={generateReport} required title="Generate Report">
                  <i class="fa-solid fa-print"></i>
                </printbutton>
              )}
            </div>
            <div class="mobileview">
              <div class="d-flex justify-content-between ">
                <div className="d-flex justify-content-start">
                  <h1 align="left" className="h1">Bank Accounts</h1>
                </div>
                <div class="dropdown mt-3 me-5" >
                  <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-list"></i>
                  </button>
                  <ul class="dropdown-menu menu">
                    <li class="iconbutton d-flex justify-content-center text-success">
                      {['add', 'all permission'].some(permission => AccNamePermission.includes(permission)) && (
                        <icon class="icon" onClick={handleNavigatesToForm}>
                          <i class="fa-solid fa-user-plus"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-danger">
                      {['delete', 'all permission'].some(permission => AccNamePermission.includes(permission)) && (
                        <icon class="icon" onClick={deleteSelectedRows}>
                          <i class="fa-solid fa-user-minus"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-primary ">
                      {['update', 'all permission'].some(permission => AccNamePermission.includes(permission)) && (
                        <icon class="icon" onClick={saveEditedData}>
                          <i class="fa-solid fa-floppy-disk"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center ">
                      {['all permission', 'view'].some(permission => AccNamePermission.includes(permission)) && (
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
                <label for="cuscode" class="exp-form-labels">
                  Code
                </label><input
                  id="cuscode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the code here"
                  value={account_code}
                  onChange={(e) => setaccount_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={18}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cusname" class="exp-form-labels">
                  Name
                </label><input
                  id="cusname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the name here"
                  value={account_name}
                  onChange={(e) => setaccount_name(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cusaddr1" class="exp-form-labels">
                  Address
                </label> <input
                  id="cusaddr1"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the address here"
                  value={acc_addr_1}
                  onChange={(e) => setacc_addr_1(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cusarcode" class="exp-form-labels">
                  City
                </label><input
                  id="cusarcode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the area here"
                  value={acc_area_code}
                  onChange={(e) => setacc_area_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cusstatcode" class="exp-form-labels">
                  State
                </label><input
                  id="cusstatcode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the state here"
                  value={acc_state_code}
                  onChange={(e) => setacc_state_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cuscountrycode" class="exp-form-labels">
                  Country
                </label> <input
                  id="cuscountrycode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the country here"
                  value={acc_country_code}
                  onChange={(e) => setacc_country_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label class="exp-form-labels">
                  Account Type
                </label>
                <div title="Select the Account Type">
                  <Select
                    id="acctype"
                    value={selectedAcctype}
                    onChange={handleChangeacc}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    options={filteredOptionAccountype}
                    className="exp-input-field"
                    placeholder=""
                  />
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="contactno" class="exp-form-labels">
                  Branch
                </label><input
                  id="branch"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the contact number here"
                  value={branch}
                  onChange={(e) => setbranch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={20}
                />
              </div>
            </div>
            <div className="col-md-3 form-group mt-4">
              <div class="exp-form-floating">
                <div class=" d-flex  justify-content-center">

                  <div class=''><icon className="popups-btn fs-6 p-3" onClick={handleSearch} required title="Search"><i className="fas fa-search"></i></icon></div>
                  <div><icon className="popups-btn fs-6 p-3" onClick={clearInputFields} required title="Reload"><FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" /></icon></div>
                </div> </div></div>
          </div>
          <div class="ag-theme-alpine" style={{ height: 485, width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              onCellValueChanged={onCellValueChanged}
              rowSelection="multiple"
              pagination={true}
              onSelectionChanged={onSelectionChanged}
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
              {labels.createdDate} : {createdDate}
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

export default BankAccGrid;

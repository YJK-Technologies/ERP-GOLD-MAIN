
import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import labels from "./Labels";
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from './Loading';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from './ToastConfirmation';

function TaxDetGrid() {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const config = require('./Apiconfig');
  const [tax_type_header, settax_type_header] = useState("");
  const [tax_name_details, settax_name_details] = useState("");
  const [tax_percentage, settax_percentage] = useState(0);
  const [tax_shortname, settax_shortname] = useState("");
  const [tax_accountcode, settax_accountcode] = useState("");
  const [transaction_type, settransaction_type] = useState("");
  const [status, setstatus] = useState("");
  const [editedData, setEditedData] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [transactiondrop, setTransactiondrop] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusgriddrop, setStatusGriddrop] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);    
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const location = useLocation();

  //code added by Harish purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const taxDetGrid = permissions
    .filter(permission => permission.screen_type === 'Tax')
    .map(permission => permission.permission_type.toLowerCase());

  useEffect(() => {
      if (location.state?.preservedRowData) {
        setRowData(location.state.preservedRowData);
      }
    
      if (location.state?.preservedInputs) {
        settax_type_header(location.state.preservedInputs.tax_type_header || "");
        settax_name_details(location.state.preservedInputs.tax_name_details || "");
        settax_percentage(location.state.preservedInputs.tax_percentage || 0);
        settax_shortname(location.state.preservedInputs.tax_shortname || "");
        settax_accountcode(location.state.preservedInputs.tax_accountcode || "");
        settransaction_type(location.state.preservedInputs.transaction_type || "");
        setstatus(location.state.preservedInputs.status || "");
    
        if (location.state.preservedInputs.status) {
          setSelectedStatus({
            label: location.state.preservedInputs.status,
            value: location.state.preservedInputs.status,
          });
        }
      }
    }, [location.state]);

  const reloadGridData = () => {
    window.location.reload();
  };

  const clearInputFields = () => {
settax_type_header("");
settax_name_details("");
    settax_percentage(0);
    settax_shortname("");
    settax_accountcode("");
    settransaction_type("");
    setstatus("");
    setRowData([]);
  };

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    
    fetch(`${config.apiBaseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const statusOption = data.map(option => option.attributedetails_name);
        setStatusGriddrop(statusOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    
    fetch(`${config.apiBaseUrl}/Transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const Status = data.map(option => option.attributedetails_name);
        setTransactiondrop(Status);
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
      .then((val) => setStatusdrop(val));
  }, []);
  const filteredOptionStatus = [{ value: 'All', label: 'All' }, ...statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }))];

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setstatus(selectedStatus ? selectedStatus.value : '');
    setError(false);
  };


  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/taxSearchdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'), tax_type_header, tax_name_details, tax_percentage, tax_shortname,
          transaction_type, status, tax_accountcode
        }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("data fetched successfully")

      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found")
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error updating data: " + error.message);
    }finally {
      setLoading(false);
    }

  };


  const columnDefs = [

    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Tax Type Header",
      field: "tax_type_header",
      cellClass: "ag-link-cell",
      //  editable: true,
      cellStyle: { textAlign: "center" },
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
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 18,
      },

    },
    {
      headerName: "Tax Name Details",
      field: "tax_name_details",
      editable: true,
      cellStyle: {
        textAlign: "center",
      },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {

      headerName: "Tax Percentage",
      field: "tax_percentage",
      editable: true,
      cellStyle: {
        textAlign: "center",
      },
      // minWidth: 150,
    },
    {

      headerName: "Short Name",
      field: "tax_shortname",
      editable: true,
      cellStyle: {
        textAlign: "center",
      },
      // minWidth: 150,
    },
    {
      headerName: "Tax Account Code",
      field: "tax_accountcode",
      editable: true,
      cellStyle: {
        textAlign: "center",
      },
    //  minWidth: 150,
    },
    {
      headerName: "Transaction Type",
      field: "transaction_type",
      editable: true,
      cellStyle: {
        textAlign: "center",
      },
      // minWidth: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: transactiondrop,
      },
    },

    {
      headerName: "Status",
      field: "status",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: statusgriddrop
      },

    },


  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
    // sortable: true,
    //editable: true,
    // flex: 1,
    // filter: true,
    // floatingFilter: true,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onSearchInputChange = (e) => {
    setSearchValue(e.target.value);
    if (gridApi) {
      gridApi.setQuickFilter(e.target.value);
    }
  };
  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return
    };

    const reportData = selectedRows.map((row) => {
      return {
        /* Date: moment(row.expenses_date).format("YYYY-MM-DD"),
        Type: row.expenses_type,
        Expenditure: row.expenses_amount,
        "Spent By": row.expenses_spentby,
        Remarks: row.remarks,*/
        "Tax Type Header": row.tax_type_header,
        "Tax Name Details": row.tax_name_details,
        "Tax Percentage": row.tax_percentage,
        "Tax Short Name": row.tax_shortname,
        "Tax Account Code": row.tax_accountcode,
        "Transaction Type": row.transaction_type,
        "Status": row.status,
        //"Founded Date": row.FoundedDate,
        //"Website URL": row.WebsiteURL,
        //"Company Logo": row.Company_logo,
        //"Contact Number": row.contact_no,
        //  "CEO Name": row.CEOName,
        // "Annual Report URL": row.AnnualReportURL,
        // "created by": row.created_by,
        // "created date": row.created_date,
        // "modfied by": row.modfied_by,
        // "modfied date": row.modfied_date,
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Tax</title>");
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
    reportWindow.document.write("<h1><u>Tax Information</u></h1>");

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



  /*const handleNavigateToForm = () => {
    navigate("/form");
  };*/

  const handleNavigatesToForm = () => {
    navigate("/AddTaxDetails", { state: { mode: "create" } }); // Pass selectedRows as props to the Input component
  };
  const handleNavigateWithRowData = (selectedRow) => {
  navigate("/addTaxDetails", {
    state: {
      mode: "update",
      selectedRow,

      preservedRowData: rowData,

      preservedInputs: {
        tax_type_header,
        tax_name_details,
        tax_percentage,
        tax_shortname,
        tax_accountcode,
        transaction_type,
        status
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
      (row) => row.tax_type_header === params.data.tax_type_header && row.tax_name_details === params.data.tax_name_details
    );
  
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);
  
      setEditedData((prevData) => {
        const existingIndex = prevData.findIndex(
          (item) => item.tax_type_header === params.data.tax_type_header && item.tax_name_details === params.data.tax_name_details
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

    // Filter the editedData state to include only the selected rows
    const selectedRowsData = editedData.filter(row =>
      selectedRows.some(selectedRow =>
        selectedRow.tax_type_header === row.tax_type_header && selectedRow.tax_name_details === row.tax_name_details
      )
    );

    if (selectedRowsData.length === 0) {
      toast.warning("Please select a row to update its data");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const modified_by = sessionStorage.getItem('selectedUserCode');
          const company_code = sessionStorage.getItem("selectedCompanyCode")

          const response = await fetch(`${config.apiBaseUrl}/updTaxdetData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": modified_by,
              "company_code": company_code

            },
            body: JSON.stringify({
              tax_type_headersToUpdate: selectedRowsData.map(row => row.tax_type_header),
              tax_name_detailssToUpdate: selectedRowsData.map(row => row.tax_name_details),
              company_code: (sessionStorage.getItem("selectedCompanyCode")),
              updatedData: selectedRowsData,
              "modified_by": modified_by

            }), // Send the selected rows for saving along with their header and detail codes
          });

          if (response.ok) {
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
        }finally {
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
      toast.warning("Please select atleast One Row to Delete")
      return;
    }

    const modified_by = sessionStorage.getItem('selectedUserCode');
    const company_code = sessionStorage.getItem("selectedCompanyCode")

    const tax_type_headersToDelete = selectedRows.map((row) => row.tax_type_header);
    const tax_name_detailsToDelete = selectedRows.map((row) => row.tax_name_details);

    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${config.apiBaseUrl}/deleteTaxData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": modified_by,
              "company_code": company_code

            },
            body: JSON.stringify({ tax_type_headersToDelete, tax_name_detailsToDelete, company_code }),
            "modified_by": modified_by,
            "company_code": company_code


            // Corrected the key name to match the server-side expectation
          });

          if (response.ok) {
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
        }
        finally {
          setLoading(false);
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
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div className=" d-flex justify-content-between  ">
            <div class="d-flex justify-content-start">
              <h1 align="left" className="purbut me-5">
                Tax
              </h1></div>


            <div className="d-flex justify-content-end purbut me-3">
              {['add', 'all permission'].some(permission => taxDetGrid.includes(permission)) && (
                <addbutton className="purbut" onClick={handleNavigatesToForm}
                  required title="Add Tax"> <i class="fa-solid fa-user-plus"></i> </addbutton>
              )}
              {['delete', 'all permission'].some(permission => taxDetGrid.includes(permission)) && (
                <delbutton
                  className="purbut"
                  onClick={deleteSelectedRows}
                  required
                  title="Delete"
                >
                  <i class="fa-solid fa-user-minus"></i>
                </delbutton>
              )}
              {['update', 'all permission'].some(permission => taxDetGrid.includes(permission)) && (
                <savebutton
                  className="purbut"
                  onClick={saveEditedData}
                  required
                  title="Update"
                >
                  <i class="fa-solid fa-floppy-disk"></i>
                </savebutton>
              )}



              {['all permission', 'view'].some(permission => taxDetGrid.includes(permission)) && (
                <printbutton
                  class="purbut"
                  onClick={generateReport}
                  required
                  title="Generate Report"
                >
                  <i class="fa-solid fa-print"></i>
                </printbutton>
              )}
            </div>

            <div class="mobileview">
              <div class="d-flex justify-content-between">
                <div className="d-flex justify-content-start me-5">
                  <h1 align="left" className="h1">Tax</h1>
                </div>

                <div class="dropdown mt-1 me-5 " >
                  <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-list"></i>
                  </button>

                  <ul class="dropdown-menu">
                    <li class="iconbutton d-flex justify-content-center text-success">
                      {['add', 'all permission'].some(permission => taxDetGrid.includes(permission)) && (
                        <icon
                          class="icon"
                          onClick={handleNavigatesToForm}
                        >
                          <i class="fa-solid fa-user-plus"></i>
                          {" "}
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-danger">
                      {['delete', 'all permission'].some(permission => taxDetGrid.includes(permission)) && (
                        <icon
                          class="icon"
                          onClick={deleteSelectedRows}
                        >

                          <i class="fa-solid fa-user-minus"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-primary ">
                      {['update', 'all permission'].some(permission => taxDetGrid.includes(permission)) && (
                        <icon
                          class="icon"
                          onClick={saveEditedData}
                        >
                          <i class="fa-solid fa-floppy-disk"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center ">
                      {['all permission', 'view'].some(permission => taxDetGrid.includes(permission)) && (
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
        </div>

        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">

          <div className="row ms-4 mt-3 mb-3 me-4">
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="tcode" class="exp-form-labels">
                  Tax Type
                </label><input
                  id="wcode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the tax type here"
                  value={tax_type_header}
                  onChange={(e) => settax_type_header(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={18}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="tname" class="exp-form-labels">
                  Tax Name Details
                </label><input
                  id="wname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the tax detail here"
                  value={tax_name_details}
                  onChange={(e) => settax_name_details(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div className="exp-form-floating">
                <label htmlFor="Tax percentage" className="exp-form-labels">Tax percentage</label>
                <input
                  id="status"
                  className="exp-input-field form-control"
                  type="number" // Change input type to "number"
                  placeholder=""
                  required title="Please fill the tax percentage here"
                  value={tax_percentage}
                  onChange={(e) => settax_percentage(parseFloat(e.target.value))} // Ensure value is parsed as a number
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="name" class="exp-form-labels">
                  Tax Short Name
                </label><input
                  id="wloc"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the tax name here"
                  value={tax_shortname}
                  onChange={(e) => settax_shortname(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="account" class="exp-form-labels">
                  Tax Account Code
                </label><input
                  id="wloc"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the tax account code here"
                  value={tax_accountcode}
                  onChange={(e) => settax_accountcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={9}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="Transaction" class="exp-form-labels">
                  Transaction Type
                </label><input
                  id="wloc"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the transaction type here"
                  value={transaction_type}
                  onChange={(e) => settransaction_type(e.target.value)}
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
                  maxLength={18}
                />

              </div>
              </div>


            </div>
            <div className="col-md-2 form-group mt-4">
              <div class="exp-form-floating">
                <div class=" d-flex justify-content-center ">
                  <div class="">
                    <icon
                      className="popups-btn fs-6 p-3"
                      onClick={handleSearch}
                      required
                      title="Search"
                    >
                      <i className="fas fa-search"></i>
                    </icon>
                  </div>
                  <div>
                    <icon
                      className="popups-btn fs-6 p-3"
                      onClick={clearInputFields}
                      required
                      title="Reload"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                    </icon>
                  </div>
                </div>{" "}
              </div>
            </div>
          </div>







          {/* <p>Result Set</p>  */}

          <div class="ag-theme-alpine" style={{ height: 547, width: "100%" }}>
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

export default TaxDetGrid;
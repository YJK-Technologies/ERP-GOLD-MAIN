import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import labels from "./Labels";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from './ToastConfirmation';
import LoadingScreen from './Loading';
const config = require('./Apiconfig');


function IntermediaryGrid() {
  const [open2, setOpen2] = React.useState(false);
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [Code, setcode] = useState("");
  const [codeDetails, setcodeDetails] = useState("");
  const [intermediary_addr_1, setintermediary_addr_1] = useState("");
  const [intermediary_area_code, setintermediary_area_code] = useState("");
  const [intermediary_stat_code, setintermediary_stat_code] = useState("");
  const [intermediary_cnty_code, setintermediary_cnty_code] = useState("");
  const [intermediary_imex_no, setintermediary_imex_no] = useState("");
  const [intermediary_office_no, setintermediary_office_no] = useState("");
  const [intermediary_fax_no, setintermediary_fax_no] = useState("");
  const [intermediary_email_id, setintermediary_email_id] = useState("");
  const [editedData, setEditedData] = useState([]);
  const [loading, setLoading] = useState(false);    
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const location = useLocation();


  //code added by Harish purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const intermediaryHeaderPermission = permissions
    .filter(permission => permission.screen_type === 'Intermediary')
    .map(permission => permission.permission_type.toLowerCase());

  useEffect(() => {
      if (location.state?.preservedRowData) {
        setRowData(location.state.preservedRowData);
      }
    
      if (location.state?.preservedInputs) {
        setcode(location.state.preservedInputs.Code || "");
        setcodeDetails(location.state.preservedInputs.codeDetails || "");
        setintermediary_addr_1(location.state.preservedInputs.intermediary_addr_1 || "");
        setintermediary_area_code(location.state.preservedInputs.intermediary_area_code || "");
        setintermediary_stat_code(location.state.preservedInputs.intermediary_stat_code || "");
        setintermediary_cnty_code(location.state.preservedInputs.intermediary_cnty_code || "");
        setintermediary_imex_no(location.state.preservedInputs.intermediary_imex_no || "");
        setintermediary_office_no(location.state.preservedInputs.intermediary_office_no || "");
        setintermediary_fax_no(location.state.preservedInputs.intermediary_fax_no || "");
        setintermediary_email_id(location.state.preservedInputs.intermediary_email_id || "");
      }
    }, [location.state]); 

  const reloadGridData = () => {
    window.location.reload();
  };

  const clearInputFields = () => {
setcode("");
    setcodeDetails("");
    setintermediary_addr_1("");
    setintermediary_area_code("");
    setintermediary_stat_code("");
    setintermediary_cnty_code("");
    setintermediary_imex_no("");
    setintermediary_office_no("");
    setintermediary_fax_no("");
    setintermediary_email_id("");
    setRowData([]);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const company_code = sessionStorage.getItem('selectedCompanyCode');
      const response = await fetch(`${config.apiBaseUrl}/intermediarySearchdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company_code": company_code
        },
        body: JSON.stringify({
          company_code: company_code, Code, codeDetails, intermediary_addr_1, intermediary_area_code, intermediary_stat_code, intermediary_cnty_code, intermediary_imex_no, intermediary_office_no,
          intermediary_fax_no, intermediary_email_id
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
      headerName: "Header Code",
      field: "Code",
      cellClass: "ag-link-cell",
      //editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 250,
      // maxWidth: 250,
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
      headerName: "Detail Code",
      field: "codeDetails",
      //editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {

      headerName: "Address 1",
      field: "intermediary_addr_1",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address 2",
      field: "intermediary_addr_2",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address 3",
      field: "intermediary_addr_3",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address 4",
      field: "intermediary_addr_4",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Area Code",
      field: "intermediary_area_code",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 18,
      },
    },
    {
      headerName: "State Code",
      field: "intermediary_stat_code",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 100,
      },
    },
    {
      headerName: "Country Code",
      field: "intermediary_cnty_code",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 100,
      },
    },
    {
      headerName: "IMEX No",
      field: "intermediary_imex_no",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: "Office No",
      field: "intermediary_office_no",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Residental No",
      field: "intermediary_resi_no",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Mobile No",
      field: "intermediary_mobile_no",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 50,
      },
    },
    {
      headerName: "Fax No",
      field: "intermediary_fax_no",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Email ID",
      field: "intermediary_email_id",
      editable: true,
      cellStyle: { textAlign: "center" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 250,
      },
    },


  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
    // sortable: true,
    //editable: true,
    // flex: 1,
    //filter: true,
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
        "Intermediary Code": row.Code,
        "Code Details": row.codeDetails,
        "Address 1": row.intermediary_addr_1,
        "Address 2": row.intermediary_addr_2,
        "Address 3": row.intermediary_addr_3,
        "Address 4": row.intermediary_addr_4,
        "Area Code": row.intermediary_area_code,
        "State Code": row.intermediary_stat_code,
        "Country Code": row.intermediary_cnty_code,
        "Imex No": row.intermediary_imex_no,
        "Office No": row.intermediary_office_no,
        "Residential No": row.intermediary_resi_no,
        "Mobile No": row.intermediary_mobile_no,
        "Fax No": row.intermediary_fax_no,
        "Email ID": row.intermediary_email_id,
        //"Status": row.status,
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
    reportWindow.document.write("<html><head><title>Intermediary</title>");
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
    reportWindow.document.write("<h1><u>Intermediary Information</u></h1>");

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
    navigate("/AddIntermedDetails", { state: { mode: "create" } }); // Pass selectedRows as props to the Input component
  };
  const handleNavigateWithRowData = (selectedRow) => {
  navigate("/AddIntermedDetails", {
    state: {
      mode: "update",
      selectedRow,

      preservedRowData: rowData,

      preservedInputs: {
        Code,
        codeDetails,
        intermediary_addr_1,
        intermediary_area_code,
        intermediary_stat_code,
        intermediary_cnty_code,
        intermediary_imex_no,
        intermediary_office_no,
        intermediary_fax_no,
        intermediary_email_id
      },
    },
  });
};

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  // Assuming you have a unique identifier for each row, such as 'id'
  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.Code === params.data.Code && row.codeDetails === params.data.codeDetails
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      // Add the edited row data to the state
      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };


  const saveEditedData = async () => {
    const modified_by = sessionStorage.getItem('selectedUserCode');
    const company_code = sessionStorage.getItem('selectedCompanyCode');


    // Filter the editedData state to include only the selected rows
    const selectedRowsData = editedData.filter(row =>
      selectedRows.some(selectedRow =>
        selectedRow.Code === row.Code && selectedRow.codeDetails === row.codeDetails
      )
    ); if (selectedRowsData.length === 0) {
      toast.warning("Please select and modify at least one row to update its data");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${config.apiBaseUrl}/updateIntermediaryDetailData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "company_code": company_code,
              "modified-by": modified_by
            },
            body: JSON.stringify({
              CodesToUpdate: selectedRowsData.map(row => row.Code),
              codeDetailsToUpdate: selectedRowsData.map(row => row.codeDetails),
              updatedData: selectedRowsData,
            })
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
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    const modified_by = sessionStorage.getItem('selectedUserCode');
    const CodesToDelete = selectedRows.map((row) => row.Code);
    const codeDetailsToDelete = selectedRows.map((row) => row.codeDetails);
    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${config.apiBaseUrl}/deleteIntermediaryDetailData`, {

            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "company_code": company_code,
              "Modified-By": modified_by
            },
            body: JSON.stringify({ CodesToDelete, codeDetailsToDelete }), // Corrected the key name to match the server-side expectation
            "company_code": company_code,
            "modified_by": modified_by
          });

          if (response.ok) {
            setTimeout(() => {
              toast.success("Data Deleted successfully")
              handleSearch();
            }, 1000);

          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to eelete");
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
                Intermediary    </h1></div>

            <div className="d-flex justify-content-end purbut me-3">
              {['add', 'all permission'].some(permission => intermediaryHeaderPermission.includes(permission)) && (
                <addbutton className="" onClick={handleNavigatesToForm}
                  required title="Add Intermediary"> <i class="fa-solid fa-user-plus"></i> </addbutton>
              )}
              {['delete', 'all permission'].some(permission => intermediaryHeaderPermission.includes(permission)) && (
                <delbutton
                  className="purbut"
                  onClick={deleteSelectedRows}
                  required
                  title="Delete"
                >
                  <i class="fa-solid fa-user-minus"></i>
                </delbutton>
              )}
              {['update', 'all permission'].some(permission => intermediaryHeaderPermission.includes(permission)) && (
                <savebutton
                  className="purbut"
                  onClick={saveEditedData}
                  required
                  title="Update"
                >
                  <i class="fa-solid fa-floppy-disk"></i>
                </savebutton>
              )}

              {/* <div class="d-flex flex-row my-2 mt-3 ">
          <button  onClick={} title="print"><i class="fa fa-print" aria-hidden="true"></i></button>

        
         */}
              {['all permission', 'view'].some(permission => intermediaryHeaderPermission.includes(permission)) && (
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
                <div className="d-flex justify-content-start">
                  <h1 className="h1"> Intermediary</h1>
                </div>
                <div class="dropdown mt-1 me-5">
                  <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-list"></i>
                  </button>
                  <ul class="dropdown-menu menu">

                    <li class="iconbutton d-flex justify-content-center text-success">
                      {['add', 'all permission'].some(permission => intermediaryHeaderPermission.includes(permission)) && (
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
                      {['delete', 'all permission'].some(permission => intermediaryHeaderPermission.includes(permission)) && (
                        <icon
                          class="icon"
                          onClick={deleteSelectedRows}
                        >

                          <i class="fa-solid fa-user-minus"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-primary ">
                      {['update', 'all permission'].some(permission => intermediaryHeaderPermission.includes(permission)) && (
                        <icon
                          class="icon"
                          onClick={saveEditedData}
                        >
                          <i class="fa-solid fa-floppy-disk"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center ">
                      {['all permission', 'view'].some(permission => intermediaryHeaderPermission.includes(permission)) && (
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
                  Code
                </label><input
                  id="locno"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the header code"
                  value={Code
                  }
                  maxLength={18}
                  onChange={(e) => setcode
                    (e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />


              </div>
            </div>

            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="lname" class="exp-form-labels">
                  Name
                </label><input
                  id="lname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the detail code"
                  value={codeDetails}
                  maxLength={250}
                  onChange={(e) => setcodeDetails(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />

              </div>
            </div>

            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="city" class="exp-form-labels">
                  Address
                </label><input
                  id="city"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the address"
                  value={intermediary_addr_1}
                  maxLength={250}
                  onChange={(e) => setintermediary_addr_1(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}

                />

              </div>
            </div>

            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="state" class="exp-form-labels">
                  City
                </label><input
                  id="state"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the city"
                  value={intermediary_area_code}
                  maxLength={18}
                  onChange={(e) => setintermediary_area_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="city" class="exp-form-labels">
                  State
                </label><input
                  id="city"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the state"
                  value={intermediary_stat_code}
                  maxLength={100}
                  onChange={(e) => setintermediary_stat_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}

                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="city" class="exp-form-labels">
                  Country
                </label><input
                  id="city"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the country"
                  value={intermediary_cnty_code}
                  onChange={(e) => setintermediary_cnty_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={100}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="city" class="exp-form-labels">
                  IMEX No
                </label><input
                  id="city"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the IMEX number"
                  value={intermediary_imex_no}
                  onChange={(e) => setintermediary_imex_no(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={10}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="city" class="exp-form-labels">
                  Contact No
                </label><input
                  id="city"
                  className="exp-input-field form-control"
                  type="number"
                  placeholder=""
                  required title="Please fill the contact number"
                  value={intermediary_office_no}
                  onChange={(e) => setintermediary_office_no(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={50}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="city" class="exp-form-labels">
                  Fax No
                </label><input
                  id="city"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the fax number"
                  value={intermediary_fax_no}
                  onChange={(e) => setintermediary_fax_no(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={20}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="city" class="exp-form-labels">
                  Email ID
                </label><input
                  id="city"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the email ID"
                  value={intermediary_email_id}
                  maxLength={250}
                  onChange={(e) => setintermediary_email_id(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}

                />

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

          {/* <p>Result Set</p> */}

          <div class="ag-theme-alpine" style={{ height: 485, width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              onCellValueChanged={onCellValueChanged}
              rowSelection="multiple"
              pagination={true}
              paginationAutoPageSize={true}
              onSelectionChanged={onSelectionChanged}
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

export default IntermediaryGrid;

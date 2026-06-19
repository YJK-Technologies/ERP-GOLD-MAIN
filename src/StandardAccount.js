
import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
//import "./grid.css"
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import { showConfirmationToast } from './ToastConfirmation';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import labels from "./Labels";
const config = require('./Apiconfig');

const StandardAcc = () => {


    const [rowData, setRowData] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const navigate = useNavigate();
    const [editedData, setEditedData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [drop, setDrop] = useState([]);
    const [condrop, setCondrop] = useState([]);
    const [statedrop, setStatedrop] = useState([]);
    const [statusdrop, setStatusdrop] = useState([]);
    const [statusgriddrop, setStatusGriddrop] = useState([]);
    const [city, setCity] = useState("");
    const [state, setState] = useState(""); // Set default state value
    const [pincode, setPincode] = useState("");
    const [country, setCountry] = useState("");
    const [status, setStatus] = useState("");
    const [Locationdrop, setLocationdrop] = useState("")
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [base_accgroup_code, setbase_accgroup_code] = useState("");
    const [base_accgroup_name, setbase_accgroup_name] = useState("");
    const [standard_accgroup_code, setstd_acc_code] = useState("");
    const [standard_accgroup_name, setstd_accgroup_name] = useState("");
    const [user_accgroup_to, setuser_acc_code] = useState("");
    const [deletePermission, setdel_per] = useState("");
    const [user_accgroup_from, seuser_accgroup_from] = useState("");

    const [createdBy, setCreatedBy] = useState("");  
    const [modifiedBy, setModifiedBy] = useState(""); 
    const [createdDate, setCreatedDate] = useState(""); 
    const [modifiedDate, setModifiedDate] = useState("");
    
    //code added by Pavun purpose of set user permisssion
     const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
     const companyPermissions = permissions
     .filter(permission => permission.screen_type === 'Company')
     .map(permission => permission.permission_type.toLowerCase());
   
   
    /*testing for search criteria*/
    /* const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [editedData, setEditedData] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");*/
  
    // useEffect(() => {
    //   fetchData();
    // }, []);
  
    // const fetchData = async () => {
    //    try {
    //      const response = await fetch("http://localhost:5500/search ");
    //     const jsonData = await response.json();
    //     setRowData(jsonData);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //    }
    // };
  
  
  
      useEffect(() => {
        fetch(`${config.apiBaseUrl}/locationno`)
          .then((response) => response.json())
          .then((data) => {
            // Extract city names from the fetched data
            const LocationOption = data.map(option => option.location_no);
            setLocationdrop(LocationOption);
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
      })        .then((response) => response.json())
        .then((data) => {
          // Extract city names from the fetched data
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
  
  
    // useEffect(() => {
    //   fetch(`${config.apiBaseUrl}/city`)
    //     .then((data) => data.json())
    //     .then((val) => setDrop(val));
    // }, []);
    // useEffect(() => {
    //   fetch(`${config.apiBaseUrl}/country`)
    //     .then((data) => data.json())
    //     .then((values) => setCondrop(values));
    // }, []);
    // useEffect(() => {
    //   fetch(`${config.apiBaseUrl}/state`)
    //     .then((data) => data.json())
    //     .then((val) => setStatedrop(val));
    // }, []);
  
    // useEffect(() => {
    //   fetch(`${config.apiBaseUrl}/status`)
    //     .then((data) => data.json())
    //     .then((val) => setStatusdrop(val));
    // }, []);
  
  
    const handleCompanyNoChange = (event) => {
        setbase_accgroup_code(event.target.value);
    };
  
    const handleCompanyNameChange = (event) => {
        setbase_accgroup_name(event.target.value);
    };
  
    const handlecityChange = (event) => {
      setCity(event.target.value);
    };
  
    const handlestateChange = (event) => {
      setState(event.target.value);
    };
  
  
  
    const handlesetPincodeChange = (event) => {
      setPincode(event.target.value);
    };
  
    const handleCountryChange = (event) => {
      setCountry(event.target.value);
    };
  
    const handleStatusChange = (event) => {
      setStatus(event.target.value);
    };
  
    const reloadGridDatas = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/reloadGridData`); // Replace with the actual endpoint to reload grid data
        if (response.ok) {
          const gridData = await response.json();
          setRowData(gridData);
          console.log("Grid data reloaded successfully");
        } else {
          console.error("Failed to reload grid data");
          toast.error("Failed to reload grid data. Please try again later")
        }
      } catch (error) {
        console.error("Error reloading grid data:", error);
        toast.error("Failed to reload grid data. Please try again later")
      }
    };
  
    const handleSearch = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getstandardsearchdata`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({standard_accgroup_code, base_accgroup_code, base_accgroup_name,user_accgroup_from	,user_accgroup_to,deletePermission, status }) // Send company_no and company_name as search criteria
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
          console.log("Bad request");
          toast.error("An error occurred. Please try again later")

        } // Log the message for other errors
  
      } catch (error) {
        console.error("Error fetching search data:", error);
        toast.error("Failed to reload grid data. Please try again later")
      }
    };
  
    const reloadGridData = () => {
      window.location.reload();
    };
  
  
  
  
    const columnDefs = [
  
      {
        headerCheckboxSelection: true,
        headerName: "Std Account",
        field: "standard_accgroup_code",
        cellStyle: { textAlign: "left" },
        // minWidth: 150,
        checkboxSelection: true,
        cellEditorParams: {
          maxLength: 18,
        },
  
      },
      {
        headerName: "Std Account Name",
        field: "standard_accgroup_name",
        editable: true,
        cellStyle: { textAlign: "left" },
        // minWidth: 150,
        cellEditorParams: {
          maxLength: 250,
        },
      },
      {
        headerName: "Base Account Name",
        field: "base_accgroup_code",
        editable: true,
        cellStyle: { textAlign: "left" },
        // minWidth: 150,
        cellEditorParams: {
          maxLength: 250,
        },
      },
      {
        headerName: "User Acc Group From ",
        field: "user_accgroup_from",
        editable: true,
        cellStyle: { textAlign: "left" },
        // minWidth: 150,
        cellEditorParams: {
          maxLength: 250,
        },
      },
      {
        headerName: "User Acc Group To ",
        field: "user_accgroup_to",
        editable: true,
        cellStyle: { textAlign: "left" },
        // minWidth: 150,
        cellEditorParams: {
          maxLength: 250,
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
      {
        headerName: "Del Permission ",
        field: "deletePermission",
        editable: true,
        cellStyle: { textAlign: "left" },
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
      flex: 1,
      // filter: true,
      // floatingFilter: true,
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
          /* Date: moment(row.expenses_date).format("YYYY-MM-DD"),
          Type: row.expenses_type,
          Expenditure: row.expenses_amount,
          "Spent By": row.expenses_spentby,
          Remarks: row.remarks,*/
          " Standard Account ": row.company_no,
          " Standard Account Name": row.company_name,
          " Base Account Code": row.company_name,
          " User Account Group From": row.company_name,
          "  User Account Group To": row.company_name, 
            Status: row.status,
          "created by": row.created_by,
          "created date": row.created_date,
          "modfied by": row.modfied_by,
          "modfied date": row.modfied_date,
        };
      });
  
      const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Sandard Account</title>");
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
    reportWindow.document.write("<h1><u>Standard Account Details</u></h1>");
  
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
      navigate("/AddStandardAccount", { selectedRows }); // Pass selectedRows as props to the Input component
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
        (row) => row.standard_accgroup_code === params.data.standard_accgroup_code && row.standard_accgroup_name === params.data.standard_accgroup_name // Use the unique identifier 
      );
      if (rowIndex !== -1) {
        updatedRowData[rowIndex][params.colDef.field] = params.newValue;
        setRowData(updatedRowData);
  
        // Add the edited row data to the state
        setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
      }
    };
  
  
    const saveEditedData = async () => {

      const selectedRowsData = editedData.filter(row =>
        selectedRows.some(selectedRow => selectedRow.standard_accgroup_code === row.standard_accgroup_code && selectedRow.standard_accgroup_name === row.standard_accgroup_name));

    
  
        if (selectedRowsData.length === 0) {
          toast.warning("Please select and modify at least one row to update its data")
          return;
        }

          showConfirmationToast(
                      "Are you sure you want to update the data in the selected rows?",
                      async () => {
        try {
          const modified_by = sessionStorage.getItem('selectedUserCode');
          // Filter the editedData state to include only the selected rows
    
          const response = await fetch(`${config.apiBaseUrl}/updStdAccGrp`, {
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
                                    toast.warning(errorResponse.message || "Failed to Update data");
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
  const standard_accgroup_codeToDelete = selectedRows.map((row) => row.standard_accgroup_code);
  const standard_accgroup_nameToDelete = selectedRows.map((row) => row.standard_accgroup_name);

         showConfirmationToast(
               "Are you sure you want to Delete the data in the selected rows?",
               async () => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/deleteStdAccGrp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Modified-By": modified_by
      },
      body: JSON.stringify({ standard_accgroup_codeToDelete, standard_accgroup_nameToDelete }),
      "modified_by": modified_by  // Corrected the key name to match the server-side expectation
    });
  
      if (response.ok) {
                            console.log("Rows deleted successfully:", standard_accgroup_codeToDelete,standard_accgroup_nameToDelete);
                            setTimeout(() => {
                              toast.success("Data Deleted successfully")
                              handleSearch();
                            }, 1000);
                          } else {
                            const errorResponse = await response.json();
                            toast.warning(errorResponse.message || "Failed to delete data");
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
              <ToastContainer position="top-right" className="toast-design" theme="colored" />
    <div align="right">
    <div className="shadow-lg p-1 bg-body-tertiary rounded">
        <div class="d-flex justify-content-between "  > 
        <div className="purbut"><h1 align="left" class="" >
      Standard Account
    </h1></div>



    <div class="d-flex purbut me-3">
        {['add', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
        <addbutton class="purbut"  onClick={handleNavigateToForm} 
          required title="Add Company"> <i class="fa-solid fa-user-plus"></i> 
           </addbutton>
            )}
             {['delete', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
        <delbutton  onClick={deleteSelectedRows}  required title="Delete">
          <i class="fa-solid fa-user-minus"></i>
        </delbutton>
          )}
           {['update', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
        <savebutton  onClick={saveEditedData}  class="purbut"  required title="Update"><i class="fa-solid fa-floppy-disk"></i></savebutton>
         )}
        

          {['all permission', 'view'].some(permission => companyPermissions.includes(permission)) && (
        <printbutton  onClick={generateReport} class="purbut"  required title="Generate Report"> <i class="fa-solid fa-print"></i></printbutton>
      )}
</div>



    <div className="mobileview">
      
      <div class="d-flex justify-content-between">

      <div className="d-flex justify-content-start ">
      <h1 className="h1" style={{ textAlign: "left"}}>
       Standard Account 
      </h1>
      </div> 
    
    <div className="d-flex justify-content-end mt-3 me-5">
    <div class="dropdown">
    <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    <i class="fa-solid fa-list"></i>
    </button>
          
          <ul class="dropdown-menu">
           
          <li class="iconbutton d-flex justify-content-center text-success">
              {['add', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
                   <icon
                   class="icon"
                   onClick={handleNavigateToForm}
                 > 
                 <i class="fa-solid fa-user-plus"></i>
                   {" "}
                 </icon>
                  )}
                </li>

                <li class="iconbutton  d-flex justify-content-center text-danger">
                {['delete', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
                      <icon
                      class="icon"
                      onClick={deleteSelectedRows}
                    >
                    
            <i class="fa-solid fa-user-minus"></i>
                    </icon>
                  )}
                </li>
                <li class="iconbutton  d-flex justify-content-center text-primary ">                  {['update', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
                     <icon
                     class="icon"
                     onClick={saveEditedData}
                   >
                   <i class="fa-solid fa-floppy-disk"></i>
                   </icon>
                  )}
                </li>
                <li class="iconbutton  d-flex justify-content-center ">
                {['all permission', 'view'].some(permission => companyPermissions.includes(permission)) && (
                     <icon
                     class="icon"
                     onClick={generateReport}
                   >
                    
           <i class="fa-solid fa-print"></i>
                   </icon>
                  )}
              </li>
          </ul></div></div></div></div>
       
       </div></div>
       

        
       
        <div className="shadow-lg p-1 mt-2 pt-3 pb-4 bg-body-tertiary rounded" >
         
        <div className="row  ms-4 mt-1 mb-3 me-4">
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                
              <label for="cname" class="exp-form-labels">
                 Standard Account 
                </label>
                <input
                  id="cno"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the company number here"
                  value={standard_accgroup_code	}
                  onChange={(e) => setstd_acc_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={18}
                />
                
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
              <label for="cname" class="exp-form-labels">
              Standard Account Name
                </label>
                <input
                  id="cname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the company name here"
                  value={standard_accgroup_name}
                  onChange={(e) => setstd_accgroup_name(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />
                
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
              <label for="cname" class="exp-form-labels">
              Base Account Code
                </label>
                <input
                  id="cname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the company name here"
                  value={base_accgroup_code}
                  onChange={(e) => setbase_accgroup_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />
                
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
              <label for="cname" class="exp-form-labels">
             User Account Group From
                </label>
                <input
                  id="cname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the company name here"
                  value={user_accgroup_from}
                  onChange={(e) => seuser_accgroup_from(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />
                
              </div>
            </div>

            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
              <label for="cname" class="exp-form-labels">
              User Account Group To
                </label>
                <input
                  id="cname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the company name here"
                  value={user_accgroup_to}
                  onChange={(e) => setuser_acc_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />
                
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
              <label  class="exp-form-labels">
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
        <div className="col-md-2 form-group mt-4">
        <div class="exp-form-floating">
            <div class=" d-flex justify-content-center"> 
          
           <div class=''>
           <icon className="popups-btn fs-6 p-3"  onClick={handleSearch}required title="Search"><i className="fas fa-search"></i></icon></div>
           <div>
           <icon className="popups-btn fs-6 p-3"  onClick={reloadGridData}required title="Refresh"><FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" /></icon></div>
           </div> 
           </div>
            </div>
        </div>   
          
          
           {/* <p >Result Set</p> */}
       
        
       
       
      <div class="">
        <div class="ag-theme-alpine"  style={{height: 550, width:"100%"}}>
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
          /></div>
        </div>
      </div></div>
      
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
    {labels.modifiedBy}: {modifiedBy }
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
    
  

    

   

  


export default StandardAcc ;
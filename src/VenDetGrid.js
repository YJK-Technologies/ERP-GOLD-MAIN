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
import { ToastContainer, toast } from "react-toastify";
import CompanyImagePopup from './CompanyImageHelp'
import { showConfirmationToast } from './ToastConfirmation';
import LoadingScreen from './Loading';

function VenDetGrid() {
  const [editedData, setEditedData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [vendor_code, setvendor_code] = useState("");
  const [vendor_name, setvendor_name] = useState("");
  const [panno, setpanno] = useState("");
  const [vendor_gst_no, setvendor_gst_no] = useState("");
  const [vendor_addr_1, setvendor_addr_1] = useState("");
  const [vendor_area_code, setvendor_area_code] = useState("");
  const [vendor_state_code, setvendor_state_code] = useState("");
  const [vendor_country_code, setvendor_country_code] = useState("");
  const [vendor_mobile_no, setvendor_mobile_no] = useState("");
  const [status, setstatus] = useState("");
  const [drop, setDrop] = useState([]);
  const [condrop, setCondrop] = useState([]);
  const [statedrop, setStatedrop] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [statusgriddrop, setStatusGriddrop] = useState([]);
  const [companygriddrop, setCompanyGriddrop] = useState([]);
  const [transactiongriddrop, setTransactionGriddrop] = useState([]);
  const [salesgriddrop, setSalesGriddrop] = useState([]);
  const [brokergriddrop, setBrokerGriddrop] = useState([]);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const config = require('./Apiconfig');
  const [loading, setLoading] = useState(false);    
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const location = useLocation();

  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const vendorDetPermission = permissions
    .filter(permission => permission.screen_type === 'Vendor')
    .map(permission => permission.permission_type.toLowerCase());

    useEffect(() => {
          if (location.state?.preservedRowData) {
            setRowData(location.state.preservedRowData);
          }
        
          if (location.state?.preservedInputs) {
            setvendor_code(location.state.preservedInputs.vendor_code || "");
            setvendor_name(location.state.preservedInputs.vendor_name || "");
            setpanno(location.state.preservedInputs.panno || "");
            setvendor_gst_no(location.state.preservedInputs.vendor_gst_no || "");
            setvendor_addr_1(location.state.preservedInputs.vendor_addr_1 || "");
            setvendor_area_code(location.state.preservedInputs.vendor_area_code || "");
            setvendor_state_code(location.state.preservedInputs.vendor_state_code || "");
            setvendor_country_code(location.state.preservedInputs.vendor_country_code || "");
            setvendor_mobile_no(location.state.preservedInputs.vendor_mobile_no || "");
            setstatus(location.state.preservedInputs.status || "");
        
            if (location.state.preservedInputs.status) {
              setSelectedStatus({
                label: location.state.preservedInputs.status,
                value: location.state.preservedInputs.status,
              });
            }
          }
        }, [location.state]);

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
        // Extract city names from the fetched data
        const statusOption = data.map(option => option.attributedetails_name);
        setStatusGriddrop(statusOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/Companyno`)
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const statusOption = data.map(option => option.company_no);
        setCompanyGriddrop(statusOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/trcode`)
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const statusOption = data.map(option => option.keyfield);
        setTransactionGriddrop(statusOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/smcode`)
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const statusOption = data.map(option => option.keyfield);
        setSalesGriddrop(statusOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/brcode`)
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const statusOption = data.map(option => option.attributedetails_name);
        setBrokerGriddrop(statusOption);
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
        // Extract city names from the fetched data
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
        // Extract city names from the fetched data
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
        // Extract city names from the fetched data
        const States = data.map(option => option.attributedetails_name);
        setStatedrop(States);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const filteredOptionStatus = [{ value: 'All', label: 'All' }, ...statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }))];

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setstatus(selectedStatus ? selectedStatus.value : '');
       
  };


  const reloadGridData = () => {
    try {
      window.location.reload();
    } catch (error) {
      console.error("Error reloading grid data:", error);
      toast.error("An error occurred while reloading grid data. Please try again later")
    }
  };

  const clearInputFields = () => {
setvendor_code("");
setvendor_name("");
setpanno("");
setvendor_gst_no("");
setvendor_addr_1("");
setvendor_area_code("");
setvendor_state_code("");
setvendor_country_code("");
setvendor_mobile_no("");
setstatus("");
setSelectedStatus("");
    setRowData([]);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/vendorsearchdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), vendor_code, vendor_name, panno, vendor_gst_no, vendor_addr_1, vendor_area_code, vendor_state_code, vendor_country_code, vendor_mobile_no, status })
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("Data fetched successfully");
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
      headerName: "Code",
      field: "vendor_code",
      cellClass: "ag-link-cell",
      //editable: true,
      cellStyle: { textAlign: "left" },
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
      headerName: "Name",
      field: "vendor_name",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Company Code",
      field: "company_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: companygriddrop,
      },
    },
    {
      headerName: "Address1",
      field: "vendor_addr_1",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address2",
      field: "vendor_addr_2",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address3",
      field: "vendor_addr_3",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address4",
      field: "vendor_addr_4",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "City",
      field: "vendor_area_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: drop,

      },

    },
    {
      headerName: "State",
      field: "vendor_state_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: statedrop,


      },
    },
    {
      headerName: "Country",
      field: "vendor_country_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: condrop,
      },
    },
    {
      headerName: "Status",
      field: "status",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: statusgriddrop,
      },
    },
    {
      headerName: "Pan No",
      field: "panno",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 18,
      },
    },
    {
      headerName: "GST No",
      field: "vendor_gst_no",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 15,
      },
    },
    {
      headerName: "IMEX No",
      field: "vendor_imex_no",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Office No",
      field: "vendor_office_no",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Residential No",
      field: "vendor_resi_no",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Mobile No",
      field: "vendor_mobile_no",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Fax No",
      field: "vendor_fax_no",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 250,
      // maxWidth: 250,
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Email ID",
      field: "vendor_email_id",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {

      headerName: "Credit Limit",
      field: "vendor_credit_limit",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Transport Code",
      field: "vendor_transport_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: transactiongriddrop,
      },
    },
    {
      headerName: "Salesman Code",
      field: "vendor_salesman_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: salesgriddrop,
      },
    },
    {
      headerName: "Broker Code",
      field: "vendor_broker_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      // valueFormatter: (params) => {
      //   return params.value ? params.value.toUpperCase() : '';
      // },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: brokergriddrop,
      },
    },
    {
      headerName: "Weekday Code",
      field: "vendor_weekday_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: "Keyfield",
      field: "keyfield",
      hide: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 10,
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
        "Vendor Code": row.vendor_code,
        "Vendor Name": row.vendor_name,
        "Company Code": row.company_code,
        "Vendor Address1": row.vendor_addr_1,
        "Vendor Address2": row.vendor_addr_2,
        "Vendor Address3": row.vendor_addr_3,
        "Vendor Address4": row.vendor_addr_4,
        "City": row.vendor_area_code,
        "State": row.vendor_state_code,
        "Country": row.vendor_country_code,
        "Status": row.status,
        "Pan No": row.panno,
        "Gst No": row.vendor_gst_no,
        "Vendor IMEX No": row.vendor_imex_no,
        "Vendor Office No": row.vendor_office_no,
        "Vendor Residential No": row.vendor_resi_no,
        "Mobile No": row.vendor_mobile_no,
        "Fax No": row.vendor_fax_no,
        "Email ID": row.vendor_email_id,
        "Credit Limit": row.vendor_credit_limit,
        "Transport Code": row.vendor_transport_code,
        "Salesman Code": row.vendor_salesman_code,
        "Break Code": row.vendor_broker_code,
        "Weekday Code": row.vendor_weekday_code,
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Vendor</title>");
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
    reportWindow.document.write("<h1><u>Vendor Information</u></h1>");

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
    navigate("/AddVendorDetails", { state: { mode: "create" } }); // Pass selectedRows as props to the Input component
  };
  const handleNavigateWithRowData = (selectedRow) => {
  navigate("/AddVendorDetails", {
    state: {
      mode: "update",
      selectedRow,

      preservedRowData: rowData,

      preservedInputs: {
        vendor_code,
        vendor_name,
        panno,
        vendor_gst_no,
        vendor_addr_1,
        vendor_area_code,
        vendor_state_code,
        vendor_country_code,
        vendor_mobile_no,
        status,
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
      (row) => row.vendor_code === params.data.vendor_code && row.company_code === params.data.company_code && row.keyfield == params.data.keyfield
    );
  
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);
  
      setEditedData((prevData) => {
        const existingIndex = prevData.findIndex(
          (item) => item.vendor_code === params.data.vendor_code && item.company_code === params.data.company_code && item.keyfield == params.data.keyfield
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
    const modified_by = sessionStorage.getItem('selectedUserCode');
    //const company_code = sessionStorage.getItem('selectedCompanyCode');
    // Filter the editedData state to include only the selected rows
    const selectedRowsData = editedData.filter(row =>
      selectedRows.some(selectedRow =>
        selectedRow.vendor_code === row.vendor_code && selectedRow.company_code === row.company_code
      )
    );

    if (selectedRowsData.length === 0) {
      toast.warning("Please select and modify at least one row to update its data");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        setLoading(true);
        try {


          const response = await fetch(`${config.apiBaseUrl}/updvendordetData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": modified_by,
              //"company-code": company_code
            },
            body: JSON.stringify({
              vendor_codesToUpdate: selectedRowsData.map(row => row.vendor_code),
              company_codesToUpdate: selectedRowsData.map(row => row.company_code),
              updatedData: selectedRowsData
            }),
          });

          if (response.status === 200) {
            setTimeout(() => {
              toast.success("Data Updated Successfully")
              handleSearch();
            }, 3000);
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
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    // const keyfieldsToDelete = selectedRows.map((row) => row.keyfield);
    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${config.apiBaseUrl}/deleteVendorData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": modified_by,
              "company-code": company_code,

            },
            body: JSON.stringify({ keyfieldsToDelete:selectedRows }),
            "modified_by": modified_by  // Corrected the key name to match the server-side expectation
          });

          if (response.ok) {
            setTimeout(() => {
              toast.success("Data Deleted successfully")
              handleSearch();
            }, 3000);

          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert sales data");
          }
        } catch (error) {
          console.error("Error deleting rows:", error);
          toast.error('Error Deleting Data: ' + error.message);
        }finally {
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
                Vendor
              </h1></div>


            <div className="d-flex justify-content-end purbut me-3">
              {['add', 'all permission'].some(permission => vendorDetPermission.includes(permission)) && (
                <addbutton className="" onClick={handleNavigatesToForm}
                  required title="Add Vendor"> <i class="fa-solid fa-user-plus"></i> </addbutton>
              )}
              {['delete', 'all permission'].some(permission => vendorDetPermission.includes(permission)) && (
                <delbutton
                  className="purbut"
                  onClick={deleteSelectedRows}
                  required
                  title="Delete"
                >
                  <i class="fa-solid fa-user-minus"></i>
                </delbutton>
              )}
              {['update', 'all permission'].some(permission => vendorDetPermission.includes(permission)) && (
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
              {['all permission', 'view'].some(permission => vendorDetPermission.includes(permission)) && (
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
                <div className="d-flex justify-content-start ">
                  <h1 align="left" className="h1">Vendor </h1>
                </div>
                <div class="dropdown mt-1 me-5">
                  <button
                    class="btn btn-primary dropdown-toggle p-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="fa-solid fa-list"></i>
                  </button>

                  <ul class="dropdown-menu ">
                    <li class="iconbutton d-flex justify-content-center text-success">
                      {['add', 'all permission'].some(permission => vendorDetPermission.includes(permission)) && (
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
                      {['delete', 'all permission'].some(permission => vendorDetPermission.includes(permission)) && (
                        <icon
                          class="icon"
                          onClick={deleteSelectedRows}
                        >

                          <i class="fa-solid fa-user-minus"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-primary ">
                      {['update', 'all permission'].some(permission => vendorDetPermission.includes(permission)) && (
                        <icon
                          class="icon"
                          onClick={saveEditedData}
                        >
                          <i class="fa-solid fa-floppy-disk"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center ">
                      {['all permission', 'view'].some(permission => vendorDetPermission.includes(permission)) && (
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
                <label for="vencode" class="exp-form-labels">
                  Code
                </label><input
                  id="vencode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the code here"
                  value={vendor_code}
                  onChange={(e) => setvendor_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={18}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="venname" class="exp-form-labels">
                  Name
                </label><input
                  id="venname"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the name here"
                  value={vendor_name}
                  onChange={(e) => setvendor_name(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="panno" class="exp-form-labels">
                  Pan No
                </label> <input
                  id="panno"
                  className="exp-input-field form-control"
                  type="number"
                  placeholder=""
                  required title="Please fill the Pan number here"
                  value={panno}
                  onChange={(e) => setpanno(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={18}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="vengst" class="exp-form-labels">
                  GST No
                </label><input
                  id="vengst"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the GST number here"
                  value={vendor_gst_no}
                  onChange={(e) => setvendor_gst_no(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={15}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="venaddr1" class="exp-form-labels">
                  Address
                </label> <input
                  id="venaddr1"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the address here"
                  value={vendor_addr_1}
                  onChange={(e) => setvendor_addr_1(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={250}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="venarcode" class="exp-form-labels">
                  City
                </label><input
                  id="venarcode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the area code"
                  value={vendor_area_code}
                  onChange={(e) => setvendor_area_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={100}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="venstatcode" class="exp-form-labels">
                  State
                </label><input
                  id="venstatcode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the state code here"
                  value={vendor_state_code}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onChange={(e) => setvendor_state_code(e.target.value)}
                  maxLength={100}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="vencountrycode" class="exp-form-labels">
                  Country
                </label> <input
                  id="vencountrycode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the country code"
                  value={vendor_country_code}
                  onChange={(e) => setvendor_country_code(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={100}
                />

              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="contactno" class="exp-form-labels">
                  Contact No
                </label><input
                  id="contactno"
                  className="exp-input-field form-control"
                  type="number"
                  placeholder=""
                  required title="Please fill the contact number here"
                  value={vendor_mobile_no}
                  onChange={(e) => setvendor_mobile_no(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={20}
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

                  <div class=''><icon className="popups-btn fs-6 p-3" onClick={handleSearch} required title="Search"><i className="fas fa-search"></i></icon></div>
                  <div><icon className="popups-btn fs-6 p-3" onClick={clearInputFields} required title="Reload"><FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" /></icon></div>
                </div> </div></div>





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

export default VenDetGrid;

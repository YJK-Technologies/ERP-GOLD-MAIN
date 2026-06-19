import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const config = require('../Apiconfig');



function HoliDays() {
    const[HolidayDate,setHolidayDate]=useState("");
    const [error, setError] = useState("");
    const[Description,setDescription]=useState("");
    const [rowData, setRowData] = useState([]);
     const [gridColumnApi, setGridColumnApi] = useState(null);
    const [gridApi, setGridApi] = useState(null);
   const [editedData, setEditedData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const[FromDate,setFromDate]=useState("");
    const[ToDate,setToDate]=useState("");


    const columnDefs = [

        {
      headerName: 'S.No',
      field: 'ItemSno',
      maxWidth: 80,
      sortable: false
        },
        {
          headerName: "HolidayDate",
          field: "HolidayDate",
          filter: "agDateColumnFilter",
          editable: true,
          cellStyle: {textAlign: "center"},
          minWidth: 150,
        },
      
        {
          headerName: "Description",
          field: "Description",
          editable: false,
          cellStyle: { textAlign: "center" },
          minWidth: 150,
          cellEditorParams: {
            maxLength: 250,
          },
        }
      
      ]

    const defaultColDef = {
        resizable: true,
        wrapText: true,
        // sortable: true,
        //editable: true,
        flex: 1,
        // filter: true,
        // floatingFilter: true,
      };
    const onRowSelected = (event) => {
        if (event.node.isSelected()) {
        //   handleRowClick(event.data);
        }
      };

      const onSelectionChanged = () => {
        const selectedNodes = gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data);
        setSelectedRows(selectedData);
    
      }

      const onCellValueChanged = (params) => {
        const updatedRowData = [...rowData];
        const rowIndex = updatedRowData.findIndex(
          (row) => row.company_no === params.data.company_no // Use the unique identifier 
        );
        if (rowIndex !== -1) {
          updatedRowData[rowIndex][params.colDef.field] = params.newValue;
          setRowData(updatedRowData);
    
          // Add the edited row data to the state
          setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
        }
      };


      const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
      };
    
      const reloadGridData = () => {
        window.location.reload();
      };

       const handleSearch = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/companysearchcriteria`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({HolidayDate,Description}) 
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log(searchData)
        console.log("data fetched successfully")
      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("Error fetching search data:", error);
    }
  };

const handleSave = async () => {
    // Validate required fields
    if (
      !HolidayDate ||
      !Description
     
    ) {
       setError(" ");
           toast.warning("Error: Missing required fields");
            return;
    }
    try {
      const Header = {
        HolidayDate:HolidayDate,
        Description:Description,
        created_by: sessionStorage.getItem('selectedUserCode'),
      };

      const response = await fetch(`${config.apiBaseUrl}/addEmployeeHoliday`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });
  
      if (response.status === 200) {
        console.log("Data inserted successfully");
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(),
          });
        }, 1000);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert announcement data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const handleUpdate = async () => {
try{
    const Header = {
      HolidayDate:HolidayDate,
      Description:Description,
      modified_by: sessionStorage.getItem('selectedUserCode'),
    };
    const response = await fetch(`${config.apiBaseUrl}/updateEmployeeHoliday `, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Header),
    });

    if (response.status === 200) {
      console.log("Data updated successfully");
      setTimeout(() => {
        toast.success("Data updated successfully!", {
          onClose: () => window.location.reload(),
        });
      }, 1000);
    } else {
      const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
  } catch (error) {
    console.error("Error inserting data:", error);
    toast.error('Error inserting data: ' + error.message);
  }

};

// useEffect(()=>{
//   FetchData();
//   },[])
//   const FetchData=async (startRow, endRow)=>{
// try{
//   const response =await Fetch (
//     $ {config.apiBaseUrl}? startRow ={startRow=$}
//   )
// }
//   }
// }



    return (
 <div className="container-fluid Topnav-screen">
      <div>
        <ToastContainer position="top-right" className="toast-design" theme="colored" />
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
          <div className=" d-flex justify-content-between  ">
            <div class="d-flex justify-content-start">
              <h1 align="left" className="purbut"> Employee Holiday

              </h1>
            </div>
            
            </div>
            </div>
            <div className="shadow-lg p-3 bg-light rounded-bottom  mb-2">
              <div class="row">
                
            <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        Holiday Date
                      </label></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please enter the founded date"
                      value={HolidayDate}
                
                      onChange={(e) => setHolidayDate(e.target.value)}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                    />
                    {error && !HolidayDate && <div className="text-danger">HolidayDate should not be blank</div>}
                  </div>
                
            
            </div>

            <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="cname" class="exp-form-labels">
                      Description
                      </label></div>
                      <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the founded date"
                      value={Description}
                      onChange={(e) => setDescription(e.target.value)}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                    //   onKeyDown={handleKeyPress}
                    />
                    {error && !Description && <div className="text-danger"> Announcement ID should not be blank</div>}
                  </div>
                </div>


                <div class="col-md-3 form-group d-flex justify-content-start mt-4 mb-4">
                 
                 <button  onClick={handleSave} className=""  title="Save">
                 Save
                 </button>

                 <button onClick={handleUpdate}  className="" title="Save">
                 update
                 </button>
                </div>


            </div>
          
           
        
</div>
<div className="shadow-lg p-3 bg-light rounded-bottom  mb-2">
              <div class="row">
<div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        From Date
                      </label></div>
                    </div>
                    <input
                      id="FromDate"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please enter the founded date"
                      value={FromDate}
                      // ref={found}
                      onChange={(e) => setFromDate(e.target.value)}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                    />
                    {error && !FromDate && <div className="text-danger">FromDate should not be blank</div>}
                  </div>
                  </div>

              
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        To Date
                      </label></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please enter the founded date"
                      value={ToDate}
                      onChange={(e) =>setToDate(e.target.value)}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                  />
                    {error && !ToDate && <div className="text-danger">ToDate should not be blank</div>}
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="cname" class="exp-form-labels">
                      Description
                      </label></div>
                      <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the founded date"
                      value={Description}
                      onChange={(e) => setDescription(e.target.value)}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                    //   onKeyDown={handleKeyPress}
                    />
                    {error && !Description && <div className="text-danger"> Announcement ID should not be blank</div>}
                  </div>
                </div>
                <div className="col-md-3 form-group mt-4">
            <div class="exp-form-floating">
              <div class=" d-flex  justify-content-center">

            <div class=''>
              <icon className=" text-dark popups-btn fs-6" 
              onClick={handleSearch}
              required title="Search">
                <i class="fa-solid fa-magnifying-glass">
                  </i></icon>
                  </div>

                  <div><icon 
                  className=" popups-btn text-dark fs-6" 
                  onClick={reloadGridData} 
                  required title="Refresh">
                  <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" /></icon></div>
                  </div>
                  </div>
                  </div>

                </div>
                </div>
                
              
  

{/* <div className="shadow-lg p-3 bg-light rounded-bottom  mb-2">
              <div class="row">


              </div>
              </div> */}


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
          /></div>
</div>
</div>
    )


}

export default  HoliDays;
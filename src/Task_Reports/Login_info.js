import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';


const MyAgGridComponent = () => {
  const [rowData] = useState([
    { taskTitle: 'Task 1', user: 'User 1', description: 'Task 1 description', startDate: '2025-02-01', endDate: '2025-02-05', estimatedHours: 8, bufferHours: 2, totalHours: 10, taskStatus: 'Completed' },
    { taskTitle: 'Task 2', user: 'User 2', description: 'Task 2 description', startDate: '2025-02-02', endDate: '2025-02-06', estimatedHours: 10, bufferHours: 3, totalHours: 13, taskStatus: 'In Progress' },
    { taskTitle: 'Task 3', user: 'User 3', description: 'Task 3 description', startDate: '2025-02-03', endDate: '2025-02-07', estimatedHours: 5, bufferHours: 1, totalHours: 6, taskStatus: 'Not Started' },
  ]);

  const columnDefs = [
    { headerName: 'Project Name', field: 'taskTitle' },
    { headerName: 'Task Title ', field: 'user' },
    { headerName: 'Daily Task Title ', field: 'taskTitle' },
    { headerName: 'Spend Hours', field: 'startDate' },
    { headerName: 'Description', field: 'description' },

    { headerName: 'Status', field: 'Status' },

   
  ];

  const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
  };

  return (
     <div class="container-fluid Topnav-screen ">
          <div className="">
            <div class="">
              <ToastContainer
                position="top-right"
                className="toast-design" // Adjust this value as needed
                theme="colored"
              />



<div className=" p-0 shadow-lg bg-white rounded mb-2">
          <div className="purbut mb-0 d-flex justify-content-between">
        <h1 align="left" className="">

                            Employee Details      
                            
                            </h1>
                            </div>
                            </div>
        <div className=" p-0 shadow-lg bg-white rounded">

            <div className='row ms-4 pt-3 mb-2'>
                <div className='col-md-3 form-group'>
                    <div className='exp-form-floating'>
                    <label>Start Date</label>
                    <input
                        type='date' 
                        className='exp-input-field p-1'
                        />
                </div></div>
                <div className='col-md-3 form-group'>
                <div className='exp-form-floating'>
                    <label>End Date</label>
                    <input
                        type='date' 
                        className='exp-input-field p-1'
                        />
                </div>
                </div>
            </div>

<div className='pt-3 pb-3'>
    <div className="ag-theme-alpine" style={{ height: 300, width: '90%' }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        gridOptions={gridOptions}
        
      />
    </div>
    </div>
    </div>
    <div className=" p-0  bg-white rounded-top  mt-2">
          <div className="purbut mb-0 d-flex justify-content-between">
        <h1 align="left" className="">
                            Task hours & Time Tracking   
                             </h1>
                             </div>
                             </div>
                            <div className=" p-0  bg-white  mb-2">
    <div className='pt-3 pb-3'>
    <div className="ag-theme-alpine" style={{ height: 300, width: '90%' }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        gridOptions={gridOptions}
        
      />
    </div>
    </div>
    </div>
   
    </div>  </div></div>
  );
};

export default MyAgGridComponent;

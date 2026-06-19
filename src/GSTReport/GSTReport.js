import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "../apps.css";
import '../App.css';
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../test.css";
import LoadingScreen from '../Loading';

const config = require('../Apiconfig');


function Grid() {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [periodDrop, setPeriodDrop] = useState([]);
  const [taxDrop, setTaxDrop] = useState([]);
  const [partyDrop, setPartyDrop] = useState([]);
  const [period, setPeriod] = useState(null);
  const [tax, setTax] = useState(null);
  const [party, setParty] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedTax, setSelectedTax] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [start_Date, setStart_Date] = useState('');
  const [end_Date, setEnd_Date] = useState('');
  const companyName = sessionStorage.getItem('selectedCompanyName');
  const [loading, setLoading] = useState(false);

  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const companyPermissions = permissions
    .filter(permission => permission.screen_type === 'GSTReport')
    .map(permission => permission.permission_type.toLowerCase());


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDateRange`)
      .then((data) => data.json())
      .then((val) => {
        setPeriodDrop(val);

        if (val.length > 0) {
          const firstOption = {
            value: val[4].Sno,
            label: val[4].DateRangeDescription,
          };
          setSelectedPeriod(firstOption);
          setPeriod(firstOption.value);
        }
      });
  }, []);

  const filteredOptionPeriod = Array.isArray(periodDrop)
    ? periodDrop.map((option) => ({
      value: option.Sno,
      label: option.DateRangeDescription,
    }))
    : [];

  const handleChangePeriod = (selectedPeriod) => {
    setSelectedPeriod(selectedPeriod);
    setPeriod(selectedPeriod ? selectedPeriod.value : '');
  };

  const fetchGSTReport = () => {
    fetch(`${config.apiBaseUrl}/getGSTReport`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    }).then((data) => data.json())
      .then((val) => {
        setTaxDrop(val);

        setPartyDrop(val);

        if (val.length > 0) {
          const firstTaxOption = {
            value: val[0].attributedetails_name,
            label: val[0].attributedetails_name,
          };
          const firstPartyOption = {
            value: val[0].descriptions,
            label: val[0].descriptions,
          };

          setSelectedTax(firstTaxOption);
          setTax(firstTaxOption.value);
          setSelectedParty(firstPartyOption);
          setParty(firstPartyOption.value);
        }
      });
  };

  useEffect(() => {
    fetchGSTReport();
  }, []);


  const filteredOptionTax = Array.isArray(taxDrop)
    ? taxDrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  const handleChangeTax = (selectedTax) => {
    setSelectedTax(selectedTax);
    setTax(selectedTax ? selectedTax.value : "");

    const updatedPartyOptions = partyDrop.filter(
      (option) => option.attributedetails_name === selectedTax?.value
    );
    if (updatedPartyOptions.length > 0) {
      const firstPartyOption = {
        value: updatedPartyOptions[0].descriptions,
        label: updatedPartyOptions[0].descriptions,
      };
      setSelectedParty(firstPartyOption);
      setParty(firstPartyOption.value);
    } else {
      setSelectedParty(null);
      setParty("");
    }
  };

  const filteredOptionParty = Array.isArray(partyDrop)
    ? partyDrop.map((option) => ({
      value: option.descriptions,
      label: option.descriptions,
    }))
    : [];

  const handleChangeParty = (selectedParty) => {
    setSelectedParty(selectedParty);
    setParty(selectedParty ? selectedParty.value : "");

    const updatedTaxOptions = taxDrop.filter(
      (option) => option.descriptions === selectedParty?.value
    );
    if (updatedTaxOptions.length > 0) {
      const firstTaxOption = {
        value: updatedTaxOptions[0].attributedetails_name,
        label: updatedTaxOptions[0].attributedetails_name,
      };
      setSelectedTax(firstTaxOption);
      setTax(firstTaxOption.value);
    } else {
      setSelectedTax(null);
      setTax("");
    }
  };

  const reloadGridData = () => {
    window.location.reload();
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };


  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Date",
      field: "Date",
      editable: false,
    },
    {
      headerName: "Bill No",
      field: "BillNo",
      editable: true,
    },
    {
      headerName: "Party Name",
      field: "PartyName",
      editable: true,
    },
    {
      headerName: "GST No",
      field: "GSTNo",
      editable: true,
    },
    {
      headerName: "Percentage %",
      field: "Percentage",
      editable: true,
    },
    {
      headerName: "CGST",
      field: "CGST",
      editable: true,
    },
    {
      headerName: "SGST",
      field: "SGST",
      editable: true,
    },
    {
      headerName: "IGST",
      field: "IGST",
      editable: true,
    },
    {
      headerName: "Bill Rate",
      field: "BillRate",
      editable: true,
    },
  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
    // flex: 1,
  };

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

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      return date.toLocaleDateString("en-GB");
    };

    const reportData = selectedRows.map((row) => {
      return {
        "Date": formatDate(row.Date),
        "Bill No": row.BillNo,
        "Party Name": row.PartyName,
        "GST No": row.GSTNo,
        "Percentage %": row.Percentage,
        "CGST": row.CGST,
        "SGST": row.SGST,
        "IGST": row.IGST,
        "Bill Rate": row.BillRate,
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>GST Report</title>");
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
    reportWindow.document.write("<h1><u>GST Report</u></h1>");

    reportWindow.document.write("<table><thead><tr>");
    Object.keys(reportData[0]).forEach((key) => {
      reportWindow.document.write(`<th>${key}</th>`);
    });
    reportWindow.document.write("</tr></thead><tbody>");

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

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);

  };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.company_no === params.data.company_no
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  useEffect(() => {
    if (selectedPeriod?.label === "Custom Date") {
      if (startDate && endDate) {
        fetchGstReport();
      }
    }
    else if (period && party) {
      fetchGstReport();
    }
  }, []);

  const fetchGstReport = async () => {
    setLoading(true);
    try {
      if (selectedPeriod === "Custom Date" && (!startDate || !endDate)) {
        return;
      }

      const body = {
        Mode: period.toString(),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Party: party,
        StartDate: selectedPeriod?.label === "Custom Date" ? startDate : undefined,
        EndDate: selectedPeriod?.label === "Custom Date" ? endDate : undefined,
      };

      const response = await fetch(`${config.apiBaseUrl}/getGstReportAnalysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const fetchedData = await response.json();
        if (fetchedData.length > 0) {
          const firstItem = fetchedData[0];
          setStart_Date(formatDate(firstItem.DateRange_Start) || "");
          setEnd_Date(formatDate(firstItem.DateRange_End) || "");
        }

        const newRows = fetchedData.map((matchedItem) => ({
          Date: formatDate(matchedItem.Date),
          BillNo: matchedItem.BillNo,
          PartyName: matchedItem.PartyName,
          GSTNo: matchedItem.GSTNo,
          Percentage: matchedItem.Percentage.toString(),
          CGST: matchedItem.CGST,
          SGST: matchedItem.SGST,
          IGST: matchedItem.IGST,
          BillRate: matchedItem.BillRate,
        }));

        const totalCGST = newRows.reduce((sum, row) => sum + row.CGST, 0);
        const totalSGST = newRows.reduce((sum, row) => sum + row.SGST, 0);
        const totalIGST = newRows.reduce((sum, row) => sum + row.IGST, 0);
        const totalBillRate = newRows.reduce((sum, row) => sum + row.BillRate, 0);

        // Add the total row
        const totalRow = {
          Date: "",
          BillNo: "",
          PartyName: "",
          GSTNo: "",
          Percentage: "Total",
          CGST: totalCGST,
          SGST: totalSGST,
          IGST: totalIGST,
          BillRate: totalBillRate,
        };

        setRowData([...newRows, totalRow]); // Add total row to grid data
      } else if (response.status === 404) {
        console.log("Data Not Found");
        toast.warning("Data Not Found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDatestart = (e) => {
    e.preventDefault();
    setStartDate(e.target.value);
  };

  const handleCustomDateend = (e) => {
    e.preventDefault();
    setEndDate(e.target.value);
  };

  const transformRowData = (data) => {
    return data.map(row => ({
      "Date": row.Date,
      "Bill No": row.BillNo,
      "Party Name": row.PartyName,
      "GST No": row.GSTNo,
      "Percentage %": row.Percentage,
      "CGST": row.CGST,
      "SGST": row.SGST,
      "IGST": row.IGST,
      "Bill Rate": row.BillRate,
    }));
  };

  const handleExportToExcel = () => {
    if (rowData.length === 0) {
      toast.warning('There is no data to export.');
      return;
    }

    const headerData = [
      ['GST Report Analysis'],
      [`Company Name: ${companyName}`],
      [`Date Range: ${start_Date} to ${end_Date}`],
      []
    ];

    const transformedData = transformRowData(rowData);

    const worksheet = XLSX.utils.aoa_to_sheet(headerData);

    XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GST Report');
    XLSX.writeFile(workbook, 'Gst_Report.xlsx');
  };

  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
          <div className="d-flex justify-content-between ">
            <h1 className='purbut mt-3'>GST Report</h1>
            <div className="mobileview">
              <div className="d-flex justify-content-between ">
                <div className="d-flex justify-content-start ">
                  <h1 className='h1'>GST Report</h1>
                </div>
                <div className="d-flex justify-content-end mt-1 ms-5">
                  <div className="dropdown">
                    <button className="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="fa-solid fa-list"></i>
                    </button>
                    <ul className="dropdown-menu ">
                      <li>
                        <icon class="iconbutton d-flex justify-content-center" onClick={generateReport}>
                          <i className="fa-solid fa-print"></i>
                        </icon>
                      </li>
                      <li>
                        <icon class="iconbutton d-flex justify-content-center" onClick={handleExportToExcel}>
                          <i class="fa-solid fa-file-excel"></i>
                        </icon>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="purbut">
              <div className="d-flex justify-content-end me-5">
                <button className="btn btn-dark mt-3 mb-3 rounded-3" onClick={generateReport}>
                  <i className="fa-solid fa-print"></i>
                </button>
                <button class="btn btn-dark mt-3 mb-3 rounded-3" onClick={handleExportToExcel}>
                  <i class="fa-solid fa-file-excel"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
        <div className="row ms-4 mt-3 mb-3 me-4">
          <div className="col-md-3 form-group">
            <label for="city" class="form-label">Date Range</label>
            <Select
              id="status"
              value={selectedPeriod}
              onChange={handleChangePeriod}
              options={filteredOptionPeriod}
              className="border-secondary"
              placeholder=""
            />
          </div>
          {selectedPeriod && selectedPeriod.label === "Custom Date" && (
            <div className="col-md-5 mb-3">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">From</label>
                  <input
                    type="date"
                    className="form-control border-secondary"
                    value={startDate}
                    onChange={handleCustomDatestart}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">To</label>
                  <input
                    type="date"
                    className="form-control border-secondary"
                    value={endDate}
                    onChange={handleCustomDateend}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="col-md-3">
            <label for="city" class="form-label">Tax</label>
            <Select
              id="status"
              value={selectedTax}
              onChange={handleChangeTax}
              options={filteredOptionTax}
              className="border-secondary"
              placeholder=""
            />
          </div>
          <div className="col-md-3">
            <label class="form-label">
              Party
            </label>
            <Select
              id="status"
              value={selectedParty}
              onChange={handleChangeParty}
              options={filteredOptionParty}
              className="border-secondary"
              placeholder=""
            />
          </div>
          <div className="col-md-1">
            <div class="exp-form-floating">
              <div class=" d-flex justify-content-center mt-4">
                <icon className="popups-btn fs-6 p-3" onClick={fetchGstReport} required title="Search">
                  <i className="fas fa-search"></i>
                </icon>
                {/* <icon className="popups-btn fs-6 p-3" required title="Refresh">
                      <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                    </icon> */}
              </div>
            </div>
          </div>
          <div className="col-md-3 form-group mt-4">
            <div class="exp-form-floating">
              <div class=" d-flex  justify-content-center">

                {/* <div class=''>
                  <icon className=" text-dark popups-btn fs-6" onClick={handleSearch} required title="Search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </icon>
                </div> */}
                {/* <div>
                  <icon className=" popups-btn text-dark fs-6" onClick={reloadGridData} required title="Refresh">
                    <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                  </icon>
                </div> */}
              </div>
            </div>
          </div>
        </div>
        {/* <p >Result Set</p> */}
        <div class="ag-theme-alpine" style={{ height: 455, width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            onSelectionChanged={onSelectionChanged}
            pagination={true}
            paginationAutoPageSize={true}
            rowSelection="multiple"
          />
        </div>
      </div>
    </div>
  );
}

export default Grid;
